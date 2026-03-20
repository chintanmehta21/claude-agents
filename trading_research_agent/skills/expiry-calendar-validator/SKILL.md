---
name: Expiry Calendar Validator
description: This skill should be used when cross-referencing strategy expiry assumptions against the live NSE expiry calendar, checking for discontinued or restructured expiry series, or validating that a strategy targets a currently valid expiry contract. Trigger phrases include "expiry calendar", "validate expiry", "weekly expiry valid", "discontinued expiry", "expiry restructured", "NSE expiry schedule", "Bank Nifty weekly".
version: 1.0.0
---

# Expiry Calendar Validator — Expiry Schedule Verification Skill

## Purpose

Cross-references strategy expiry assumptions against the live NSE/BSE expiry calendar to catch discontinued or restructured expiry series before a strategy reaches the Verifier tier. Critical because SEBI rationalized weekly index derivatives expiries in late 2024, discontinuing several previously popular weekly contracts.

## Stakeholder

Used by **Scouts** when selecting strategies (to avoid picking strategies for discontinued expiries), **Orchestrators** during enrichment, and **Verifiers** during compliance checking. The expiry calendar data is stored in `shared_context.json` by the **Project Lead**.

## Instructions

### 1. Current NSE/BSE Expiry Structure

**CRITICAL CHANGE — SEBI Weekly Expiry Rationalization (2024)**

SEBI mandated that each exchange may offer only ONE weekly index derivatives expiry. This was implemented in phases during late 2024.

`[VERIFY: SEBI Circular — "Measures to Strengthen Index Derivatives Framework" — specific implementation dates and current status]`

**Current expected expiry structure (post-rationalization):**

| Instrument | Exchange | Weekly Expiry | Monthly Expiry | Notes |
|-----------|----------|---------------|----------------|-------|
| Nifty 50 | NSE | Thursday (retained) | Last Thursday | Primary weekly product |
| Bank Nifty | NSE | **Discontinued** | Last Thursday | Was Wednesday, now monthly only `[VERIFY]` |
| Fin Nifty | NSE | **Discontinued** | Last Thursday | Was Tuesday, now monthly only `[VERIFY]` |
| Midcap Nifty | NSE | **Discontinued** | Last Thursday | Was Monday, now monthly only `[VERIFY]` |
| Sensex | BSE | Friday (retained) | Last Friday | BSE's sole weekly product |
| Bankex | BSE | **Discontinued** | Last Friday | Was Monday, now monthly only `[VERIFY]` |

**IMPORTANT:** This table reflects the EXPECTED post-rationalization state. The actual current state must be verified against NSE/BSE circulars before the pipeline relies on it.

### 2. Validation Protocol

For each strategy in the pipeline:

**Step 1: Extract expiry assumptions**
- What instrument does the strategy target?
- Does it assume weekly expiry availability?
- What day of the week does it assume expiry occurs?
- Does it assume any specific contract series (e.g., next-week, far-month)?

**Step 2: Cross-reference against current calendar**
- Use WebSearch: `"NSE [instrument] expiry calendar 2025 2026"` `[VERIFY: use current year]`
- Check NSE website: `https://www.nseindia.com/products/content/derivatives/equities/fo_contractspecifications.htm` `[VERIFY: current URL]`

**Step 3: Flag violations**
- If a strategy targets a **discontinued weekly expiry**: `[EXPIRY_INVALID: [instrument] weekly expiry was discontinued per SEBI rationalization — strategy must be adapted to monthly expiry or switch to Nifty/Sensex weekly]`
- If a strategy assumes the **wrong expiry day**: `[EXPIRY_DAY_MISMATCH: Strategy assumes [day] expiry for [instrument], but current expiry is [actual_day]]`
- If a strategy references a **non-existent contract series**: `[CONTRACT_NOT_AVAILABLE: [description] — verify against NSE contract listing]`

### 3. Strategy Adaptation Guidance

When a strategy targets a discontinued expiry, suggest adaptations:

**Bank Nifty weekly → Options:**
1. **Adapt to Nifty weekly:** Translate strike distances proportionally (Bank Nifty is ~2.5x more volatile than Nifty in points `[VERIFY: current relative volatility]`)
2. **Adapt to Bank Nifty monthly:** Same instrument, longer DTE — adjust theta and gamma assumptions
3. **Adapt to Sensex weekly (BSE):** Friday expiry — different liquidity profile than NSE
4. **Mark as unadaptable:** If the strategy's edge specifically depends on the unique properties of the discontinued expiry (e.g., "Bank Nifty Wednesday expiry has highest gamma"), flag: `[STRATEGY_EDGE_LOST: Core edge was specific to discontinued expiry structure]`

**Fin Nifty / Midcap Nifty weekly → Options:**
1. Adapt to monthly contracts for the same instrument
2. Or adapt to Nifty weekly if the sector exposure is close enough
3. These instruments had lower liquidity even pre-rationalization — check if monthly liquidity is sufficient

### 4. Holiday and Special Expiry Handling

**Trading holidays affect expiry dates:**
- If the regular expiry day (e.g., Thursday) is a holiday, expiry moves to the previous trading day
- Strategy timing assumptions based on "Thursday expiry" may be wrong on holiday-adjusted weeks
- Check: `"NSE trading holidays 2025 2026"` `[VERIFY: current NSE holiday calendar]`

**Special situations:**
- Quarterly expiry contracts (3-month, 6-month) have different start dates and may not always be available
- Stock options have monthly expiry only — no weekly (except during the brief SEBI pilot for single-stock weeklies, which was discontinued) `[VERIFY: current single-stock weekly status]`
- Physical settlement for stock options ITM at expiry changes the risk profile vs. cash-settled index options

### 5. Expiry Calendar Data for shared_context.json

The Project Lead should populate this data during pre-run checks:

```json
{
  "nse_expiry_calendar": {
    "weekly_available": {
      "NIFTY": { "day": "Thursday", "status": "ACTIVE" },
      "BANKNIFTY": { "day": null, "status": "DISCONTINUED", "note": "Rationalized by SEBI 2024" },
      "FINNIFTY": { "day": null, "status": "DISCONTINUED" },
      "SENSEX": { "day": "Friday", "status": "ACTIVE", "exchange": "BSE" }
    },
    "monthly_available": ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCAPNIFTY", "SENSEX", "BANKEX"],
    "next_weekly_nifty": "2025-03-27",
    "next_monthly": "2025-03-27",
    "next_quarterly": "2025-06-26",
    "holidays_affecting_expiry": [],
    "source": "[VERIFY: current NSE/BSE expiry calendar]",
    "last_verified": "2025-03-20"
  }
}
```

### 6. Validation Output Tag

For each strategy, append one of:

- `[EXPIRY_VALID: Targets [instrument] [expiry_type] — confirmed available]`
- `[EXPIRY_INVALID: [reason] — requires adaptation]`
- `[EXPIRY_UNCERTAIN: Cannot confirm current availability — [VERIFY: NSE/BSE expiry calendar]]`

## Changelog

`[Built from scratch — v1.0]`
