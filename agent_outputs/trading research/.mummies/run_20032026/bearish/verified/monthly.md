# BEARISH MONTHLY Verified Strategies
## Run ID: run_20032026 | Date: 2026-03-20 | Verifier: Monthly Expiry Verifier (BEARISH)
## Expiry: March 31, 2026 (Tuesday) — Monthly
## India VIX: 22.09 (HIGH regime) | Rubric: v2.0

---

## Strategy M-1: Bank Nifty Bear Call Credit Spread

### 1. Greeks Mathematical Stress Test

**Delta Stress:**
- At entry: Delta = -0.12. Notional: -0.12 x 30 x 53,427 = ~Rs -1,92,000
- 1-sigma (11 DTE, VIX 22): ~3.3% = ~1,763 pts
  - Up 1,763 (BN 55,190): Short 55000 CE ITM by 190 pts. Spread = 190 vs 500 width. Loss = (190 - 140 credit) x 30 = Rs 1,500.
  - Down 1,763 (BN 51,664): Both calls expire worthless. Full credit: Rs 4,200.
- 2-sigma (6.6% = ~3,526):
  - Up to 56,953: MAX LOSS. (500-140) x 30 = Rs 10,800.
  - Down to 49,901: Full credit. Rs 4,200.
- 3-sigma (9.9% = ~5,289):
  - Up to 58,716: MAX LOSS Rs 10,800 (capped by spread).
  - Down: Full credit.
- Gap scenario: 5% gap up on banking policy news: BN ~56,098. Short strike deeply ITM. Max loss Rs 10,800.

**Gamma Risk (11 DTE):**
- Gamma: -0.003. Very mild negative gamma at 11 DTE with short strike 2.9% away.
- Gamma risk increases dramatically in last 3-5 days as short strike approaches ATM.
- Monitor: If BN at 54,500+ by Mar 27, gamma risk escalates.

**Vega Sensitivity:**
- Net vega: -1.8
- +3 IV: Spread widens ~5 pts = Rs 150 loss. Manageable.
- -3 IV: Spread narrows ~5 pts = Rs 150 gain.
- -5 IV: Rs 250 gain. Moderate benefit from VIX normalization.

**Gamma-Theta Tradeoff:**
- Theta: +10/day = Rs 300/day. Strong and consistent.
- Gamma: -0.003. Minimal daily gamma impact at current distance.
- Ratio: Strongly theta-favorable for first 7 days. Monitor in last 3 days.

### 2. Qualitative Failure Mode Analysis

| Failure Mode | Severity | Probability | Mitigation |
|-------------|----------|-------------|------------|
| BN rallies to 55,000 (short strike) | CRITICAL | Low (15-20%) | 2.9% rally needed. Roll up adjustment. |
| Geopolitical de-escalation rally | Medium | Low (10-15%) | Adjustment: roll to 55500/56000 |
| Banking sector rotation to outperformance | Medium | Low (10%) | Oil shock thesis argues against |
| IV spike increases spread width | Low | Medium (20%) | Small vega exposure. Manageable. |
| Quarterly settlement buying pressure | Low | Low (5-10%) | Net selling more likely than buying |

### 3. Pro/Con Debate

**ADVOCATE**: The simplest, most reliable strategy in the monthly portfolio. 2.9% buffer to short strike. High probability of profit (>75%). The oil-to-banking transmission channel provides fundamental anchoring. Quarterly settlement adds selling pressure. Strong theta with minimal Greek exposure concerns. Defined risk.

**ADVERSARY**: The 1:0.39 risk-reward is poor — you risk Rs 10,800 to make Rs 4,200. Any single loss wipes out 2.6 wins. The strategy needs a 72%+ win rate just to break even after costs. While the current macro thesis supports it, a single ceasefire/policy surprise can trigger max loss.

**ADJUDICATION**: Solid but unspectacular. The high probability of profit compensates for the poor R:R, but the strategy is essentially a "slow grind" income play. Best suited as a PORTFOLIO COMPONENT alongside higher-R:R bearish strategies, not as a standalone play. Rating: RELIABLE PASS.

### 4. Historical Stress Test

| Scenario | Strategy Outcome |
|----------|-----------------|
| Jun 2022: BN sideways-to-lower for 2 weeks | Full credit captured. Rs 4,200 profit. |
| Nov 2024: BN rallied 4% in 2 sessions | Max loss Rs 10,800. Unable to adjust in time. |
| Jan 2023: BN ranged 2% for 3 weeks | Full credit. Rs 4,200. |

### 5. SEBI: COMPLIANT. Bank Nifty monthly on NSE.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 7 |
| Exit Discipline | 7 |
| Risk-Reward | 4 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 6 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 6 |
| Failure Mode Resilience | 7 |
| Greeks Robustness | 7 |

**Raw Score: 75/110**
**Deductions:** None
**Final Score: 75/110**
**Verdict: PASS — Reliable income strategy. Best as portfolio component.**

---

## Strategy M-2: Bank Nifty Bearish Put Christmas Tree

### 1. Greeks Stress Test
- Delta: -0.25. 1-sigma down (BN 51,664): Upper spread deep ITM. Approaching max profit zone. ~Rs 18,000 profit.
- 2-sigma down (49,901): Below 52,000. Lower wing gets tested. Net payout still positive but declining toward lower breakeven.
- 3-sigma down (48,138): Below all strikes. Naked put exposure generates Rs 15,000+ loss.
- Gamma: Near neutral at entry. Becomes negative below 52,000 as sold puts dominate.
- Vega: -2.5. Moderate short vega. -3 IV = Rs 2,250 gain.
- **Key risk**: The 1-3-2 structure has 1 naked short put equivalent below 52,000. This is the tail risk.

### 2. Failure Modes
- 6-leg execution risk: 3+2=5 lots beyond the first. Significant slippage.
- Transaction costs Rs 289 + slippage Rs 300-500 = Rs 589-789 against Rs 3,900 debit = 15-20% drag.
- Gap down below 52,000 exposes naked put equivalent.

### 3. Pro/Con Debate
**ADVOCATE**: 1,500-pt profit zone is ideal for Bank Nifty's volatility. Ultra-cheap entry (130 pts for 1,000-pt spread). Quarterly premium inflates sold options.
**ADVERSARY**: 6-leg execution is operationally complex and expensive. The cost drag (15-20%) is severe. Below 52,000, the structure has undefined risk. The "PSU vs private bank divergence" thesis is speculative.
**ADJUDICATION**: Strong theoretical structure but practical execution challenges are significant. The cost erosion from 6 legs materially reduces the edge.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 6 |
| Entry Precision | 5 |
| Exit Discipline | 6 |
| Risk-Reward | 7 |
| Liquidity Feasibility | 4 |
| Historical Evidence | 3 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 5 |

**Raw Score: 62/110**
**Deductions:** -5 [COST_EROSION_RISK]
**Final Score: 57/110**
**Verdict: CONDITIONAL PASS — Interesting structure but execution costs erode edge significantly**

---

## Strategy M-3: Nifty Bearish Reverse Jade Lizard

### 1. Greeks Stress Test
- Delta: -0.25. Moderate bearish.
- 1-sigma up (23,423): Short 23,800 call safe (377 pts buffer still). Manageable.
- 1-sigma down (22,777): Put spread approaching sold strike. Position profitable.
- 2-sigma up (23,746): Short call nearly ATM. Position turning negative. ADJUSTMENT REQUIRED.
- 3-sigma up (24,069): Short call ITM. Without adjustment: loss = (24,069-23,800) x 65 - credit = Rs 6,435.
- 2-sigma down (22,453): Below put spread. Put side max loss = (500-170) x 65 = Rs 21,450. CRITICAL.
- Gamma: -0.02. Mild negative. Both wings contribute.
- Vega: -4.5. Heavily short vega. VIX normalization = strong benefit.
- Theta: +20/day = Rs 1,300/day. Excellent.

### 2. Failure Modes
- **CRITICAL: Naked call at 23,800.** Geopolitical de-escalation can cause sharp rally. Mar 2022: Ceasefire rumors caused 500-pt intraday rally.
- Dual-risk profile: Can lose on BOTH sides (unlike most strategies that lose on only one).
- High margin: Rs 1,60,000-2,00,000 locks significant capital.

### 3. Pro/Con
**ADVOCATE**: Dual-sided premium selling in high VIX. Theta +20/day. Strongly short vega aligns with VIX normalization.
**ADVERSARY**: Naked call is dangerous in geopolitical environment where ceasefire/de-escalation can trigger sudden rallies. Dual-risk = can lose both ways. High margin.
**ADJUDICATION**: Strong income strategy but the naked call in a geopolitical environment is a structural vulnerability. Only suitable for traders who will ACTIVELY manage the call-side adjustment.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 6 |
| Exit Discipline | 6 |
| Risk-Reward | 5 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 4 |
| IV Regime Alignment | 8 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 4 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 6 |

**Raw Score: 67/110**
**Deductions:** -10 (CRITICAL unmitigated failure: naked call in geopolitical environment)
**Final Score: 57/110**
**Verdict: CONDITIONAL PASS — Requires active call-side management. Not for passive traders.**

---

## Strategy M-4: Nifty Bearish Jade Lizard (Zero Upside Risk)

### 1. Greeks Stress Test
- Delta: -0.17. Mild bearish.
- 1-sigma up: Position STILL PROFITABLE (zero upside risk). Rs 1,430 net profit even at 24,000+. UNIQUE.
- 1-sigma down (22,777): Approaching sold 22,500 put. ~Rs 5,000 profit from theta decay.
- 2-sigma down (22,453): Put just below 22,500. Loss starting: (22,500-22,453) x 65 - credit = small gain still.
- 3-sigma down (22,130): Deep ITM put. Loss = (22,500-22,130) x 65 - 122 credit = Rs 16,120.
- 5% gap down (21,945): (22,500-21,945) x 65 - 122 x 65 = Rs 28,210 loss. Significant but manageable with stop.
- Gamma: -0.015. Mild.
- Vega: -2.8. Short vega = VIX normalization benefits.
- Theta: +12/day = Rs 780/day.

### 2. Failure Modes
| Mode | Severity | Probability | Notes |
|------|----------|-------------|-------|
| Nifty rallies 1,000+ pts | ZERO RISK | Any | UNIQUE: still profits Rs 1,430 |
| Nifty crash below 22,500 | High | Medium (25-30%) | Naked put. Stop required. |
| Moderate decline to 22,500 | Medium | Medium (20%) | Near breakeven zone |

### 3. Pro/Con
**ADVOCATE**: The ONLY bearish strategy with ZERO upside risk. In a geopolitical environment with ceasefire uncertainty, this is invaluable. Even if Iran-Israel resolves and market rallies 5%, this position STILL PROFITS. The naked put risk is the only concern, and it's manageable with stops.
**ADVERSARY**: The Rs 7,930 credit is modest. Margin of Rs 1,30,000-1,60,000 for Rs 7,930 = 5-6% ROM. The naked put at 22,500 is concerning in a market moving 500-750 pts per day.
**ADJUDICATION**: The zero-upside-risk property is genuinely unique and extremely valuable in the current geopolitical environment. This addresses the biggest vulnerability of every other bearish strategy: sudden rally risk. The modest credit is the price of this insurance. STRONG PASS as a portfolio hedge component.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 9 |
| Entry Precision | 7 |
| Exit Discipline | 7 |
| Risk-Reward | 6 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 5 |
| IV Regime Alignment | 8 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 9 |
| Greeks Robustness | 7 |

**Raw Score: 80/110**
**Deductions:** None
**Final Score: 80/110**
**Verdict: STRONG PASS — Unique zero-upside-risk property. Essential portfolio hedge.**

---

## Strategy M-5: Nifty Bearish Put Ladder

### 1. Greeks Stress Test
- Delta: -0.35. Moderately strong bearish.
- 1-sigma down: Long put gains significantly. Sold puts at 22,500 approach ATM. P&L: ~Rs 8,000-12,000.
- 2-sigma down (22,453): Both sold strikes being tested. 22,500 ATM, 22,000 still OTM. Max profit zone. ~Rs 20,000-26,000.
- 3-sigma down (22,130): Near 22,000 sold strike. Below this, naked put risk begins.
- Below 21,400: Net position goes negative. Unlimited loss without adjustment.
- Gamma: -0.015. Mild negative from 2 sold options.
- Vega: -2.8. Benefits from IV contraction.
- Theta: +14/day = Rs 910/day. Strong.

### 2. Failure Modes
- Naked 22,000 put: If Nifty crashes below 21,400, losses escalate. Requires adjustment.
- 1,500-pt profit zone is excellent but the lower breakeven at 21,415 is far (7.3% from current). Low probability of breach but catastrophic if it happens.
- Margin: Rs 1,40,000-1,70,000.

### 3. Pro/Con
**ADVOCATE**: 1,500-pt profit zone with strong theta. Maps to the staircase support structure. 2.2:1 R:R on upside risk.
**ADVERSARY**: The naked put at 22,000 is dangerous. The ladder inherits ratio spread risk without the full ratio spread leverage.
**ADJUDICATION**: Solid strategy with good profit zone width. The staircase thesis is reasonable for quarterly expiry. But the naked put creates tail risk that needs active management.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 6 |
| Exit Discipline | 6 |
| Risk-Reward | 7 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 5 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 5 |
| Greeks Robustness | 6 |

**Raw Score: 71/110**
**Deductions:** None
**Final Score: 71/110**
**Verdict: PASS — Good staircase play. Monitor lower tail risk.**

---

## Strategy M-6: Midcap Nifty Bear Put Spread

### 1. Greeks Stress Test
- Delta: -0.40. Strongly bearish.
- At 5-6 DTE, directional sensitivity is high. Each 100-pt Midcap move = ~Rs 4,800 P&L change.
- Gamma: +0.025. Positive gamma benefits from big moves.
- Theta: -12/day = -Rs 1,440/day. Negative theta. Working against the position.
- Vega: +0.7. Mildly long vega.

### 2. Failure Modes
- **CRITICAL: Liquidity.** Midcap Nifty options are among the least liquid index options on NSE. 120-unit lots amplify slippage.
- Bid-ask: 8-20 pts. On 120 units, 15-pt slippage = Rs 1,800.
- Total execution cost (Rs 119 + Rs 1,800 slippage) = Rs 1,919 against Rs 24,000 debit = 8%.
- Beta thesis [STALE]: 1.5-2x beta needs current verification.
- Negative theta means the clock works against you from day 1.
- ATM strikes unspecified — placeholder values used.

### 3. Pro/Con
**ADVOCATE**: High-beta play targeting the midcap second wave. 120 units provides significant leverage.
**ADVERSARY**: Liquidity is terrible. 8% execution cost drag. Negative theta at 5-6 DTE. [STALE] beta thesis. Unspecified strikes.
**ADJUDICATION**: The thesis is INTERESTING (midcap lag + high beta) but the execution is POOR. Liquidity concerns are the killer. Midcap Nifty options are not suitable for multi-leg strategies given current market depth.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 6 |
| Entry Precision | 3 |
| Exit Discipline | 5 |
| Risk-Reward | 5 |
| Liquidity Feasibility | 2 |
| Historical Evidence | 3 |
| IV Regime Alignment | 5 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 3 |
| Greeks Robustness | 5 |

**Raw Score: 52/110**
**Deductions:** -5 [STALE] (beta thesis), -5 [COST_EROSION_RISK] (liquidity)
**Final Score: 42/110**
**Verdict: FAIL — Liquidity is insufficient for reliable execution. Interesting thesis but impractical.**

---

## Monthly Verifier Summary

| Strategy | Raw Score | Deductions | Final Score | Verdict |
|----------|-----------|------------|-------------|---------|
| M-1 Bear Call Spread | 75 | 0 | 75 | PASS |
| M-2 Christmas Tree | 62 | -5 | 57 | CONDITIONAL PASS |
| M-3 Rev Jade Lizard | 67 | -10 | 57 | CONDITIONAL PASS |
| M-4 Jade Lizard | 80 | 0 | 80 | STRONG PASS |
| M-5 Put Ladder | 71 | 0 | 71 | PASS |
| M-6 Midcap Bear Put | 52 | -10 | 42 | FAIL |

**Monthly Recommendation Ranking:**
1. M-4 Jade Lizard (80) — BEST: Zero upside risk. Portfolio essential.
2. M-1 Bear Call Spread (75) — Reliable income. Portfolio component.
3. M-5 Put Ladder (71) — Good staircase thesis. Active management needed.
4. M-2 Christmas Tree (57) — Interesting but execution costs erode edge.
5. M-3 Rev Jade Lizard (57) — Strong theta but naked call risk in geopolitical regime.
6. M-6 Midcap Bear Put (42) — FAIL: Liquidity insufficient.
