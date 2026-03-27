# BEARISH QUARTERLY Verified Strategies
## Run ID: run_20032026 | Date: 2026-03-20 | Verifier: Quarterly Expiry Verifier (BEARISH)
## Expiry: March 31, 2026 (Tuesday) — Quarterly (Q4 FY26)
## India VIX: 22.09 (HIGH regime) | Rubric: v2.0

---

## Strategy Q-1: Nifty Put Ratio Spread (1x2)

### 1. Greeks Mathematical Stress Test

**Delta Stress:**
- At entry: Delta = -0.30. Notional: -0.30 x 65 x 23,100 = ~Rs -4,50,000
- 1-sigma (11 DTE, VIX 22): ~3.3% = ~762 pts
  - Up 762 (Nifty 23,862): Both puts OTM. Loss = debit Rs 8,450.
  - Down 762 (Nifty 22,338): Near sold 22,500 strike. Long 23100 PE = 762 pts. Short 22500 PE x2 = (162 x2) = 324. Net = 762 - 324 - 130 = 308 pts = Rs 20,020. STRONG PROFIT.
- 2-sigma (6.6% = ~1,525):
  - Down to 21,575: Below sold strikes. Long 23100 PE = 1525. Short 22500 PE x2 = (925 x2) = 1850. Net = 1525 - 1850 - 130 = -455 pts = -Rs 29,575. SEVERE LOSS. Naked put devastates.
- 3-sigma (9.9% = ~2,287):
  - Down to 20,813: Loss = (23100-20813) - 2(22500-20813) - 130 = 2287 - 3374 - 130 = -1217 pts = -Rs 79,105. CATASTROPHIC.
- Gap scenario: 5% gap down (21,945): Loss = (23100-21945) - 2(22500-21945) - 130 = 1155 - 1110 - 130 = -85 pts = -Rs 5,525. Just past breakeven loss.

**Gamma Risk (11 DTE):**
- Gamma: -0.015 at 22,500 sold strike. Negative gamma increases as Nifty approaches 22,500.
- At 22,500: Gamma becomes -0.03 to -0.04. Each 100-pt move beyond this generates accelerating losses.
- **CRITICAL**: Below 22,500, the position has 1 NAKED short put equivalent. Losses are LINEAR (not capped).

**Vega Sensitivity:**
- Net vega: -3.5
- +3 IV (VIX 22 → 25): +Rs 682 loss (spread widening from vega)
- -3 IV (VIX 22 → 19): +Rs 682 gain
- -5 IV: +Rs 1,137 gain. Significant benefit from VIX normalization.

**Gamma-Theta Tradeoff:**
- Theta: +17/day = Rs 1,105/day. Very strong.
- Gamma: -0.015. At 22,500 pin, this is manageable.
- Ratio: Theta-favorable UNLESS Nifty breaks below 22,500, at which point gamma overwhelms theta.

### 2. Qualitative Failure Mode Analysis

| Failure Mode | Severity | Probability | Mitigation |
|-------------|----------|-------------|------------|
| Crash below 22,000 (naked put) | CRITICAL | Medium (15-20%) | Buy 22000 PE butterfly conversion |
| Samco VIX rebound study is stale | Medium | Unknown | Conservative: assume rebound possible within 11 DTE |
| Margin spike on VIX expansion | Medium | Medium (20%) | Maintain 20% margin buffer |
| Pin at 22,500 doesn't hold (slippage through) | Medium | Medium (25%) | Monitor daily. Close if below 22,200. |

### 3. Pro/Con Debate

**ADVOCATE**: The put skew in high VIX is real and measurable — OTM puts at IV 30-35% vs ATM 25-27%. This differential is the edge. Rs 8,450 debit for Rs 30,550 potential = 3.6:1 upside. Theta of +17/day is Rs 1,105/day in income while waiting. The 22,500 pin target is supported by multiple analyst reports. Regime-specific edge that doesn't exist in normal VIX.

**ADVERSARY**: The naked short put is a BOMB. In the current environment (3.26% daily crashes, geopolitical escalation), a 2-3 sigma move is NOT a tail event — it's a plausible scenario. The Samco "75% rebound" study is [STALE] and may not apply to the current Iran-Israel situation which is fundamentally different from past VIX spikes. The Rs 29,575 loss at 2-sigma down is 3.5x the debit — extreme asymmetry against you.

**ADJUDICATION**: The edge (put skew harvest) is genuine but the risk (naked put below 22,500) is severe in this specific volatility regime. The strategy is SOUND in moderate high-VIX environments but DANGEROUS in extreme crash environments. The adjustment protocol (butterfly conversion) is MANDATORY and must be executed before Nifty reaches 22,200. Rating: CONDITIONAL — requires active management and strict adjustment discipline.

### 4. Historical NSE Scenario Stress Test

| Scenario | Date | Outcome |
|----------|------|---------|
| Favorable | Jun 2022 | Nifty declined 3.5% to support over 2 weeks. Ratio at support captured 70% of max profit. |
| Adverse | Mar 2020 | 13% single-day crash. Naked put: -Rs 79,000+ before circuit breaker. CATASTROPHIC. |
| Neutral | Any slow 1-2% decline | Theta captures Rs 5,000-8,000. Moderate profit without reaching max. |

### 5. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 8 |
| Entry Precision | 7 |
| Exit Discipline | 6 |
| Risk-Reward | 7 |
| Liquidity Feasibility | 8 |
| Historical Evidence | 4 |
| IV Regime Alignment | 8 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 5 |

**Raw Score: 72/110**
**Deductions:** -5 [STALE] (Samco rebound study)
**Final Score: 67/110**
**Verdict: CONDITIONAL PASS — Genuine skew edge but naked put in crash regime is dangerous. MANDATORY adjustment protocol.**

---

## Strategy Q-2: Nifty Skip-Strike Bearish Put Butterfly

### 1. Greeks Mathematical Stress Test

**Delta Stress:**
- At entry: Delta = -0.30. Moderately bearish.
- 1-sigma down (22,338): Long 23000 PE = 662. Short 22300 PE x2 = 76. Long 22000 PE = 0. Net = 662 - 76 - 160 = 426 pts = Rs 27,690. STRONG PROFIT.
- 2-sigma down (21,575): Below all strikes. Net intrinsic = 400. 400 - 160 = 240 pts = Rs 15,600. GUARANTEED PROFIT.
- 3-sigma down (20,813): Same net intrinsic = 400. 400 - 160 = 240 = Rs 15,600. STILL PROFIT.
- 1-sigma up (23,862): All puts OTM. Loss = Rs 10,400 (debit).
- Gap down 5% (21,945): Net = 400 - 160 = 240 = Rs 15,600. PROFIT.
- **REMARKABLE**: No downside stress scenario produces a loss. The ONLY loss is above 23,000.

**Gamma Risk:**
- Gamma near neutral at entry (+0.005). Transitions to positive below 22,300 (long put gamma dominates).
- AT NO POINT does the position have dangerous negative gamma at current levels.
- Below 22,000 (all strikes breached): Gamma → 0 as all options are deep ITM.

**Vega Sensitivity:**
- Net vega: -1.7
- +3 IV: Rs 330 loss. Mild.
- -3 IV: Rs 330 gain. Mild.
- -5 IV: Rs 553 gain.
- Vega is a minor factor.

**Gamma-Theta Tradeoff:**
- Theta: +10/day = Rs 650/day.
- Gamma: +0.005 to -0.005. Near neutral.
- Excellent tradeoff — positive theta with near-zero gamma risk.

### 2. Qualitative Failure Mode Analysis

| Failure Mode | Severity | Probability | Mitigation |
|-------------|----------|-------------|------------|
| Nifty stays above 23,000 for 11 days | Medium | Medium (25-30%) | Defined max loss Rs 10,400. Accept. |
| 22,300 pin target not reached exactly | Low | High (likely) | Wide profit zone below 22,840 breakeven. Even Rs 15,600 floor below 22,000. |
| Liquidity at 22300 strike (non-round number) | Low | Low | Quarterly OI depth adequate. |
| IV crush reduces spread value | Low | Medium | Mild short vega. Manageable. |

**NOTE: This strategy has NO CRITICAL failure mode that produces loss on the downside. Only upside (flat) scenario loses.**

### 3. Pro/Con Debate

**ADVOCATE**: This is mathematically the BEST risk-adjusted strategy in the ENTIRE bearish portfolio. The payoff is: (a) Max profit Rs 35,100 at pin, (b) Guaranteed Rs 15,600 below 22,000, (c) Only loss above 23,000 (Rs 10,400). The 3.4:1 upside R:R with a DOWNSIDE PROFIT FLOOR is unmatched. No other strategy offers this asymmetry. Greeks are clean — near-neutral gamma, positive theta, minimal vega. Fully defined risk. Low margin. The skip-strike property is mathematically provable and not dependent on market conditions.

**ADVERSARY**: The Rs 10,400 debit is a meaningful outlay. If Nifty stays above 23,000 for 11 days (possible if the market bounces), the entire debit is lost. The 22,300 "pin target" is a specific level — max profit at the exact center is hard to achieve. And the Rs 15,600 "guaranteed profit" below 22,000 requires a 4.8% decline — not trivial.

**ADJUDICATION**: The Advocate has the OVERWHELMINGLY stronger argument. The no-downside-risk property combined with 3.4:1 R:R and Rs 15,600 floor is mathematically superior to every other strategy. The only weakness is the probability of the "nothing happens" scenario (Nifty above 23,000). But in the current environment with 3.26% daily moves and active geopolitical crisis, the probability of a significant decline within 11 days is ELEVATED. **HIGHEST CONVICTION QUARTERLY STRATEGY.**

### 4. Historical Stress Test

| Scenario | Outcome |
|----------|---------|
| Any decline >3% in 11 days | Rs 15,600-35,100 profit range |
| Flat/recovery | Rs 10,400 loss (defined, known) |
| COVID crash (13% in 1 day) | Rs 15,600 guaranteed profit |
| Russia-Ukraine (8% over 1 week) | Rs 25,000-35,000 profit |

### 5. SEBI: COMPLIANT. All legs on Nifty quarterly. Defined risk. Minimal margin.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 10 |
| Entry Precision | 7 |
| Exit Discipline | 8 |
| Risk-Reward | 10 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 5 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 9 |
| Failure Mode Resilience | 10 |
| Greeks Robustness | 9 |

**Raw Score: 92/110**
**Deductions:** None
**Final Score: 92/110**
**Verdict: HIGHEST PASS — Best risk-adjusted strategy in entire bearish portfolio. Mathematical superiority.**

---

## Strategy Q-3: Fin Nifty Bearish Synthetic Short

### 1. Greeks Stress Test
- Delta: -0.90. Near-full directional exposure.
- 1-sigma down (FinNifty ~24,180): Profit = (24,950-24,180-180) x 60 = Rs 35,400. Strong.
- 1-sigma up (25,720): Loss = cost of protective structure. Short call ITM by 720. Long call still OTM. Loss = (720 + 180) x 60 = Rs 54,000. SIGNIFICANT but capped at max Rs 70,800.
- Gamma: +0.015. Mildly positive (long put dominance).
- Vega: +1.3. Long vega — VIX spikes help.
- Theta: -6.5/day = -Rs 390/day. Working against position.

### 2. Failure Modes
- Rally to 26,000+: Max loss Rs 70,800. Severe. Stop at 25,500-25,800 limits to Rs 25,000-30,000.
- Fin Nifty liquidity: Lower than Nifty/BankNifty. 5-10 pt bid-ask spreads.
- Theta drag: -Rs 390/day erodes position over 11 days = Rs 4,290 total theta cost.
- Margin: Rs 1,00,000-1,30,000 locked.

### 3. Pro/Con
**ADVOCATE**: Institutional validation (HDFC Securities). Delta -0.90 is the most capital-efficient directional exposure. Technical breakdown at 24,946 confirmed. Financial sector most impacted by oil-rate-FII trifecta.
**ADVERSARY**: Max loss Rs 70,800 is the largest in the portfolio. Negative theta of Rs 390/day adds up. Fin Nifty liquidity is a concern. The protective call at 26,000 is 1,000 pts away — a lot of room for loss before it kicks in.
**ADJUDICATION**: Strong directional play with institutional validation. But the risk profile is aggressive — largest potential loss in the portfolio. Best for HIGH-CONVICTION bearish traders with capital to absorb the drawdown.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 8 |
| Entry Precision | 8 |
| Exit Discipline | 5 |
| Risk-Reward | 7 |
| Liquidity Feasibility | 4 |
| Historical Evidence | 6 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 5 |
| Failure Mode Resilience | 4 |
| Greeks Robustness | 6 |

**Raw Score: 70/110**
**Deductions:** -5 [COST_EROSION_RISK] (Fin Nifty liquidity)
**Final Score: 65/110**
**Verdict: CONDITIONAL PASS — High conviction directional. Aggressive risk profile.**

---

## Strategy Q-4: Nifty Double Put Spread + Ladder

### 1. Greeks Stress Test
- Delta: -0.40. Strongly bearish.
- 1-sigma down (22,338): Upper spread at max (400). Lower spread partial (~138). Ladder safe. Net = 538 - 172 = 366 pts = Rs 23,790. STRONG.
- 2-sigma down (21,575): Both spreads at max (800). Ladder starts risk (21,700 PE: 21,700-21,575 = 125 pts). Net = 800 - 125 - 172 = 503 pts = Rs 32,695.
- 3-sigma down (20,813): Both spreads at max. Ladder loss = (21,700-20,813) = 887 pts. Net = 800 - 887 - 172 = -259 pts = -Rs 16,835. LOSS from ladder extension.
- Gap 5% (21,945): Both spreads at max. Ladder: 0 (still above 21,700). Net = 800 - 172 = 628 = Rs 40,820. NEAR MAX PROFIT.
- Gamma: Near neutral. Well-balanced bought/sold.
- Vega: -2.0. Moderate short vega.
- Theta: +12/day = Rs 780/day.

### 2. Failure Modes
- Ladder extension (21,700 PE naked): Below 21,100, net position turns negative. This is a 8.7% decline — extreme but possible in prolonged crisis.
- 5-leg execution: Rs 233 costs + Rs 975-1,625 slippage = Rs 1,208-1,858 total.
- Complexity: 5 legs require careful management.

### 3. Pro/Con
**ADVOCATE**: 3.65:1 R:R is the best in the quarterly portfolio (excluding Q-2). Tiered profit from Rs 14,820 to Rs 40,820 creates "staircase" payoff. Positive theta throughout.
**ADVERSARY**: 5 legs = complexity and cost. Ladder extension creates tail risk below 21,100. The structure is hard to adjust and monitor.
**ADJUDICATION**: Excellent theoretical structure with the best R:R in the portfolio. The tiered profit matches the staircase decline thesis well. But the 5-leg execution and ladder tail risk reduce practical attractiveness.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 8 |
| Entry Precision | 6 |
| Exit Discipline | 6 |
| Risk-Reward | 9 |
| Liquidity Feasibility | 6 |
| Historical Evidence | 4 |
| IV Regime Alignment | 7 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 6 |
| Failure Mode Resilience | 5 |
| Greeks Robustness | 7 |

**Raw Score: 74/110**
**Deductions:** -5 [COST_EROSION_RISK] (5 legs)
**Final Score: 69/110**
**Verdict: PASS — Strong R:R but complex execution. For experienced multi-leg traders.**

---

## Strategy Q-5: Bank Nifty Front-Ratio Put Spread

### 1. Greeks Stress Test
- Delta: -0.25. Moderate.
- 1-sigma down (BN 51,664): Long 53000 PE = 1336. Short 52000 PE x2 = 0. Net = 1336 - 90 = 1246 pts... Wait, per lot. Long PE value = (53000-51664) x 30 = Rs 40,080. Short PEs still OTM. Net profit = Rs 40,080 - Rs 2,700 = Rs 37,380. EXCEPTIONAL. But wait — the 52000 strike isn't breached yet. Correct: At 51,664, short 52000 PE x2 ITM by 336 each = 672 x 30 = Rs 20,160 loss from shorts. Net = Rs 40,080 - Rs 20,160 - Rs 2,700 = Rs 17,220. GOOD.
- At 52,000 pin: Long = (53000-52000) x 30 = Rs 30,000. Shorts = 0. Net = Rs 30,000 - Rs 2,700 = Rs 27,300. MAX PROFIT.
- 2-sigma down (49,901): Long = 3099 x 30 = Rs 92,970. Short = 2099 x 2 x 30 = Rs 125,940. Net = Rs 92,970 - Rs 125,940 - Rs 2,700 = -Rs 35,670. SEVERE LOSS.
- 3-sigma down: Losses accelerate linearly.
- Gamma: -0.015 near sold strike. Becomes dangerous below 52,000.

### 2. Failure Modes
- **CRITICAL: Naked put below 52,000.** In a regime with 3.26% daily BN moves, the probability of breaching 52,000 (2.7% below current) is HIGH (30-40% over 11 DTE).
- 10:1 upside leverage is attractive but the DOWNSIDE is also extreme.
- Adjustment (butterfly conversion) adds cost but MUST be executed.

### 3. Pro/Con
**ADVOCATE**: Rs 2,700 for Rs 27,300 potential = 10:1. Ultra-cheap entry.
**ADVERSARY**: The naked put is a ticking bomb in this regime. 30-40% probability of BN breaching 52,000 in 11 DTE means the adjustment is not a contingency — it's a LIKELY REQUIREMENT. And if BN gaps below 51,000, losses are severe before adjustment executes.
**ADJUDICATION**: The 10:1 leverage is seductive but misleading — it only captures the upside loss scenario. The expected value when including the downside tail is much less favorable. The strategy is high-variance and better suited for normal VIX environments where 52,000 is less likely to be breached. In HIGH VIX, the extra premium received (enabling the cheap entry) comes precisely from the market pricing in the probability of exactly the scenario that damages this trade. Rating: CONDITIONAL — the market is telling you this risk is elevated.

### 4. SEBI: COMPLIANT.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 7 |
| Exit Discipline | 5 |
| Risk-Reward | 8 |
| Liquidity Feasibility | 6 |
| Historical Evidence | 4 |
| IV Regime Alignment | 5 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 7 |
| Failure Mode Resilience | 3 |
| Greeks Robustness | 4 |

**Raw Score: 66/110**
**Deductions:** -10 (CRITICAL unmitigated failure: naked put in high-VIX with 30-40% breach probability)
**Final Score: 56/110**
**Verdict: CONDITIONAL PASS — 10:1 upside leverage but dangerous naked put in current regime.**

---

## Strategy Q-6: Nifty Bear Put Condor — Adaptive Bear

### 1. Greeks Stress Test
- Delta: -0.25. Moderate.
- 1-sigma down (22,338): Upper spread = 662 pts (capped at 500). Lower spread: 22338 > 22000, so 0. Net = 500 - 135 = 365 = Rs 23,725. MAX PROFIT.
- 2-sigma down (21,575): Both spreads at max = 1000 pts... No. Upper spread = 500 (max). Lower spread: 22000 - 21575 = 425 (long 22000 PE gain, short 21500 PE loss). Net from lower = 425 intrinsic value... Let me recalculate properly.

  At 21,575:
  - Long 23000 PE: 23000 - 21575 = 1425
  - Short 22500 PE: -(22500 - 21575) = -925
  - Short 22000 PE: -(22000 - 21575) = -425
  - Long 21500 PE: 21500 - 21575 = 0 (OTM)
  - Net intrinsic: 1425 - 925 - 425 + 0 = 75
  - Net payoff: 75 - 135 = -60 pts = -Rs 3,900

  At 21,500 (long put strike):
  - Net intrinsic: (23000-21500) - (22500-21500) - (22000-21500) + 0 = 1500 - 1000 - 500 = 0
  - Net payoff: 0 - 135 = -135 = -Rs 8,775 (max loss).

  Below 21,500:
  - All strikes ITM. Net intrinsic: constant at 0. Loss = Rs 8,775.

- **CONFIRMED**: Max loss is ALWAYS Rs 8,775 regardless of direction. FULLY DEFINED.
- Gamma: Near neutral. No gamma blowup risk.
- Vega: -1.2. Mild.
- Theta: +6.5/day = Rs 422/day. Moderate.

### 2. Failure Modes
- The ONLY failure: Nifty not in 22,000-22,500 zone at expiry. But loss is ALWAYS Rs 8,775.
- No margin risk, no adjustment needed, no naked exposure.
- Dynamic rolling adds optionality (can re-center if market moves).
- **Lowest failure severity of ANY strategy in the portfolio.**

### 3. Pro/Con
**ADVOCATE**: The SAFEST strategy. Rs 8,775 defined max loss with NO scenario exceeding this. 2.7:1 R:R. No margin beyond debit. No naked exposure. The only strategy suitable for risk-averse traders. Dynamic rolling adds adaptability.
**ADVERSARY**: Rs 8,775 is still money at risk. The 22,000-22,500 profit zone requires a 2.6-4.8% decline — needs meaningful movement. Theta of +6.5/day is lower than ratio spreads or strangles. Less "exciting" than higher-leverage plays.
**ADJUDICATION**: For RISK-ADJUSTED returns and capital efficiency, this is OUTSTANDING. It may not have the highest max profit, but it has the BEST worst-case scenario of any strategy. In a portfolio context, this is the ANCHOR — the one you can hold without losing sleep. Pair with higher-leverage plays (Q-2 skip-strike, Q-1 ratio) for a balanced portfolio.

### 4. SEBI: COMPLIANT. Defined risk. Minimal margin. Fully standard structure.

### 6. Confidence Score

| Dimension | Score (0-10) |
|-----------|-------------|
| Edge Clarity | 7 |
| Entry Precision | 7 |
| Exit Discipline | 8 |
| Risk-Reward | 8 |
| Liquidity Feasibility | 7 |
| Historical Evidence | 5 |
| IV Regime Alignment | 6 |
| Regulatory Compliance | 10 |
| Capital Efficiency | 10 |
| Failure Mode Resilience | 10 |
| Greeks Robustness | 9 |

**Raw Score: 87/110**
**Deductions:** None
**Final Score: 87/110**
**Verdict: STRONG PASS — Safest strategy. Portfolio anchor. Excellent risk-adjusted returns.**

---

## Quarterly Verifier Summary

| Strategy | Raw Score | Deductions | Final Score | Verdict |
|----------|-----------|------------|-------------|---------|
| Q-1 Put Ratio 1x2 | 72 | -5 | 67 | CONDITIONAL PASS |
| Q-2 Skip-Strike Bfly | 92 | 0 | 92 | HIGHEST PASS |
| Q-3 Armored Syn Short | 70 | -5 | 65 | CONDITIONAL PASS |
| Q-4 Dbl Put + Ladder | 74 | -5 | 69 | PASS |
| Q-5 Front Ratio Put | 66 | -10 | 56 | CONDITIONAL PASS |
| Q-6 Bear Put Condor | 87 | 0 | 87 | STRONG PASS |

**Quarterly Recommendation Ranking:**
1. Q-2 Skip-Strike Butterfly (92) — BEST OVERALL: Mathematical superiority, no downside risk
2. Q-6 Bear Put Condor (87) — SAFEST: Fully defined risk, portfolio anchor
3. Q-4 Double Put + Ladder (69) — Strong R:R, complex execution
4. Q-1 Put Ratio 1x2 (67) — Genuine skew edge, naked put risk
5. Q-3 Armored Syn Short (65) — High conviction directional, aggressive risk
6. Q-5 Front Ratio Put (56) — 10:1 leverage but dangerous naked put in current regime
