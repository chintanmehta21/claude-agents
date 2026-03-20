---
name: IV Regime Classifier
description: This skill should be used when classifying the current India VIX regime (low, medium, high, extreme), filtering strategies by IV suitability, or determining whether a strategy's IV assumptions match current market conditions. Trigger phrases include "IV regime", "India VIX level", "volatility regime", "IV percentile", "VIX classification", "IV suitability", "volatility filter".
version: 1.0.0
---

# IV Regime Classifier — Volatility Regime Classification Skill

## Purpose

Classifies the current India VIX regime using percentile ranking over a rolling lookback window. Filters strategies by IV suitability — strategies designed for high-IV environments should not be deployed in low-IV regimes and vice versa. Provides the IV regime data that gets stored in `shared_context.json` and referenced by all downstream agents.

## Stakeholder

Used by the **Project Lead** during pre-run checks to populate `shared_context.json`. Referenced by **Scouts** when assessing strategy applicability, by **Orchestrators** during enrichment to flag mismatches, and by **Verifiers** in the IV Regime Alignment scoring dimension.

## Instructions

### 1. India VIX Data Acquisition

**Step 1: Fetch current India VIX level**

Use WebSearch or WebFetch to obtain the current India VIX value:

- Search: `"India VIX current level today"`
- Direct sources:
  - NSE: `https://www.nseindia.com/api/allIndices` (look for India VIX entry) `[VERIFY: current NSE API endpoint for VIX]`
  - MoneyControl: `https://www.moneycontrol.com/indian-indices/india-vix-36.html`
  - Google: Search `"India VIX"` for real-time widget

**Step 2: Determine historical percentile**

If historical data is not directly available, estimate the percentile:

- Search: `"India VIX historical data 2024 2025 percentile"`
- Reference known historical ranges:
  - India VIX all-time range: ~8.5 (extreme low) to ~90 (COVID March 2020)
  - Typical range (2022-2025): 10-25
  - Median (approximate): ~13-14 `[VERIFY: empirical source needed — estimated from observed behavior]`

**Step 3: Calculate or estimate 252-day rolling percentile**

```
Percentile = (Number of trading days in last 252 where VIX was below current level) / 252 × 100
```

If exact calculation is not possible, use this estimation table:

| India VIX Level | Estimated 252-day Percentile | Regime |
|----------------|------------------------------|--------|
| < 10 | < 10th | LOW (extreme calm) |
| 10-12 | 10th-25th | LOW |
| 12-14 | 25th-40th | MEDIUM (low end) |
| 14-16 | 40th-55th | MEDIUM |
| 16-18 | 55th-70th | MEDIUM (high end) |
| 18-20 | 70th-80th | HIGH (low end) |
| 20-23 | 80th-88th | HIGH |
| 23-25 | 88th-92nd | HIGH (extreme) |
| 25-30 | 92nd-96th | EXTREME |
| > 30 | > 96th | EXTREME |

`[VERIFY: empirical source needed — these mappings are estimated from historical India VIX distribution 2020-2025 and should be validated against actual percentile calculations]`

### 2. Regime Classification

Assign one of four regimes based on the percentile:

| Regime | Percentile Range | India VIX Approximate Range | Characteristics |
|--------|-----------------|----------------------------|-----------------|
| **LOW** | Below 25th | Below ~12 | Compressed premiums, cheap options, low theta decay. Buying strategies preferred. |
| **MEDIUM** | 25th-60th | ~12-18 | Normal market conditions. Most strategies viable. Balanced buyer/seller environment. |
| **HIGH** | 60th-85th | ~18-25 | Elevated premiums, expensive options. Selling strategies and spreads preferred. Event risk likely elevated. |
| **EXTREME** | Above 85th | Above ~25 | Crisis or major event. Premiums extremely high. Selling strategies very risky (gap risk). Hedging strategies preferred. |

### 3. Strategy-Regime Compatibility Matrix

Use this matrix to flag strategies whose IV environment requirements don't match the current regime:

| Strategy Type | Optimal Regime | Acceptable | Incompatible |
|--------------|----------------|------------|--------------|
| Long Straddle/Strangle | LOW → expecting expansion | LOW, MEDIUM | HIGH, EXTREME (premiums too expensive) |
| Short Straddle/Strangle | HIGH → expecting contraction | HIGH, MEDIUM | LOW (insufficient premium), EXTREME (gap risk) |
| Iron Condor | MEDIUM-HIGH | MEDIUM, HIGH | LOW (tight premiums), EXTREME (breaches likely) |
| Bull/Bear Spreads | All regimes | All | None (but width must adjust to IV) |
| Calendar Spreads | MEDIUM | LOW, MEDIUM, HIGH | EXTREME (term structure inverts) |
| Ratio Spreads | HIGH | MEDIUM, HIGH | LOW (skew insufficient), EXTREME (unlimited risk) |
| Protective Puts | EXTREME/HIGH | All | None (but cost-efficiency varies) |
| IV Crush Plays | HIGH → post-event | HIGH pre-event | LOW (no crush to exploit) |

### 4. Anomalous VIX Behavior Detection

Flag these special situations that invalidate normal regime classification:

| Anomaly | Detection | Impact |
|---------|-----------|--------|
| **Election VIX spike** | VIX > 20 within 2 weeks of known election date | Temporary — may revert quickly post-results. Short-term strategies risky. |
| **Budget VIX spike** | VIX > 18 within 1 week of Union Budget | Temporary — typically mean-reverts within 3-5 sessions post-budget |
| **RBI policy VIX** | VIX movement on MPC meeting day | Usually contained — 1-2 day event premium |
| **Global contagion** | VIX > 25 without domestic catalyst | May persist — check global VIX (CBOE) for correlation |
| **VIX term structure inversion** | Near-term VIX > far-term VIX | Signals acute stress — calendar spreads may fail |

Flag any detected anomaly: `[VIX_ANOMALY: [type] — [description] — regime classification may be unreliable]`

### 5. Output Format

Store the classification in `shared_context.json`:

```json
{
  "india_vix": {
    "current_level": 14.5,
    "percentile_252d": 42,
    "regime": "MEDIUM",
    "regime_detail": "MEDIUM (lower half) — normal market conditions",
    "fetched_at": "2025-03-20T10:30:00+05:30",
    "source": "NSE India VIX via WebSearch",
    "anomalies": [],
    "confidence": "ESTIMATED — exact percentile requires historical dataset"
  }
}
```

### 6. IV Mismatch Flagging

When reviewing a strategy, check its `iv_environment` field against the current regime:

- If strategy requires `HIGH` but current regime is `LOW`: Flag `[IV_MISMATCH — strategy requires HIGH IV, current regime is LOW — confidence penalty applies]`
- If strategy requires `LOW` but current regime is `EXTREME`: Flag `[IV_MISMATCH — strategy requires LOW IV, current regime is EXTREME — confidence penalty applies]`
- Mismatch applies a **-15 point** deduction in the Verifier confidence score

## Changelog

`[Built from scratch — v1.0]`
