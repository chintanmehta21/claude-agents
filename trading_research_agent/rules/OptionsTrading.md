# Indian Options Trading — Market Rules & Regulatory Baseline

## Purpose

This file is the **single source of truth** for Indian market rules, SEBI regulations, exchange mechanics, and tax implications relevant to options trading. Every agent in the pipeline must reference this file when making factual claims about market structure. This is a **living document** — new rules discovered during any pipeline run are appended under the `## Discovered Rules` section with an `Added by Claude` audit tag.

## Stakeholder

Owned by the **Project Lead** (`agents/lead.md`). Updated by the `rule-updater.py` hook when any agent discovers a new persistent rule. Referenced by all agents — especially Scouts (for strategy feasibility), Orchestrators (for enrichment), and Verifiers (for compliance checking).

## Instructions

1. Every rule in this file must include a **source citation** (NSE circular number, SEBI notification number, Exchange circular, or named authoritative source) or the tag `[VERIFY: source needed]`
2. When a new rule is discovered during a pipeline run, it must be appended to the `## Discovered Rules` section using the format defined below
3. Existing rules must NEVER be overwritten by automated processes — conflicting discoveries go to `## Conflicts — Pending Review`
4. Any rule with the `[STALE]` flag must be re-verified before being used as primary evidence

---

## 1. Exchange Structure

### NSE (National Stock Exchange)
- Primary derivatives exchange for index and stock options in India
- Trading hours: 09:15 IST to 15:30 IST (equity derivatives) `[VERIFY: current NSE trading hours — check for extended hours]`
- Pre-open session: 09:00 IST to 09:15 IST (for equity, not derivatives)
- Source: NSE website — https://www.nseindia.com

### BSE (Bombay Stock Exchange)
- Sensex options and select stock options
- Trading hours: Same as NSE for derivatives
- Source: BSE website — https://www.bseindia.com

---

## 2. Standard Lot Sizes

| Instrument | Lot Size | Exchange | Last Verified |
|-----------|----------|----------|---------------|
| Nifty 50 | 75 units | NSE | `[VERIFY: current NSE circular — lot sizes revised Nov 2024]` |
| Bank Nifty | 30 units | NSE | `[VERIFY: current NSE circular]` |
| Fin Nifty | 65 units | NSE | `[VERIFY: current NSE circular]` |
| Sensex | 20 units | BSE | `[VERIFY: current BSE circular]` |
| Midcap Nifty | 120 units | NSE | `[VERIFY: current NSE circular]` |
| Stock Options | Varies per stock | NSE/BSE | Check NSE circular for individual lot sizes |

**Important:** Lot sizes are revised periodically by NSE based on underlying price changes. Always verify against the most recent NSE circular before using in risk-reward calculations.

Source: NSE Circular — Revision of Market Lot for derivatives contracts `[VERIFY: specific circular number for latest revision]`

---

## 3. Expiry Mechanics

### Weekly Expiry
- **Nifty 50:** Expires every Thursday `[VERIFY: current weekly expiry day — SEBI rationalized weekly expiries in late 2024]`
- **Bank Nifty:** Monthly expiry only (weekly discontinued) `[VERIFY: SEBI circular on weekly expiry rationalization — Nov 2024]`
- **Fin Nifty:** Monthly expiry only (weekly discontinued) `[VERIFY: same SEBI circular]`
- **Sensex:** Weekly expiry on Friday `[VERIFY: current BSE expiry schedule]`
- **Midcap Nifty:** Monthly expiry only `[VERIFY: current NSE circular]`

**CRITICAL NOTE:** SEBI issued a circular in late 2024 rationalizing weekly index derivatives expiries. As of this writing, only ONE weekly expiry per exchange is permitted. Verify the current status before designing weekly expiry strategies for instruments other than Nifty/Sensex.

Source: SEBI Circular — "Measures to Strengthen Index Derivatives Framework" `[VERIFY: SEBI/HO/MRD/MRD-PoD-2/P/CIR/2024/144 or latest superseding circular]`

### Monthly Expiry
- Last Thursday of the month (for NSE contracts)
- Last Friday of the month (for BSE Sensex contracts) `[VERIFY: current BSE monthly expiry day]`
- All index and stock option contracts have monthly expiry series

### Quarterly / Long-Dated Expiry
- Available for select indices (Nifty, Bank Nifty)
- Typically 3-month and 6-month contracts available `[VERIFY: current NSE long-dated contract availability]`

### Settlement
- **Index options:** Cash-settled `[Source: NSE — Index derivatives are cash-settled]`
- **Stock options:** Physical delivery (compulsory delivery of underlying shares for ITM options at expiry) `[Source: SEBI Circular SEBI/HO/CDMRD/DMP/CIR/P/2017/127 and subsequent amendments]`
- **Physical delivery implications:** If an ITM stock option is held to expiry, the buyer must take/give delivery of the underlying shares. This can result in unexpected margin requirements and settlement obligations.

---

## 4. Margin Framework

### SPAN + Exposure Margin
- Short option positions require SPAN margin + Exposure margin
- SPAN margin is calculated using a risk-based model considering volatility, price range, and inter-commodity spreads
- Exposure margin is an additional percentage of the notional value
- Source: NSE — SPAN margin framework

### Peak Margin
- SEBI mandates collection of margins at the time of trade execution AND at end of day
- Peak margin = highest margin required during the trading day
- Brokers must collect upfront margins; penalty for shortfall
- Source: SEBI Circular — SEBI/HO/MRD2/DCAP/CIR/P/2021/0665 (and amendments) `[VERIFY: latest peak margin circular]`

### Peak Margin Penalty Structure
| Shortfall Percentage | Penalty |
|---------------------|---------|
| Up to 10% of applicable margin | 0.5% of shortfall per day |
| 10% to 50% | 1.0% of shortfall per day |
| Above 50% | 5.0% of shortfall per day or ₹5,000 per instance (whichever is higher) |

Source: `[VERIFY: SEBI peak margin penalty structure — check for latest revisions]`

### Spread Margin Benefit
- Defined spread positions (e.g., bull call spread, bear put spread) receive margin benefit
- Net margin is lower than sum of individual leg margins
- Benefit varies by spread type and exchange recognition
- Source: NSE — Spread margin benefit framework `[VERIFY: specific NSE circular]`

---

## 5. Securities Transaction Tax (STT)

### Current STT Rates for Options
| Transaction | STT Rate | Applied On |
|------------|----------|------------|
| Option buying (intraday/squared off) | 0% | No STT on buy-side premium |
| Option selling | 0.0625% | On premium received (sell-side) |
| Option exercised (ITM at expiry) | 0.125% | On intrinsic value at settlement |

Source: Finance Act — STT provisions `[VERIFY: current STT rates — Finance Act 2024/2025 may have revised these rates]`

**CRITICAL NOTE:** STT on option exercise is significantly higher than STT on premium. This makes it important to close ITM positions before expiry rather than allowing exercise, unless the intrinsic value gain exceeds the STT cost.

**Recent Change:** The 2024 Union Budget may have increased STT on F&O transactions. `[VERIFY: Finance Act 2024 — Section on STT for F&O]`

### Impact on Strategy Selection
- **Option buying strategies:** Lower STT burden (no STT on buy premium, only on exercise if ITM)
- **Option selling strategies:** STT on every sell transaction (on premium)
- **Multi-leg strategies:** STT applies to each leg separately
- Strategies should account for STT impact in their risk-reward calculations

---

## 6. SEBI Regulatory Restrictions

### Retail Participant Restrictions
- No naked short selling of shares (equity delivery) — but naked option writing is currently permitted for F&O-eligible accounts `[VERIFY: SEBI may have imposed restrictions on retail naked option writing]`
- Minimum net worth requirements may apply for certain strategy types
- Position limits apply per client, per instrument
- Source: SEBI Master Circular on derivatives `[VERIFY: latest SEBI Master Circular reference]`

### Position Limits
| Participant | Nifty Options | Bank Nifty Options | Stock Options |
|------------|---------------|---------------------|---------------|
| Client level | Higher of ₹500 Cr or 15% of total OI | Higher of ₹500 Cr or 15% of total OI | Higher of 1% of free-float or ₹50 Cr |

Source: `[VERIFY: SEBI/NSE position limit circulars — these limits are periodically revised]`

### New SEBI F&O Framework (2024)
SEBI introduced several measures to strengthen the index derivatives framework:
1. Upfront premium collection from option buyers `[VERIFY: implementation date and status]`
2. Removal of calendar spread margin benefit on expiry day `[VERIFY: implementation date]`
3. Increase in tail risk coverage (extreme loss margin) `[VERIFY: implementation date]`
4. Rationalization of weekly expiry to one per exchange `[VERIFY: SEBI circular — confirmed implemented]`
5. Increase in contract size (minimum lot value) `[VERIFY: new minimum lot value threshold]`
6. Intraday monitoring of position limits `[VERIFY: implementation date]`

Source: SEBI Circular — "Measures to Strengthen Index Derivatives Framework" dated Sept/Oct 2024 `[VERIFY: exact circular number and dates]`

---

## 7. Brokerage and Transaction Costs

### Typical Cost Structure (Discount Broker — e.g., Zerodha)
| Component | Rate |
|-----------|------|
| Brokerage | ₹20 per order or 0.03% (whichever is lower) for options |
| STT | See Section 5 above |
| Exchange Transaction Charges | ~0.05% of premium (NSE) `[VERIFY: current exchange charges]` |
| GST | 18% on brokerage + exchange charges |
| SEBI Turnover Fee | ₹10 per crore `[VERIFY: current rate]` |
| Stamp Duty | 0.003% on buy side (varies by state) `[VERIFY: current stamp duty rate post-uniformization]` |

Source: Zerodha Charges page / NSE Circular `[VERIFY: current Zerodha and NSE charge schedules]`

---

## 8. India VIX Reference

- India VIX measures expected near-term volatility based on Nifty 50 option prices
- Calculated using the CBOE VIX methodology adapted for Nifty
- Historical range: approximately 9 (extreme low) to 90+ (COVID panic)
- Normal range: 10-20
- Source: NSE — India VIX methodology document

### IV Regime Classification (for pipeline use)
| Regime | India VIX Level | Percentile (252-day rolling) |
|--------|----------------|------------------------------|
| LOW | Below 12 | Below 25th percentile |
| MEDIUM | 12-18 | 25th-60th percentile |
| HIGH | 18-25 | 60th-85th percentile |
| EXTREME | Above 25 | Above 85th percentile |

Source: `[VERIFY: empirical source needed — these thresholds are estimated based on historical VIX distribution and should be validated against actual data]`

---

## Discovered Rules

*This section is updated by the `rule-updater.py` hook during pipeline runs. New rules are appended below with audit tags.*

<!-- FORMAT FOR NEW ENTRIES:
### [Rule Title]
- **Rule:** [Description]
- **Source:** [Citation or VERIFY tag]
- **Discovered by:** [Agent name and run ID]
- **Date:** [ISO date]
- **Added by Claude** — [Run ID]
-->

*No discovered rules yet.*

---

## Conflicts — Pending Review

*This section captures conflicting rule discoveries that require manual review.*

<!-- FORMAT FOR CONFLICT ENTRIES:
### [Conflict Title]
- **Existing rule:** [Current rule in this file]
- **Conflicting discovery:** [New conflicting information]
- **Source of conflict:** [Agent, run ID, source citation]
- **Date:** [ISO date]
- **Added by Claude** — [Run ID]
- **Resolution:** PENDING
-->

*No conflicts pending.*

---

## Changelog

`[Built from scratch — v1.0]`
- Initial Indian market rules baseline
- SEBI margin framework and penalty structure
- STT rates and impact analysis
- Expiry mechanics for all major indices
- Position limits and regulatory restrictions
- 2024 SEBI F&O framework changes documented with VERIFY tags
- IV regime classification for pipeline use
- Living document format with Discovered Rules and Conflicts sections
