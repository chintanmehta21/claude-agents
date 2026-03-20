---
name: Options Chain Fetcher
description: This skill should be used when any agent needs to analyze NSE options chain data, calculate PCR ratios, determine max pain levels, assess IV percentiles, or evaluate open interest patterns. Trigger phrases include "options chain", "open interest", "PCR ratio", "max pain", "IV percentile", "strike analysis", "OI buildup", "chain dynamics".
version: 1.0.0
---

# Options Chain Fetcher — NSE Chain Analysis Skill

## Purpose

Provides guidance for pulling and analyzing NSE options chain data for OI analysis, Put-Call Ratio (PCR) computation, max pain calculation, and IV percentile ranking. Handles NSE API rate limits and session management. All data fetching approaches documented here should be cited or flagged `[VERIFY: source needed]` where endpoint behavior is assumed.

## Stakeholder

Used by **Orchestrators** during historical context enrichment, **Verifiers** during liquidity and feasibility assessment, and **Scout agents** when evaluating strategy viability. Referenced by the **Project Lead** for IV regime classification.

## Instructions

### 1. Data Sources for Options Chain

**Primary: NSE Website API**
- Endpoint: `https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY` `[VERIFY: current NSE API endpoint — NSE frequently changes API structure]`
- Also: `https://www.nseindia.com/api/option-chain-equities?symbol=RELIANCE`
- Returns: Full options chain with OI, volume, IV, LTP, bid/ask for all strikes and expiries
- **Rate limits:** NSE aggressively rate-limits automated access. Session cookies expire quickly. `[VERIFY: current NSE rate limit behavior]`
- **Cookie requirement:** NSE requires a valid session cookie obtained by first visiting the main page

**Alternative Sources (when NSE API is rate-limited):**
- **Zerodha Kite API:** Requires user authentication `[VERIFY: Kite API options chain endpoint]`
- **Sensibull:** Provides options chain analysis with IV rank/percentile
- **MoneyControl/Investing.com:** Aggregated chain data (may be delayed)
- **WebSearch for recent analysis:** Search `"nifty options chain analysis today [date]"` for recent blog/Twitter analysis

### 2. Key Metrics to Extract

#### Put-Call Ratio (PCR)
```
PCR (OI-based) = Total Put OI / Total Call OI

Interpretation:
  PCR > 1.2  → Bullish signal (puts being sold, market expected to rise)
  PCR 0.8-1.2 → Neutral
  PCR < 0.8  → Bearish signal (calls being sold or puts unwinding)

[VERIFY: PCR interpretation thresholds — these are commonly cited but not universally agreed upon]
```

#### Max Pain
```
Max Pain = Strike price where total value of all outstanding
           options (calls + puts) would cause maximum loss to
           option buyers / maximum gain to option writers

Calculation:
  For each strike S:
    Pain_calls = Sum of (max(0, S - K) × OI_call_K) for all call strikes K
    Pain_puts  = Sum of (max(0, K - S) × OI_put_K) for all put strikes K
    Total_pain_S = Pain_calls + Pain_puts
  Max Pain = Strike S with minimum Total_pain_S
```

#### IV Percentile / IV Rank
```
IV Percentile (252-day):
  = (Number of days IV was below current IV) / 252 × 100

IV Rank:
  = (Current IV - 52-week Low IV) / (52-week High IV - 52-week Low IV) × 100

[VERIFY: IV percentile vs IV rank distinction — both are used in Indian trading community but measure different things]
```

#### OI Buildup Analysis
```
Interpretation of OI changes:

| Price ↑ + OI ↑  | Long buildup   | Bullish — fresh buying         |
| Price ↑ + OI ↓  | Short covering | Moderately bullish — not fresh |
| Price ↓ + OI ↑  | Short buildup  | Bearish — fresh selling        |
| Price ↓ + OI ↓  | Long unwinding | Moderately bearish — not fresh |
```

### 3. Strike-Level Analysis

For strategy feasibility assessment, evaluate target strikes:

**Liquidity Assessment:**
| Metric | Liquid | Illiquid |
|--------|--------|----------|
| OI | > 10 lakh (index) or > 1 lakh (stock) | < 1 lakh (index) or < 10,000 (stock) |
| Volume | > 50,000 contracts/day | < 5,000 contracts/day |
| Bid-Ask Spread | < ₹2 (index) or < ₹1 (stock) | > ₹5 |

`[VERIFY: liquidity thresholds — these are estimates based on typical NSE activity]`

**IV Skew Analysis:**
- Compare IV of OTM puts vs OTM calls at same delta distance from ATM
- Persistent negative skew (puts more expensive) is normal for indices
- Unusual skew changes may signal institutional hedging activity

### 4. NSE API Session Management

**Protocol for accessing NSE data:**

1. First request: GET `https://www.nseindia.com` to obtain session cookies
2. Extract cookies from response headers
3. Use cookies in subsequent API requests
4. If request returns 403 or empty response, refresh cookies
5. Space requests at minimum 3 seconds apart
6. If consistently blocked, switch to alternative data source
7. Never attempt to circumvent NSE's access controls

`[VERIFY: NSE current API access pattern — this behavior is observed but not officially documented]`

### 5. Fetching Protocol for Pipeline Agents

When an agent needs chain data:

1. **First attempt:** Use WebSearch to find recent options chain analysis articles/tweets
   - This avoids direct NSE API dependency
   - Search: `"nifty options chain OI analysis [today's date]"`

2. **Second attempt:** Use WebFetch on NSE API endpoint
   - Set appropriate headers (User-Agent, Accept, Referer)
   - Handle rate limits gracefully

3. **Third attempt:** Use alternative data aggregators
   - Sensibull, Opstra, or similar platforms
   - Data may be delayed 15 minutes

4. **Fallback:** Use most recent available data
   - Flag: `[CHAIN_DATA_DELAYED: using data from [timestamp]]`
   - Note: Chain data older than 1 trading day should not be used for strike-level liquidity assessment

### 6. Output Format for Chain Analysis

When documenting chain analysis in enriched/verified output:

```markdown
#### Options Chain Analysis — [Underlying] — [Date]
- **Data Source:** [NSE API | Sensibull | WebSearch analysis | etc.]
- **Data Freshness:** [Real-time | 15-min delayed | EOD | STALE]
- **PCR (OI-based):** [value] — [interpretation]
- **Max Pain:** [strike level] — current spot distance: [X points / Y%]
- **IV Percentile (252-day):** [value]% — Regime: [LOW|MEDIUM|HIGH|EXTREME]
- **Key OI Levels:**
  - Highest Call OI: [strike] ([OI value]) — resistance
  - Highest Put OI: [strike] ([OI value]) — support
  - Significant OI change: [description]
- **Liquidity at Target Strikes:**
  | Strike | Type | OI | Volume | Bid-Ask | Verdict |
  |--------|------|----| -------|---------|---------|
  | [X] | CE | [Y] | [Z] | [W] | LIQUID/ILLIQUID |
```

## Changelog

`[Built from scratch — v1.0]`
