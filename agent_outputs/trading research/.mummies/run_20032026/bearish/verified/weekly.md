# BEARISH WEEKLY Verified Strategies
## Run ID: run_20032026 | Date: 2026-03-20 | Verifier: Weekly Expiry Verifier (BEARISH)
## Expiry: March 24, 2026 (Tuesday) — Weekly
## India VIX: 22.09 (HIGH regime) | Rubric: v2.0

---

## Strategy W-1: Nifty Bearish Broken-Wing Put Butterfly
### 1. Greeks Mathematical Stress Test

**Delta Stress:**
- At entry: Delta = -0.17 (net). Notional exposure: -0.17 x 65 x 23,100 = ~Rs -2,55,000
- 1-sigma move (VIX 22.09, 1 DTE): ~1.4% = ~323 pts
  - Up 323 pts (Nifty 23,423): All puts lose value. Loss = net debit ~Rs 1,625. Minimal.
  - Down 323 pts (Nifty 22,777): Near max profit zone (22,700 target). Long 23000 PE = 223 pts intrinsic. Short 22700 PE = 77 pts intrinsic x2 = 154. Long 22200 PE = 0. Net = 223 - 154 = 69 pts - 25 debit = 44 pts = Rs 2,860.
- 2-sigma move (~2.8% = ~647 pts):
  - Down to 22,453: Below sold strikes. Long 23000 PE = 547. Short 22700 PE x2 = 506. Long 22200 PE = 253. Net = 547 - 506 + 253 = 294 - 25 = 269 pts = Rs 17,485.
- 3-sigma move (~4.2% = ~970 pts):
  - Down to 22,130: Near lower wing. Long 23000 PE = 870. Short 22700 PE x2 = 1140. Long 22200 PE = 70. Net = 870 - 1140 + 70 = -200 - 25 = -225 pts = -Rs 14,625 loss. NEAR MAX LOSS.
- Gap scenario: 5% gap down (Nifty ~21,945): Below all strikes. Net intrinsic = (23000-21945) - 2(22700-21945) + (22200-21945) = 1055 - 1510 + 255 = -200 - 25 = -225 pts = -Rs 14,625. MAX LOSS ZONE.

**Gamma Risk (1 DTE):**
- Gamma is EXTREME at 1 DTE for near-ATM options. The 22,700 sold puts will have gamma of ~0.02-0.03 EACH with 1 DTE.
- Net gamma: -2(0.025) + 0.015 + 0.005 = -0.030. Strongly negative.
- Implication: Every 100-pt move against the position accelerates losses.
- **CRITICAL**: 1 DTE gamma means the P&L can swing Rs 5,000-10,000 in minutes near the sold strikes.

**Vega Sensitivity:**
- Net vega: ~-0.8 per point of IV.
- +3 IV pts (VIX 22 → 25): Position gains ~Rs 156 (beneficial)
- -3 IV pts (VIX 22 → 19): Position loses ~Rs 156 (small impact at 1 DTE — vega is minimal)
- -5 IV pts: ~Rs 260 impact. Minimal at 1 DTE.
- **Assessment**: Vega is nearly irrelevant at 1 DTE. Gamma dominates.

**Gamma-Theta Tradeoff:**
- Theta: +4 pts/day (~Rs 260/day)
- Gamma: -0.030 per lot
- Theta/Gamma ratio: 4/0.030 = 133. Above 100 = theta-favored in normal conditions.
- But with 1 DTE, a single large move can overwhelm the theta advantage.

### 2. Qualitative Failure Mode Analysis

| Failure Mode | Severity | Probability | Mitigation |
|-------------|----------|-------------|------------|
| Exact 22,700 pin (max profit) requires precision | Medium | Low (5-10%) | Accept — butterfly profit zone is narrow |
| Nifty gaps below 22,200 overnight | High | Medium (15-20% given geo) | Max loss capped at Rs 11,375 |
| Nifty rallies above 23,250 (reversal) | Low | Medium (20-25%) | Loss limited to Rs 1,625 debit |
| Slippage on 4-leg entry | Medium | Low | Use Nifty weekly — highest liquidity |
| IV crush benefits offset by gamma | Low | Medium | Vega minimal at 1 DTE |
| Margin call mid-trade | Low | Very Low | BWB has defined risk |

### 3. Pro/Con Debate

**ADVOCATE**: The BWB is elegantly designed for this exact scenario — high VIX inflates the sold OTM puts, creating near-zero-cost entry. With 1 DTE, the theta profile is maximally favorable. The 22,700 target is a reasonable support zone for a market that crashed 3.26% yesterday. The broken wing ensures even catastrophic downside is capped. Risk-reward of 2.8:1 on the debit is excellent.

**ADVERSARY**: The fundamental problem is that this is a PIN strategy in a CRASH market. The butterfly needs Nifty at 22,700 +/- 275 pts. But recent daily moves are 750+ pts — Nifty could easily blow through the entire structure in one direction. The profit zone is only 550 pts wide in a market moving 500-750 pts per day. The 1 DTE extreme gamma means rapid P&L swings. Furthermore, the max loss of Rs 11,375 is 7x the max debit — the risk is heavily asymmetric against you on the downside.

**ADJUDICATION**: The Adversary has the stronger argument. The BWB's narrow profit zone (550 pts) is ill-suited for a market exhibiting 500-750 pt daily moves. While the debit entry is attractive, the probability of actually pinning near 22,700 is low in this volatility regime. The strategy has SOUND structure but POOR regime fit. Rating: CONDITIONAL — only suitable if the trader expects consolidation rather than continuation.

### 4. Historical NSE Scenario Stress Test

| Scenario | Date | Market Move | Strategy Outcome |
|----------|------|------------|-----------------|
| Favorable | Oct 2024 | Nifty ranged 200 pts for 5 sessions | Max profit at pin. ~Rs 15,000+ |
| Adverse | Mar 19, 2026 | Nifty -3.26% (776 pts) | Blown through all strikes. Max loss Rs 11,375 |
| Neutral | Jan 2025 | Nifty drifted -0.8% on expiry day | Near profit zone. ~Rs 5,000 |

### 5. SEBI Regulatory Compliance
- All legs on NSE Nifty weekly (Tuesday expiry). COMPLIANT.
- Position limits within retail threshold. COMPLIANT.
- No physical delivery risk (index options, cash-settled). COMPLIANT.
- Calendar spread margin benefit: N/A (single expiry). COMPLIANT.

### 6. Confidence Score — Rubric v2.0 (0-110 scale)

| Dimension | Score (0-10) | Rationale |
|-----------|-------------|-----------|
| Edge Clarity | 7 | Clear thesis — skew harvest + theta crush. Well-articulated. |
| Entry Precision | 6 | Specific strikes, but no trigger confirmation (just "Monday morning") |
| Exit Discipline | 7 | Clear stop, time exit, adjustment protocol |
| Risk-Reward | 7 | 2.8:1 on debit, but 1:1.6 on downside. Mixed. |
| Liquidity Feasibility | 9 | Nifty weekly — most liquid Indian options market |
| Historical Evidence | 4 | No specific backtest. General BWB data from US markets only. |
| IV Regime Alignment | 5 | HIGH VIX inflates premiums (good for entry) but also means big moves (bad for pin strategy) |
| Regulatory Compliance | 10 | Fully compliant |
| Capital Efficiency (ROM) | 8 | Rs 1,625 debit for Rs 17,875 max profit. Excellent leverage. |
| Failure Mode Resilience | 5 | Multiple failure modes, narrow profit zone in volatile market |
| Greeks Robustness | 5 | Extreme negative gamma at 1 DTE. Vega irrelevant. Theta favorable but overwhelmed by gamma. |

**Raw Score: 73/110**
**Deductions:** None flagged
**Final Score: 73/110**
**Verdict: CONDITIONAL PASS — Suitable only for consolidation expectation, not crash continuation**

---

## Strategy W-2: Nifty Put Ratio Backspread
### 1. Greeks Mathematical Stress Test

**Delta Stress:**
- At entry: Delta = -0.10 (net). Mild bearish.
- 1-sigma (323 pts) down to 22,777: Delta accelerates to ~-0.30. P&L: approaching lower breakeven. Small profit zone.
- 2-sigma (647 pts) down to 22,453: Delta ~-0.55. Long puts deep ITM. Net intrinsic: 2(22700-22453) - (23100-22453) = 494 - 647 = -153 + 30 credit = -123 pts = -Rs 7,995. LOSS (still in the "valley").
- 3-sigma (970 pts) down to 22,130: Net: 2(22700-22130) - (23100-22130) = 1140 - 970 = 170 + 30 = 200 pts = Rs 13,000 PROFIT.
- 5% gap down (21,945): Net: 2(22700-21945) - (23100-21945) = 1510 - 1155 = 355 + 30 = 385 pts = Rs 25,025 PROFIT.

**Gamma Risk (1 DTE):**
- Net gamma: +0.06 (POSITIVE). This is the key advantage — gamma HELPS the position on big moves.
- Every 100-pt move in favor accelerates profits.
- The "valley of death" around 22,700 is the danger zone — but gamma means you accelerate OUT of it on continuation moves.

**Vega Sensitivity:**
- Net vega: +2.5
- +3 IV (VIX 22 → 25): +Rs 487 gain
- -3 IV: -Rs 487 loss
- At 1 DTE, vega impact is muted but still present for large IV moves.

**Gamma-Theta Tradeoff:**
- Theta: -7 pts/day (~Rs -455/day) — NEGATIVE. Time works against you.
- Gamma: +0.06 per lot — POSITIVE. Big moves work for you.
- This is a pure gamma-over-theta bet. You need the move to happen TODAY.

### 2. Qualitative Failure Mode Analysis

| Failure Mode | Severity | Probability | Mitigation |
|-------------|----------|-------------|------------|
| Nifty pins at 22,700 (max loss Rs 24,050) | CRITICAL | Low (5-8%) | Exit if hovering 22,600-22,800 in last 2 hours |
| Nifty stays above 23,100 (flat day) | Low | Medium (30-35%) | Credit of Rs 1,950 retained. Acceptable. |
| Moderate decline (1-2%) to 22,800-22,900 | High | Medium (20-25%) | Near max loss zone. Must exit early. |
| Negative theta erodes position on slow day | Medium | High (40-50%) | Inherent to the strategy — accept. |
| Gap up on ceasefire news | Low | Low (5-10%) | Credit retained. Minimal loss. |

### 3. Pro/Con Debate

**ADVOCATE**: This is THE crash hedge for the current environment. With net credit entry, you get PAID to hold downside insurance. Positive gamma means profits accelerate on big moves — exactly what's happening (3.26% daily crashes). Positive vega means further VIX spikes help. If Iran-Israel escalates overnight, this position profits massively. The only loss scenario (22,700 pin) requires an exact price — low probability.

**ADVERSARY**: The "valley of death" around 22,700 is wider than it appears — any settlement between roughly 22,400-23,000 produces a loss. That's a 600-pt zone that includes the current first support level. In a 1 DTE environment, the market is most likely to either (a) stay flat (credit retained, minimal) or (b) decline moderately to support (22,900-22,700 — MAX LOSS ZONE). The probability of the needed 3%+ crash happening on EXACTLY this one day is perhaps 10-15%. Most of the probability mass is in the worst zone.

**ADJUDICATION**: Both have valid points. The key question: is another 3%+ crash day probable? Given VIX at 22.09, the implied 1-day move is ~1.4% (1-sigma). A 3% move is a 2+ sigma event — probability ~5-10% per day. But backspreads need the fat-tail, and in crisis regimes, fat tails are fatter than normal distributions suggest. Rating: HIGH-RISK, HIGH-REWARD. Suitable for traders specifically hedging against tail events with capital they can afford to lose in the max-loss zone.

### 4. Historical NSE Scenario Stress Test

| Scenario | Date | Market Move | Strategy Outcome |
|----------|------|------------|-----------------|
| Favorable | Mar 9, 2020 | Nifty -5.6% in 1 session | Massive profit (400+ pts net) |
| Adverse | Any flat expiry day | Nifty moves <100 pts | Credit retained (Rs 1,950). Acceptable. |
| Worst case | Slow decline to support | Nifty -1.5% to 22,750 | Near max loss (Rs 20,000+) |

### 5. SEBI Regulatory Compliance
- COMPLIANT. All legs on NSE Nifty weekly.

### 6. Confidence Score — Rubric v2.0

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 8 |
| Entry Precision | 7 |
| Exit Discipline | 6 |
| Risk-Reward | 7 |
| Liquidity Feasibility | 9 |
| Historical Evidence | 5 |
| IV Regime Alignment | 8 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 6 |
| Failure Mode Resilience | 5 |
| Greeks Robustness | 7 |

**Raw Score: 78/110**
**Deductions:** None
**Final Score: 78/110**
**Verdict: PASS — High-conviction crash hedge. Accept max-loss risk at the valley.**

---

## Strategy W-3: Sensex Bearish-Skewed Iron Condor

### 1. Greeks Stress Test (Abbreviated)
- Delta stress: Manageable at -0.07 net. 1-sigma moves stay within breakevens.
- Gamma: -0.01 (mild). Not extreme given BSE weekly DTE.
- Vega: -3.0 — strongly short vega. VIX normalization benefits.

### 2. Failure Modes
- BSE liquidity risk: CRITICAL. Wider bid-ask = slippage on entry AND exit.
- 4-leg execution on low-liquidity BSE: Likely requires sequential fills, not basket.
- Cost erosion: Rs 387-587 all-in costs against Rs 4,400 credit = 9-13%.

### 3. Pro/Con Debate
**ADVOCATE**: BSE Sensex offers structural premium advantage. Unique post-SEBI-rationalization instrument.
**ADVERSARY**: The "liquidity premium" thesis is unverified and community-sourced. Transaction costs + slippage may entirely negate the supposed edge.
**ADJUDICATION**: INSUFFICIENT evidence to validate the core thesis. [STALE] flag is warranted.

### 4-5. Scenario Test & Compliance
- Scenarios: Moderate — IC is a standard structure. Performance depends on staying within breakevens.
- SEBI: COMPLIANT — Sensex is designated BSE weekly instrument. NOTE: Verify that Sensex weekly is Friday (per rules file) not Tuesday. If Friday, the DTE assumption changes.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 5 |
| Entry Precision | 5 |
| Exit Discipline | 6 |
| Risk-Reward | 4 |
| Liquidity Feasibility | 3 |
| Historical Evidence | 2 |
| IV Regime Alignment | 6 |
| Regulatory Compliance | 8 |
| Capital Efficiency | 6 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 5 |

**Raw Score: 54/110**
**Deductions:** -5 [STALE] (BSE premium thesis), -5 [COST_EROSION_RISK]
**Final Score: 44/110**
**Verdict: FAIL — Unverified edge thesis, liquidity concerns, poor risk-reward**

---

## Strategy W-4: Bank Nifty Asymmetric Short Strangle

### 1-6. Verification BLOCKED

**[COMPLIANCE_RISK] — CRITICAL FAILURE**

Bank Nifty weekly options have been DISCONTINUED per SEBI weekly expiry rationalization (Sep 2025). This strategy CANNOT be executed as designed.

**Deduction:** -20 [COMPLIANCE_RISK]

**Raw Score: N/A**
**Final Score: 0/110**
**Verdict: DISQUALIFIED — Regulatory compliance failure. Strategy cannot be executed.**

---

## Strategy W-5: Nifty Bearish Directional Iron Fly

### 1. Greeks Stress Test
- Delta: -0.20. 1-sigma up (23,423): Near upper breakeven (23,175). LOSS territory.
- 1-sigma down (22,777): Near optimal zone. Profit ~Rs 8,000-12,000.
- 2-sigma down (22,453): Below lower breakeven (22,625). Loss territory.
- **CRITICAL**: Upper breakeven at 23,175 is only 75 pts above current 23,100. Even FLAT = loss.
- Gamma: -0.12. SEVERELY negative. 1 DTE ATM straddle has the highest gamma in all options.
- Theta: +60/day. Rs 3,900/day. Massive but requires near-static market.
- Vega: -6.0. Extreme short vega. Any IV spike is devastating (though muted at 1 DTE).

### 2. Failure Modes
| Mode | Severity | Probability |
|------|----------|-------------|
| Nifty stays flat (above 23,100) | CRITICAL | High (30-40%) | Upper breakeven breached immediately |
| Nifty drops 3%+ (crash continues) | High | Medium (15-20%) | Below lower breakeven |
| IV spike on escalation news | Medium | Medium (20%) | Muted at 1 DTE |

### 3. Pro/Con Debate
**ADVOCATE**: Rs 17,875 credit is extraordinary. Theta of +60/day is unmatched. If Nifty declines to 22,900 support, max profit.
**ADVERSARY**: The upper breakeven at 23,175 means the position is IMMEDIATELY at risk if Nifty doesn't decline. The profitable zone (22,625-23,175) requires a 200-pt decline from 23,100 to reach the center — and even a FLAT market puts you above breakeven. Extreme negative gamma means any sudden move is catastrophic.
**ADJUDICATION**: The directional skew REQUIRES a decline. If it happens, profits are excellent. If it doesn't, you're underwater from the first minute. The tight upper breakeven is a significant structural weakness.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 5 |
| Exit Discipline | 6 |
| Risk-Reward | 6 |
| Liquidity Feasibility | 9 |
| Historical Evidence | 4 |
| IV Regime Alignment | 6 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 8 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 4 |

**Raw Score: 69/110**
**Deductions:** None
**Final Score: 69/110**
**Verdict: CONDITIONAL PASS — Requires high conviction in 200-pt decline, not continuation crash**

---

## Strategy W-6: Nifty Bearish Diagonal/Calendar Put (Merged)

### 1. Greeks Stress Test
- Delta: -0.35. Moderate bearish. 1-sigma down: Long put gains 40-60 pts. Short put loses 15-20 pts. Net gain: ~25-40 pts = Rs 1,625-2,600.
- Gamma: Near neutral (opposing expiries offset).
- Theta: +7/day = Rs 455/day. Positive and growing as weekly approaches expiry.
- Vega: +1.5 — NET LONG VEGA. If VIX spikes to 25, gains ~Rs 585 from vega alone.

### 2. Failure Modes
| Mode | Severity | Probability |
|------|----------|-------------|
| Sharp rally above 23,600 | Medium | Low (10-15%) | Both puts lose value. Max loss Rs 15,925 |
| Weekly put expires ITM (Nifty < 22,900) | Medium | Medium (25-30%) | Assignment risk manageable — cash settled |
| Phase 2 execution risk | Medium | Medium | Market may have moved too far for Phase 2 |

### 3. Pro/Con Debate
**ADVOCATE**: Triple edge (theta + direction + IV term structure). NET LONG VEGA is uniquely valuable — profits from further VIX spikes. Phase 2 creates 11.5:1 potential R:R. The merged strategy inherits the best from 3 scouts.
**ADVERSARY**: The Rs 15,925 debit is substantial for a cross-expiry play. Phase 2 is contingent on Phase 1 working — not guaranteed. The IV term structure thesis (near > far) is assumed, not verified.
**ADJUDICATION**: Strong strategy with genuine triple edge. The long vega is a UNIQUE advantage among weekly strategies — it's the only one that PROFITS from further VIX spikes. Phase 2 adds optionality. Strongest weekly strategy for traders expecting continued crisis.

### 4. SEBI: COMPLIANT. Calendar spread margin benefit may be removed on expiry day per SEBI 2024 framework. [VERIFY]

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 8 |
| Entry Precision | 7 |
| Exit Discipline | 7 |
| Risk-Reward | 8 |
| Liquidity Feasibility | 8 |
| Historical Evidence | 5 |
| IV Regime Alignment | 9 |
| Regulatory Compliance | 9 |
| Capital Efficiency | 6 |
| Failure Mode Resilience | 7 |
| Greeks Robustness | 8 |

**Raw Score: 82/110**
**Deductions:** None
**Final Score: 82/110**
**Verdict: STRONG PASS — Best weekly strategy. Triple edge + long vega protection.**

---

## Weekly Verifier Summary

| Strategy | Raw Score | Deductions | Final Score | Verdict |
|----------|-----------|------------|-------------|---------|
| W-1 BWB | 73 | 0 | 73 | CONDITIONAL PASS |
| W-2 Backspread | 78 | 0 | 78 | PASS |
| W-3 Sensex IC | 54 | -10 | 44 | FAIL |
| W-4 BN Strangle | N/A | -20 | 0 | DISQUALIFIED |
| W-5 Iron Fly | 69 | 0 | 69 | CONDITIONAL PASS |
| W-6 Diagonal/Cal | 82 | 0 | 82 | STRONG PASS |

**Weekly Recommendation Ranking:**
1. W-6 Diagonal/Calendar (82) — BEST: Triple edge, long vega
2. W-2 Put Backspread (78) — Crash hedge with credit entry
3. W-1 BWB (73) — Good structure, poor regime fit for pin strategy
4. W-5 Iron Fly (69) — Extreme theta but tight breakevens
5. W-3 Sensex IC (44) — FAIL: Unverified thesis, liquidity issues
6. W-4 BN Strangle (0) — DISQUALIFIED: Compliance failure
