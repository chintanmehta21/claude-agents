# BEARISH WEEKLY Enriched Strategies
## Run ID: run_20032026 | Date: 2026-03-20 | Orchestrator: Strategy Orchestrator (BEARISH)
## Expiry: March 24, 2026 (Tuesday) — Weekly
## India VIX: 22.09 (HIGH regime)

---

## Strategy W-1: Nifty Bearish Broken-Wing Put Butterfly — Geopolitical Momentum Fade
**Source Scouts:** WebSearch (S1-Strategy1)
**Dedup Status:** UNIQUE

### Structure
Broken-Wing Put Butterfly (BWB): Buy 1 lot 23000 PE, Sell 2 lots 22700 PE, Buy 1 lot 22200 PE
- Wing widths: Upper 300 pts, Lower 500 pts (broken wing)
- Net Debit: 25 points = Rs 1,625 per spread
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty at ~23,100. RSI oversold, MACD sell signals intact. Support 22,900; breakdown targets 22,500-22,000. Resistance 23,250. Bearish below 23,604.
- **Fundamental**: Brent crude >$100/bbl, FII persistent selling, Iran-Israel geopolitical premium.
- **IV Environment**: VIX 22.09 HIGH. Elevated premiums favor credit-oriented structures. BWB benefits from time decay + IV contraction on wings.
- **Timing**: Enter Monday morning Mar 23 for Tuesday Mar 24 expiry. 1-day theta crush.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 23000 | 185 | 1 lot (65) |
| 2 | SELL | PUT | 22700 | 95 | 2 lots (130) |
| 3 | BUY | PUT | 22200 | 30 | 1 lot (65) |

### Exit Conditions
- **Target**: Max profit at 22,700 pin = Rs 17,875
- **Stop Loss**: Exit if Nifty > 23,250 or debit exceeds 50 pts
- **Time Exit**: Close by 2:30 PM on expiry Tuesday
- **Adjustment**: If Nifty < 22,500, close lower wing to lock partial profit

### Risk-Reward
- Max Profit: Rs 17,875 (at 22,700 pin)
- Max Loss: Rs 11,375 (below 22,200) / Rs 1,625 (above 23,000)
- Breakevens: ~22,975 (upper) and ~22,225 (lower)
- Risk:Reward: ~1:2.8 (debit) to ~1:1.6 (downside)

### Greeks Exposure (at entry)
- Delta: -0.15 to -0.20
- Gamma: Near neutral at center, negative at wings
- Theta: +3 to +5 per day
- Vega: -0.5 to -1.0

### Transaction Cost Estimate
4 legs x Rs 20 brokerage + STT on sell premium (0.0625% on 2 x 95 x 65 = Rs 7.7) + exchange charges ~Rs 100 + GST ~Rs 25 = **~Rs 213 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- Nifty weekly options at 22700/23000 strikes: HIGH liquidity. Typical bid-ask spread: 1-3 points for ATM/near-ATM weeklies.
- 22200 strike (deep OTM): MODERATE liquidity. Bid-ask spread: 2-5 points.
- OI buildup: Heavy put writing at 22500-23000 zone. Call writing concentrated at 23500+.

### Enrichment: Performance History
- No specific backtest data available for Nifty BWB strategies in Indian markets.
- General BWB data (US markets, DataDrivenOptions): 21-day BWB on SPX shows ~55-60% win rate in moderate decline environments. Performance degrades in sharp crash scenarios (>3% single-day moves more frequent in 2024-2025).
- **India-specific**: BWB structures are less commonly backtested on Indian platforms. Quantsapp notes BWB is "slow but steady in making money amid volatility."
- **Applicability flag**: Current environment has high single-day move probability (3.26% crash on Mar 19) which challenges BWB's narrow pin-profit profile. [IV_MISMATCH potential — BWB prefers moderate moves, current regime has extreme moves]

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- **PCR**: Nifty PCR at 0.7158 (Mar 19) — below 0.8 indicates more call OI than put OI. Historically bearish signal (market makers hedge by selling underlying).
- **Max Pain**: Estimated near 23,000-23,200 range for Mar 24 weekly (call writers dominate above, put writers below).
- **OI Buildup**: Significant put writing at 22500-22700 zone (acts as support from option sellers' perspective). Heavy call writing at 23500+.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Feb 2020 pre-COVID selloff. Nifty declined 5% over 2 weeks. VIX rose from 15 to 22. BWB-type structures centered 300 pts below market would have hit pin zones within the controlled decline. Result: ~80% of max profit achievable.
2. **Adverse**: Mar 2020 COVID crash. Nifty fell 13% in 1 day (circuit breaker). VIX spiked to 83.6. BWB would have blown through all strikes — max loss realized on broken wing side. No time for adjustment.
3. **Neutral**: Oct 2024 pre-election consolidation. VIX at 18-20. Nifty ranged within 200 points for 5 sessions. BWB at support would have expired near max profit as theta crushed all premium.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH (22.09). BWB benefits from elevated OTM put premiums for the sold legs. However, HIGH VIX also means large moves are more probable, increasing the chance of blowing past the profit zone.
- **DTE**: 1 trading day (enter Monday for Tuesday expiry). Extreme theta advantage — entire time value evaporates. But gamma risk is also extreme near expiry.
- **Lot Size**: Nifty 65 — verified correct per Jan 2026 NSE revision.
- **SEBI Compliance**: All legs on NSE Nifty weekly (Tuesday expiry). No regulatory issues.
- **Flags**: None

### Edge Thesis
The BWB exploits high-VIX skew by selling 2 OTM puts at inflated premiums while defining risk with wings. The broken lower wing creates minimal debit entry. With 1 DTE, theta crush is the primary profit driver. The 22,700 pin zone aligns with analyst support targets. Superior R:R vs plain bear put spread.

---

## Strategy W-2: Nifty Put Ratio Backspread — "Apocalypse Hedge" Variant
**Source Scouts:** Reddit (S2-Strategy1)
**Dedup Status:** UNIQUE

### Structure
Put Ratio Backspread (1:2): Sell 1 lot 23100 PE, Buy 2 lots 22700 PE
- Net Credit: 30 points = Rs 1,950 credit per spread
- Distance: 400 pts between strikes
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty at 23,100 after 3.26% crash day. Market in freefall. RSI in "trending oversold" territory. Support at 22,900/22,500/22,000.
- **Fundamental**: Iran-Israel escalation, Brent >$100, FII selling accelerating. "Regime change, not dip."
- **IV Environment**: VIX 22.09 and rising. Backspread WANTS elevated IV — 2 bought OTM puts benefit MORE from further IV expansion. Net long gamma and vega.
- **Timing**: Enter Monday Mar 23 for Tuesday expiry. 1DTE gamma explosion maximizes payoff.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 23100 | 180 | 1 lot (65) |
| 2 | BUY | PUT | 22700 | 75 | 2 lots (130) |

### Exit Conditions
- **Target**: Nifty crash to 22,200 or below = Rs 8,450. At 22,000 = Rs 34,450.
- **Max Loss Zone**: Nifty settles at 22,700 exactly = Rs 24,050. Exit if hovering 22,800-22,600 in last 2 hours.
- **Time Exit**: If Nifty > 23,000 by 1 PM, close for credit retained (~Rs 1,950).
- **Adjustment**: None — binary payoff structure.

### Risk-Reward
- Max Profit: Theoretically unlimited to downside
- Max Loss: Rs 24,050 (at 22,700 pin)
- Credit Received: Rs 1,950 (if Nifty > 23,100)
- Breakevens: ~23,070 (upper) and ~22,330 (lower)

### Greeks Exposure (at entry)
- Delta: -0.05 to -0.15 initially (explodes to -0.60+ on big drop)
- Gamma: +0.05 to +0.08 (POSITIVE — accelerates profit on moves)
- Theta: -5 to -10 per day (NEGATIVE — gamma play, not theta play)
- Vega: +2.0 to +3.0 (LONG vega — profits from VIX spikes)

### Transaction Cost Estimate
3 legs x Rs 20 + STT on 1 sell (0.0625% of 180 x 65 = Rs 7.31) + exchange ~Rs 60 + GST ~Rs 20 = **~Rs 147 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 23100 PE (ATM): VERY HIGH liquidity. Bid-ask: 1-2 points.
- 22700 PE (OTM, 400 pts away): HIGH liquidity on weekly. Bid-ask: 1-3 points.
- Execution: All legs in liquid Nifty weekly — no slippage concerns.

### Enrichment: Performance History
- Backspreads are notoriously difficult to backtest due to path-dependency. No specific Nifty backtest data.
- General principle: Backspreads work best in crash environments (tail events). In the 2020 COVID crash, a 1:2 put backspread entered 1 day before the 13% crash would have generated 20-30x the credit received.
- In 2022 Russia-Ukraine VIX spike (50% in a week, Nifty -8%), backspreads with 1-2 DTE would have been highly profitable on the accelerating decline days.
- Risk: In moderate-decline days (1-2%), backspreads often land near max loss zone. These are more common than crashes.

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- PCR: 0.7158 — bearish signal.
- Weekly ATM puts (23100): Heavy OI, strong liquidity.
- 22700 zone: Moderate put OI — less congestion = easier for market to move through this zone.
- Implication: The 22,700 "max loss pin" zone may not have strong OI support to trap price.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Mar 9, 2020 — Nifty fell 5.6% in one session. VIX from 20 to 40+. A 1:2 put backspread would have generated massive profits as gamma kicked in. Credit entry preserved; downside profit exploded.
2. **Adverse**: Nov 2024 post-election rally. Nifty surged 1,000+ pts in 2 sessions. VIX collapsed from 18 to 11. Backspread would have lost the credit (minimal) but the structure meant loss was only the credit received — manageable.
3. **Neutral**: A flat day where Nifty moves 50-100 pts. Backspread retains the 30-pt credit. Boring but profitable on the upside-flat scenario.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH (22.09). Excellent for backspread — net long vega and gamma. If VIX spikes to 25+, this structure gains disproportionately.
- **DTE**: 1 day. Maximum gamma exposure. However, negative theta means the clock is against you — need the move to happen on the last day.
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: All legs on NSE Nifty weekly. Compliant.
- **Key Risk**: Max loss at exact 22,700 pin (Rs 24,050) is substantial. Low probability but high impact.
- **Flags**: None

### Edge Thesis
Credit entry + unlimited downside profit + positive vega = triple benefit vs plain put. This is the quintessential crash hedge. In a regime where 3.26% daily moves are occurring, the probability of a large move (which the backspread needs) is meaningfully elevated above normal.

---

## Strategy W-3: Sensex Bearish-Skewed Iron Condor — BSE "Fear Premium Extractor"
**Source Scouts:** Reddit (S2-Strategy4)
**Dedup Status:** UNIQUE

### Structure
Bearish-Skewed Iron Condor: Sell 73500 PE / Buy 72500 PE / Sell 76500 CE / Buy 77500 CE
- Put spread credit: 150 pts | Call spread credit: 70 pts | Total: 220 pts = Rs 4,400
- Put spread: 1000 pts wide (closer to ATM) | Call spread: 1000 pts wide (far OTM)
- Underlying: Sensex (BSE) | Lot size: 20 units

### Entry Conditions
- **Technical**: Sensex at ~74,200. Support at 73,000-73,500. Resistance at 76,000-77,000.
- **Fundamental**: Same macro: Iran-Israel, oil, FII outflows. BSE Sensex weekly offers higher premium per delta due to lower liquidity.
- **IV Environment**: VIX 22.09 equivalent regime. Bearish skew = put spreads at higher IV than calls.
- **Timing**: Enter for next BSE Sensex weekly expiry.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 73500 | 280 | 1 lot (20) |
| 2 | BUY | PUT | 72500 | 130 | 1 lot (20) |
| 3 | SELL | CALL | 76500 | 120 | 1 lot (20) |
| 4 | BUY | CALL | 77500 | 50 | 1 lot (20) |

### Exit Conditions
- **Target**: 65% credit capture (Rs 2,860)
- **Stop Loss**: Exit if either short strike breached or loss > Rs 8,000
- **Time Exit**: Close by 2 PM on expiry
- **Adjustment**: Roll put spread down 500 pts if Sensex approaches 73,800

### Risk-Reward
- Max Profit: Rs 4,400 | Max Loss: Rs 15,600 | R:R: 1:0.28
- Breakevens: ~73,280 (lower) / ~76,720 (upper)
- Probability of profit: ~65-70%

### Greeks Exposure (at entry)
- Delta: -0.05 to -0.10 (mildly bearish)
- Gamma: -0.01
- Theta: +12 to +15 per day
- Vega: -2.5 to -3.5

### Transaction Cost Estimate
4 legs x Rs 20 + STT on 2 sells (0.0625% of (280+120) x 20 = Rs 5.00) + exchange ~Rs 80 + GST ~Rs 22 = **~Rs 187 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- **CRITICAL**: BSE Sensex weekly options have LOWER liquidity than NSE Nifty. Typical bid-ask spreads: 5-15 points for OTM strikes (vs 1-3 for Nifty).
- 73500 PE: MODERATE liquidity. Bid-ask: 8-15 pts.
- 76500 CE: LOW-MODERATE liquidity. Bid-ask: 5-10 pts.
- **Slippage risk**: Estimated 10-20 points total across 4 legs = Rs 200-400 slippage cost.
- **[COST_EROSION_RISK]**: Combined transaction costs + slippage = Rs 387-587 against Rs 4,400 credit = 9-13% cost drag.

### Enrichment: Performance History
- No specific Sensex iron condor backtest data available.
- General: Iron condors in high-VIX (>20) environments historically show 55-65% win rate on weekly expiry.
- BSE Sensex weekly is post-SEBI rationalization (Sep 2025) — insufficient history for reliable backtest.
- [STALE]: The "BSE premium vs NSE" thesis is community-sourced and unverified. Liquidity has been improving since rationalization.

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- Sensex OI data less transparent than Nifty.
- Max pain for Sensex weekly typically near ATM (round number nearest to current price).
- Lower overall OI = less "pinning" effect = wider potential ranges.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Any week where Sensex moves <2% total. The 220-pt credit is retained as theta crushes all premium. Common in consolidation phases.
2. **Adverse**: Mar 19 crash — Sensex fell 2,497 pts (3.3%). The 73,500 put strike would have been deeply tested. Max loss likely triggered.
3. **Neutral**: A slow 1% decline over the week. Put spread tested but not breached; call side expires worthless. ~70% of credit captured.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Inflated premiums = richer credit (22% credit-to-width vs 12-15% normal).
- **Sensex Weekly Expiry**: Note Sensex weekly is on FRIDAY per BSE, not Tuesday. [VERIFY: current BSE Sensex weekly expiry day. Rules file says Friday.]
- **Lot Size**: Sensex 20 — verified.
- **SEBI Compliance**: Compliant. Sensex is the designated BSE weekly expiry instrument.
- **Flags**: [STALE] — BSE premium thesis unverified. [COST_EROSION_RISK] — liquidity concerns.

### Edge Thesis
BSE Sensex weekly exploits liquidity premium (fatter premiums for same delta exposure). Bearish skew captures 68% of credit from put side. Post-SEBI rationalization creates a unique under-analyzed instrument. But liquidity risk and cost erosion are meaningful concerns.

---

## Strategy W-4: Bank Nifty Bearish Asymmetric Short Strangle — "Weighted Fear" Variant
**Source Scouts:** Forums (S3-Strategy4)
**Dedup Status:** UNIQUE

### Structure
Asymmetric Short Strangle with Put Protection: Sell 52700 PE / Buy 52200 PE / Sell 55000 CE
- Put spread credit: 75 pts | Call credit: 30 pts | Total: 105 pts = Rs 3,150
- Put spread: 500 pts | Call: naked (1,573 pts from current)
- Underlying: Bank Nifty | Lot size: 30 units

### Entry Conditions
- **Technical**: Bank Nifty at ~53,427. Support 53,200-53,300. Resistance 54,700. 1 DTE limits rally potential.
- **Fundamental**: PSU banks strong, private banks weak. Oil pressures banking margins.
- **IV Environment**: VIX 22.09. Bank Nifty IVs 20-30% higher in stress. 1 DTE = massive theta decay.
- **Timing**: Enter Monday Mar 23 for Tuesday expiry.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 52700 | 120 | 1 lot (30) |
| 2 | BUY | PUT | 52200 | 45 | 1 lot (30) |
| 3 | SELL | CALL | 55000 | 30 | 1 lot (30) |

### Exit Conditions
- **Target**: Full credit capture (Rs 3,150) if BankNifty 52,700-55,000
- **Stop Loss**: Exit if BankNifty < 52,500 or > 54,500. Max loss: Rs 6,000.
- **Time Exit**: 3:15 PM on expiry
- **Adjustment**: If gap down to 52,800, close put spread, keep short call

### Risk-Reward
- Max Profit: Rs 3,150 | Max Loss (down): Rs 11,850 | Max Loss (up): Unlimited (but ~2.9% rally needed)
- Breakevens: ~52,595 (lower) / ~55,105 (upper)
- Profitable zone: 2,510 points wide

### Greeks Exposure (at entry)
- Delta: -0.10 to -0.15
- Gamma: -0.05 to -0.08 (STRONGLY negative — 1 DTE extreme gamma)
- Theta: +30 to +40 per day (MASSIVE)
- Vega: -3.0 to -4.0

### Transaction Cost Estimate
3 legs x Rs 20 + STT on 2 sells (0.0625% of (120+30) x 30 = Rs 2.81) + exchange ~Rs 60 + GST ~Rs 18 = **~Rs 141 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- **IMPORTANT**: Bank Nifty has MONTHLY expiry only (weekly discontinued per SEBI). The scout specified weekly Mar 24 for Bank Nifty, which conflicts with SEBI rules.
- **[COMPLIANCE_RISK]**: Bank Nifty does NOT have a weekly expiry. This strategy cannot be executed as described on Mar 24.
- If using the MONTHLY Mar 31 expiry instead, the strategy fundamentals change entirely (11 DTE vs 1 DTE).
- 52700 PE monthly: MODERATE-HIGH liquidity. 55000 CE monthly: MODERATE liquidity.

### Enrichment: SEBI Compliance Check
- **CRITICAL FINDING**: Per SEBI weekly expiry rationalization (effective Sep 2025), Bank Nifty weekly options have been discontinued. Only Nifty weekly (NSE, Tuesday) and Sensex weekly (BSE) remain.
- **[COMPLIANCE_RISK]**: This strategy as designed for Mar 24 Bank Nifty weekly CANNOT be executed.
- **Remediation**: Strategy would need to be re-designed for Mar 31 monthly expiry with completely different strike selection, Greeks, and risk profile.

### Enrichment: Historical Scenario Mapping
1. **Not applicable** — strategy as designed violates current expiry rules.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Premium selling on expiry day is high-conviction — but only IF the instrument has a weekly expiry.
- **SEBI Compliance**: FAILED. Bank Nifty weekly does not exist.
- **Flags**: [COMPLIANCE_RISK] — Bank Nifty weekly expiry discontinued.

### Edge Thesis
The core concept (asymmetric premium selling with put protection on 1 DTE) is sound but CANNOT be applied to Bank Nifty weekly because that product no longer exists. The strategy must be either (a) converted to a Nifty weekly variant, or (b) redesigned for Bank Nifty monthly with different parameters.

---

## Strategy W-5: Nifty Bearish Directional Iron Fly — "Skewed Crush" on Weekly
**Source Scouts:** TradingView (S4-Strategy1)
**Dedup Status:** UNIQUE

### Structure
Bearish Directional Iron Fly: Buy 22400 PE / Sell 22900 PE / Sell 22900 CE / Buy 23400 CE
- ATM straddle at 22900 (200 pts below market) creates bearish lean
- Net Credit: 275 points = Rs 17,875
- Wing width: 500 pts each side
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty ~23,100. Iron fly center at 22,900 (immediate support). 200-pt decline = 0.9% — conservative target.
- **Fundamental**: Geopolitical + oil + FII = bearish continuation.
- **IV Environment**: VIX 22.09. Iron flies benefit MASSIVELY — ATM straddle at ~2.5x normal premium levels. IV crush on expiry destroys time value (benefits seller).
- **Timing**: Monday Mar 23 for Tuesday expiry. 1 DTE = maximum theta exploitation.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 22400 | 25 | 1 lot (65) |
| 2 | SELL | PUT | 22900 | 100 | 1 lot (65) |
| 3 | SELL | CALL | 22900 | 280 | 1 lot (65) |
| 4 | BUY | CALL | 23400 | 80 | 1 lot (65) |

### Exit Conditions
- **Target**: Max profit at 22,900 pin = Rs 17,875. 50% target: Rs 8,937.
- **Stop Loss**: Nifty > 23,500 or < 22,300 = Rs 14,625 loss
- **Time Exit**: 3:00 PM on expiry
- **Adjustment**: Roll call wing up if Nifty > 23,200 by noon

### Risk-Reward
- Max Profit: Rs 17,875 (at pin) | Max Loss: Rs 14,625 | R:R: ~1:1.22
- Breakevens: ~22,625 (lower) / ~23,175 (upper)
- Narrow profitable zone: 550 points

### Greeks Exposure (at entry)
- Delta: -0.15 to -0.25 (bearish lean)
- Gamma: -0.10 to -0.15 (STRONGLY negative — 1 DTE ATM)
- Theta: +50 to +70 per day (EXTREME)
- Vega: -5.0 to -7.0 (very strongly short vega)

### Transaction Cost Estimate
4 legs x Rs 20 + STT on 2 sells (0.0625% of (100+280) x 65 = Rs 15.44) + exchange ~Rs 80 + GST ~Rs 23 = **~Rs 198 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 22900 straddle (near ATM on 1 DTE): VERY HIGH liquidity. Bid-ask: 1-2 pts.
- 22400/23400 wings: MODERATE liquidity (500 pts from center). Bid-ask: 2-4 pts.
- Total estimated slippage: 5-10 pts across 4 legs = Rs 325-650.

### Enrichment: Performance History
- TradingView community reports ~70% credit capture rate on 1-DTE iron flies with VIX > 18. [VERIFY — community-sourced, not independently verified]
- Iron flies on SPX 0DTE with VIX > 20 show ~55-65% win rate per various US backtest studies. Applicability to NSE Nifty is approximate.
- Key risk: 1 DTE iron flies have extreme gamma risk. A 2% move destroys the position.

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- 22900 strike: Heavy combined put+call OI makes this a potential "pinning" zone — market makers have incentive to keep Nifty near max OI strike.
- PCR 0.7158 suggests put sellers are dominant — supports the idea of price being "held" near round-number puts.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Any expiry day where Nifty moves <275 pts from 22,900. High-VIX but range-bound day. Theta crush delivers 50-70% of credit.
2. **Adverse**: Mar 19 crash — 776 pts in one session. Iron fly centered at 22,900 would have broken through both wings in either direction. Max loss triggered.
3. **Neutral**: Nifty drifts slowly to 22,900 by expiry. Ideal scenario — full credit retained.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Extremely favorable for iron fly premium collection.
- **Concern**: Upper breakeven at 23,175 is only 75 pts above current market. If Nifty doesn't decline at all, the position starts losing quickly.
- **Key Question**: Is a 200-pt decline to 22,900 the most probable outcome, or is a larger decline (which breaks the lower wing) more likely given recent 3.26% moves?
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: All legs on NSE Nifty weekly. Compliant.
- **Flags**: None, but the narrow profitable zone (550 pts) in a high-vol regime is a concern.

### Edge Thesis
Highest theta-to-margin ratio trade available. VIX at 22.09 provides 2.5x normal premium collection. The directional skew adds bearish lean. But narrow breakevens in a high-vol environment create significant gamma risk. Best suited for traders who believe the market will consolidate rather than crash further.

---

## Strategy W-6: Nifty Bearish Diagonal/Calendar Put — Merged "Multi-Expiry Theta Capture"
**Source Scouts:** WebSearch (S1-Strategy4) + TradingView (S4-Strategy4) + Forums (S3-Strategy3)
**Dedup Status:** MERGED from 3 scouts

### Structure (Merged)
Bearish Diagonal Put Spread with Calendar Component:
- **Phase 1**: Sell Mar 24 weekly 22900 PE / Buy Mar 31 monthly 23200 PE
- Net Debit: 245 points = Rs 15,925
- Cross-expiry: Weekly front leg + Monthly back leg
- Underlying: Nifty 50 | Lot size: 65 units

### Merger Notes
- **WebSearch (W4)**: Provided optimal strike selection (sell 22900 weekly, buy 23200 monthly) — higher strikes capture more premium and delta.
- **TradingView (T4)**: Contributed Phase 2 roll methodology — after weekly expires, sell 22000 PE monthly to create bear put spread, reducing effective debit to ~Rs 2,600.
- **Forums (F3)**: Added IV term structure arbitrage thesis — near-dated IV > far-dated IV in crisis regimes. The calendar/diagonal captures this spread normalization.
- **Merged edge**: Triple thesis = theta differential + directional lean + IV term structure arbitrage.

### Entry Conditions
- **Technical**: Nifty ~23,100. Sell weekly put at 22,900 (first support), buy monthly put at 23,200 (slightly ITM).
- **Fundamental**: Geopolitical crisis creates multi-week vol persistence. Dual-expiry captures extended thesis.
- **IV Environment**: VIX 22.09. Near-dated IV (Mar 24) estimated 25-28% vs far-dated (Mar 31) 22-24%. Term structure inversion = primary edge.
- **Timing**: Enter Friday Mar 20. Short put has 1 trading day; long put has 7 more.

### Legs (Phase 1)

| Leg | Action | Option | Strike | Expiry | Premium (est.) | Qty |
|-----|--------|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 22900 | Mar 24 (Weekly) | 65 | 1 lot (65) |
| 2 | BUY | PUT | 23200 | Mar 31 (Monthly) | 310 | 1 lot (65) |

### Legs (Phase 2 — after Mar 24 expiry)

| Leg | Action | Option | Strike | Expiry | Premium (est.) | Qty |
|-----|--------|--------|--------|--------|-----------------|-----|
| 3 | SELL | PUT | 22000 | Mar 31 (Monthly) | ~35-50 | 1 lot (65) |

### Exit Conditions
- **Phase 1**: If Nifty > 22,900, short put expires worthless. Long 23200 Mar 31 put worth ~200-250 pts. Roll to Phase 2.
- **Phase 2**: Bear put spread 23200/22000 with effective debit ~205 pts. If Nifty to 22,000 by Mar 31 = Rs 29,575 profit.
- **Stop Loss**: Exit if Nifty > 23,600 (both puts lose rapidly)
- **Time Exit**: Close all by Mar 30

### Risk-Reward
- **Phase 1 Only**: Max Profit ~Rs 6,500. Max Loss: Rs 15,925.
- **Phase 1+2**: Max Profit Rs 29,575. Max Loss: Rs 2,600-15,925 (depends on Phase 2 entry).
- Breakeven: ~22,955 at Mar 31 expiry

### Greeks Exposure (Phase 1, at entry)
- Delta: -0.30 to -0.40 (long far-dated put dominates)
- Gamma: Near neutral
- Theta: +5 to +10 per day (short weekly decays massively)
- Vega: +1.0 to +2.0 (NET LONG vega — profits from further VIX spikes)

### Transaction Cost Estimate
Phase 1: 2 legs x Rs 20 + STT (0.0625% of 65 x 65 = Rs 2.64) + exchange ~Rs 50 + GST ~Rs 17 = ~Rs 110
Phase 2: 1 leg x Rs 20 + STT + exchange ~Rs 60
**Total: ~Rs 170**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 22900 weekly put: HIGH liquidity (near support zone). Bid-ask: 1-3 pts.
- 23200 monthly put (slightly ITM): HIGH liquidity. Bid-ask: 2-4 pts.
- Cross-expiry execution: Leg risk exists — cannot execute as single order. Use Zerodha Kite basket order.

### Enrichment: Performance History
- Calendar/diagonal spreads in high-VIX have historically captured 60-80% of the theta differential when the underlying moves toward the target strike. [ORCHESTRATOR_SYNTHESIZED based on general options theory]
- Sensibull blog highlighted calendar spreads as optimal when "front-month IV is high relative to back-month IV" — exactly the current condition.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Feb 2020 — VIX rose from 15 to 22 over 2 weeks. Near-dated options decayed rapidly while far-dated retained value. Calendar profit from term structure normalization + directional gain.
2. **Adverse**: V-shaped recovery (e.g., Jun 2024 post-election rally). Nifty surged and both puts lost value — max debit loss.
3. **Neutral**: Slow grind lower over 2 weeks. Phase 1 captures weekly theta. Phase 2 creates high-leverage bear put spread.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Net long vega is UNIQUELY ADVANTAGEOUS — if geopolitical escalation spikes VIX further, the long monthly put gains more than the short weekly put.
- **Cross-expiry risk**: Calendar spread margin benefit may be removed on expiry day per SEBI's 2024 framework. [VERIFY implementation status]
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: Nifty weekly (Mar 24) + Nifty monthly (Mar 31). Both valid NSE instruments. Compliant.
- **Flags**: None

### Edge Thesis (Merged)
Triple-edge strategy: (1) Theta differential — weekly decays 3-4x faster than monthly. (2) Directional bearish lean via higher-strike long put. (3) IV term structure arbitrage — near-dated IV > far-dated in crisis. Net long vega provides protection against further VIX spikes. Phase 2 roll creates 11.5:1 potential R:R. Capital-efficient multi-week bear strategy.

---

## Weekly Category Summary
| # | Strategy | Underlying | Max Profit | Max Loss | Key Edge | Flags |
|---|----------|------------|------------|----------|----------|-------|
| W-1 | BWB | Nifty | Rs 17,875 | Rs 11,375 | Skew harvest + 1 DTE theta | None |
| W-2 | Put Backspread | Nifty | Unlimited | Rs 24,050 | Crash hedge with credit entry | None |
| W-3 | Skewed IC | Sensex BSE | Rs 4,400 | Rs 15,600 | BSE liquidity premium | [STALE], [COST_EROSION_RISK] |
| W-4 | Asym Strangle | BankNifty | Rs 3,150 | Rs 11,850 | 1 DTE theta crush | [COMPLIANCE_RISK] |
| W-5 | Dir Iron Fly | Nifty | Rs 17,875 | Rs 14,625 | Extreme theta (50-70/day) | None |
| W-6 | Diagonal/Calendar | Nifty | Rs 29,575 | Rs 15,925 | Triple edge: theta+direction+IV | None (MERGED) |

**Total Weekly Strategies: 6 (1 merged from 3 scouts, 1 with compliance risk)**
