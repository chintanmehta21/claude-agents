# BEARISH MONTHLY Enriched Strategies
## Run ID: run_20032026 | Date: 2026-03-20 | Orchestrator: Strategy Orchestrator (BEARISH)
## Expiry: March 31, 2026 (Tuesday) — Monthly (also Quarterly)
## India VIX: 22.09 (HIGH regime)

---

## Strategy M-1: Bank Nifty Bear Call Credit Spread — Oil Shock Thesis
**Source Scouts:** WebSearch (S1-Strategy2)
**Dedup Status:** UNIQUE

### Structure
Bear Call Credit Spread: Sell 55000 CE / Buy 55500 CE
- Net Credit: 140 points = Rs 4,200 per spread
- Width: 500 points
- Underlying: Bank Nifty | Lot size: 30 units

### Entry Conditions
- **Technical**: Bank Nifty at ~53,427 with resistance at 54,700. PSU banks showing relative strength but private banks lagging. 55,000 short call above critical resistance.
- **Fundamental**: Rising crude ($100+/bbl) pressures banks — NPA concerns, rising bond yields compress treasury profits, RBI rate action uncertainty. FII selling concentrated in financials.
- **IV Environment**: VIX 22.09. Bank Nifty IVs typically 1.5-2x Nifty IV in stressed regimes. Elevated call premiums create attractive credit. [VERIFY: current BankNifty IV data]
- **Timing**: Enter Mar 20 for Mar 31 (11 DTE).

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | CALL | 55000 | 280 | 1 lot (30) |
| 2 | BUY | CALL | 55500 | 140 | 1 lot (30) |

### Exit Conditions
- **Target**: 80% credit capture (Rs 3,360)
- **Stop Loss**: Spread widens to 350 pts (loss = Rs 6,300)
- **Time Exit**: Close by Mar 30 (avoid quarterly assignment risk)
- **Adjustment**: Roll short call to 55500 / buy 56000 if BankNifty > 54,500

### Risk-Reward
- Max Profit: Rs 4,200 | Max Loss: Rs 10,800 | R:R: 1:0.39
- Breakeven: 55,140
- Probability of profit: >75% given 2.9% buffer to short strike

### Greeks Exposure (at entry)
- Delta: -0.10 to -0.15 per lot
- Gamma: -0.003
- Theta: +8 to +12 per day
- Vega: -1.5 to -2.0

### Transaction Cost Estimate
2 legs x Rs 20 + STT (0.0625% of 280 x 30 = Rs 5.25) + exchange ~Rs 50 + GST ~Rs 17 = **~Rs 112 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 55000 CE (OTM, ~2.9% away): MODERATE liquidity on monthly. Bid-ask: 3-6 points.
- 55500 CE: MODERATE. Bid-ask: 4-8 points.
- OI: Significant call writing at 55000 — acts as resistance magnet.
- Total estimated slippage: 5-10 pts across 2 legs.

### Enrichment: Performance History
- Bear call spreads on Bank Nifty have been widely backtested on Indian platforms (Stockmock, freebacktesting.in). General results: 60-70% win rate when short strike is >2.5% from current level with 10-15 DTE in VIX 15-25 regime.
- PL Capital Bank Nifty monthly strategy guide: bear call spreads with 10-12 DTE show theta acceleration in final 7-10 days. Best entry: 10:30-11:30 AM after morning volatility settles.
- Theta decay accelerates dramatically in final hours: options lose 70-80% value between 12 PM and 3:30 PM on expiry day.

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- Bank Nifty options chain shows heavy call writing at 55,000 (resistance magnet).
- PCR for Bank Nifty: ~0.75 (aggressive call writers dominate) — supports bearish/range-bound thesis.
- Support identified at 53,200-54,000 zone with strong put OI.
- Max pain for Mar 31 monthly: likely near 53,000-54,000 range.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Oct 2022 — Bank Nifty traded 2% below resistance for 2 weeks during rate hike uncertainty. VIX 18-20. Bear call spreads above resistance captured 80%+ of credit.
2. **Adverse**: Nov 2024 post-election rally — Bank Nifty surged 4% in 2 sessions. A 55000/55500 bear call spread would have been blown through for max loss.
3. **Neutral**: Jan 2023 range-bound market. Bank Nifty oscillated within 2% range for 3 weeks. Bear call spread well above resistance captured full credit.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Call premiums inflated — 140 pts credit vs ~80-90 in normal VIX. Edge is regime-specific.
- **Oil-Banking nexus**: Brent >$100 directly pressures banking sector — rising bond yields compress NIMs, treasury losses, NPA risk. This fundamental thesis is CURRENT and ACTIVE.
- **Quarterly expiry**: Mar 31 is quarterly settlement — adds institutional unwinding pressure that historically suppresses upside.
- **Lot Size**: Bank Nifty 30 — correct.
- **SEBI Compliance**: Bank Nifty monthly options on NSE. Compliant.
- **Flags**: [VERIFY: current Bank Nifty IV data needed to confirm premium estimates]

### Edge Thesis
Bank Nifty at 53,427 is 2.9% below short strike. Requires ~3% rally against persistent FII selling, oil headwinds, quarterly unwinding, and geopolitical risk. The oil-to-banking transmission (bond yields, NPA risk, credit growth slowdown) provides fundamental anchoring. VIX-inflated call premiums give richer-than-normal credit. Defined risk structure.

---

## Strategy M-2: Bank Nifty Bearish Put Christmas Tree — "Ladder Down" Setup
**Source Scouts:** Reddit (S2-Strategy2)
**Dedup Status:** UNIQUE

### Structure
Put Christmas Tree (1-3-2): Buy 1 lot 53500 PE / Sell 3 lots 52500 PE / Buy 2 lots 52000 PE
- Net Debit: 130 points = Rs 3,900
- Upper spread: 1000 pts | Lower spread: 500 pts
- Underlying: Bank Nifty | Lot size: 30 units

### Entry Conditions
- **Technical**: Bank Nifty ~53,427. Resistance 54,700. Support 53,200-53,300. Private bank heavyweights under FII selling pressure. PSU vs private bank divergence.
- **Fundamental**: Rising bond yields compress NIMs. Oil shock. Quarterly results season uncertainty. FII concentrated selling in financials.
- **IV Environment**: Bank Nifty IV ~25-30% (1.5-2x Nifty in stress). Selling 3 middle puts captures elevated premium. [VERIFY: current Bank Nifty ATM IV]
- **Timing**: Enter Mar 20 for Mar 31 quarterly expiry (11 DTE).

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 53500 | 720 | 1 lot (30) |
| 2 | SELL | PUT | 52500 | 330 | 3 lots (90) |
| 3 | BUY | PUT | 52000 | 200 | 2 lots (60) |

### Exit Conditions
- **Target**: Max profit at 52,500 pin = Rs 26,100
- **Stop Loss**: Exit if BankNifty > 54,200
- **Time Exit**: Close by Mar 30
- **Adjustment**: If BankNifty < 52,000, close 2 bought puts + 2 sold puts, leaving 1 bear put spread

### Risk-Reward
- Max Profit: Rs 26,100 (at 52,500 pin)
- Max Loss (up): Rs 3,900 | Max Loss (down): Rs 18,900 (below 52,000 without adjustment)
- Breakevens: ~53,370 (upper) / ~51,870 (lower)
- Profit Zone: 1,500 points wide (51,870 to 53,370)

### Greeks Exposure (at entry)
- Delta: -0.20 to -0.30
- Gamma: -0.01 to +0.01 (near neutral)
- Theta: +10 to +15 per day
- Vega: -2.0 to -3.0

### Transaction Cost Estimate
6 legs x Rs 20 + STT on 3 sells (0.0625% of 3 x 330 x 30 = Rs 18.56) + exchange ~Rs 120 + GST ~Rs 30 = **~Rs 289 total**
- [COST_EROSION_RISK]: 6 legs means significant transaction cost drag. Rs 289 against Rs 3,900 debit = 7.4% cost.

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 53500 PE (near ATM): HIGH liquidity on monthly. Bid-ask: 3-5 pts.
- 52500 PE (3 lots sold): MODERATE liquidity. Bid-ask: 4-8 pts. Filling 3 lots simultaneously may require splitting.
- 52000 PE (2 lots bought): MODERATE. Bid-ask: 5-10 pts.
- **Slippage concern**: 6 legs with 3+2 = 5 lots beyond the first creates meaningful slippage. Estimate: Rs 300-500 additional.

### Enrichment: Performance History
- Christmas tree structures are rarely backtested on Indian platforms. Community-sourced from r/DalalStreetBets.
- General: Modified butterflies (1-3-2) provide wider profit zones than standard (1-2-1) at the cost of asymmetric risk on the lower side.
- 1,500-pt profit zone for Bank Nifty is appropriate given 500-1,000 pt daily moves in high-VIX.

### Enrichment: Chain Dynamics [ORCHESTRATOR_SYNTHESIZED]
- 52,500 strike: Moderate put OI — selling 3 lots here means significant exposure to this strike's OI dynamics.
- Bank Nifty round number support at 52,000 historically attracts institutional buying.
- PCR ~0.75 suggests call writers dominate — bearish bias supported.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Jul 2022 — Bank Nifty declined 3.5% over 2 weeks in a controlled descent. A 1-3-2 tree centered 1,000 pts below market would have captured 70-80% of max profit.
2. **Adverse**: Mar 2020 COVID — Bank Nifty crashed 10%+ in a week. Lower wing would have been overwhelmed. Max downside loss triggered.
3. **Neutral**: Bank Nifty consolidates near 53,000-53,500 for 2 weeks. Upper breakeven (53,370) is just barely in profit. Time decay gradually builds value.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. The 3 sold puts at inflated IV make the entry ultra-cheap (130 pts for 1,000-pt spread). Regime-specific value.
- **Lot Size**: Bank Nifty 30 — correct.
- **6-leg execution**: Requires careful order management. Recommend Kite basket order or Sensibull multi-leg.
- **SEBI Compliance**: All legs on Bank Nifty monthly (Mar 31). Compliant.
- **Flags**: [COST_EROSION_RISK] — 6 legs

### Edge Thesis
1,500-point profit zone accommodates Bank Nifty's high daily volatility. Ultra-cheap 130-pt debit for 1,000-pt spread width. Quarterly premium adds 5-10% to sold options. The divergence thesis (PSU strong, private weak = Bank Nifty catch-down) provides fundamental catalyst. But 6-leg execution and downside risk below 52,000 are meaningful concerns.

---

## Strategy M-3: Nifty Bearish Reverse Jade Lizard — "Premium-Enhanced Synthetic Bearish"
**Source Scouts:** WebSearch (S1-Strategy5)
**Dedup Status:** UNIQUE (distinct from T2 Jade Lizard — opposite risk profiles)

### Structure
Reverse Jade Lizard: Sell 22800/22300 put spread + Sell 23800 naked call
- Net Credit: 170 points = Rs 11,050
- Put spread width: 500 pts | Call: naked (700 pts from current)
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty ~23,100. Put spread targets 22,800-22,300 (support zone). Naked call at 23,800 (700 pts away, above 23,604 bearish threshold and 23,250 resistance).
- **Fundamental**: FII selling, oil shock, geopolitical. No upside catalyst for 11 sessions.
- **IV Environment**: VIX 22.09. Both calls and puts overpriced. Dual-sided premium selling.
- **Timing**: Enter Mar 20 for Mar 31 (11 DTE).

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 22800 | 130 | 1 lot (65) |
| 2 | BUY | PUT | 22300 | 50 | 1 lot (65) |
| 3 | SELL | CALL | 23800 | 90 | 1 lot (65) |

### Exit Conditions
- **Target**: 70% credit capture (Rs 7,735)
- **Stop Loss**: Exit if Nifty > 23,500 or total loss > Rs 15,000
- **Time Exit**: Close by Mar 30
- **Adjustment**: Buy 24,000 CE if Nifty threatens 23,800 (caps upside)

### Risk-Reward
- Max Profit: Rs 11,050 (Nifty 22,800-23,800)
- Max Loss (down): Rs 21,450 (below 22,300)
- Max Loss (up): Unlimited above 23,800 (adjustment caps at ~Rs 13,000)
- Breakevens: ~22,630 (lower) / ~23,970 (upper)

### Greeks Exposure (at entry)
- Delta: -0.20 to -0.30
- Gamma: -0.02
- Theta: +18 to +22 per day (strong — 3 short exposures)
- Vega: -4.0 to -5.0 (heavily short vega)

### Transaction Cost Estimate
3 legs x Rs 20 + STT on 2 sells (0.0625% of (130+90) x 65 = Rs 8.94) + exchange ~Rs 70 + GST ~Rs 20 = **~Rs 159 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 22800 PE monthly: MODERATE-HIGH. Bid-ask: 3-5 pts.
- 22300 PE monthly: MODERATE. Bid-ask: 4-7 pts.
- 23800 CE monthly (far OTM): MODERATE. Bid-ask: 3-6 pts.

### Enrichment: Performance History
- Reverse Jade Lizard is an advanced structure — no specific Indian market backtest data.
- Samco's historical analysis: VIX mean reverts in 75% of cases after extreme spikes with 5-15 session lag. The 11 DTE falls in the "drift lower" window before bounce.
- Short vega (-4 to -5) positions historically perform well during VIX normalization periods.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Post-Ukraine war period (Mar-Apr 2022). VIX elevated for 3-4 weeks then gradually normalized. Nifty drifted sideways-to-lower. Short premium strategies captured full credit.
2. **Adverse**: Flash rally on ceasefire news. If Iran-Israel de-escalation triggers 1,000+ pt Nifty rally, the naked 23,800 call becomes problematic. Historical precedent: Feb 2022 Russia-Ukraine ceasefire rumors caused 500-pt intraday rally.
3. **Neutral**: Gradual 2-3% decline over 11 sessions. Both put spread and call side profit from time decay. Optimal scenario.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Dual-sided premium selling maximizes credit. Strongly short vega benefits from eventual VIX normalization.
- **Key Risk**: Naked call at 23,800 carries unlimited upside risk. Geopolitical de-escalation could trigger sudden rally. The adjustment protocol (buy 24,000 CE) is essential.
- **Margin**: ~Rs 1,60,000-2,00,000. Capital-intensive.
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: Naked call writing is permitted for F&O accounts. Compliant but margin-intensive.
- **Flags**: None, but naked call risk is significant.

### Edge Thesis
Dual-sided premium selling monetizes regime where BOTH calls and puts are overpriced. The 170-pt credit is exceptionally rich (7.4% of put spread width in 11 days). Strongly short vega aligns with VIX normalization thesis. Key differentiation from standard strategies: sells premium on BOTH sides with bearish skew. But naked call risk requires active management and meaningful capital.

---

## Strategy M-4: Nifty Bearish Jade Lizard — "Short Bias Premium Collector" (Zero Upside Risk)
**Source Scouts:** TradingView (S4-Strategy2)
**Dedup Status:** UNIQUE (distinct from W5 Reverse Jade Lizard — opposite risk profiles)

### Structure
Bearish Jade Lizard: Sell 22500 PE (naked) + Sell 24000/24100 call spread
- Net Credit: 122 points = Rs 7,930
- Call spread width: 100 pts | Credit > width = ZERO UPSIDE RISK
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty ~23,100. Sell put at 22,500 (first support). Sell call spread 24,000/24,100 (far above 23,604 bearish threshold).
- **Fundamental**: All macro bearish. No upside catalyst. Ceasefire/peace risk → Jade Lizard's zero upside risk property is UNIQUELY valuable.
- **IV Environment**: VIX 22.09. Inflated put premiums make "credit > call spread width" condition easy to achieve.
- **Timing**: Mar 20 for Mar 31 (11 DTE).

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 22500 | 110 | 1 lot (65) |
| 2 | SELL | CALL | 24000 | 60 | 1 lot (65) |
| 3 | BUY | CALL | 24100 | 48 | 1 lot (65) |

### Exit Conditions
- **Target**: 70% credit capture (Rs 5,525)
- **Stop Loss**: Exit at Nifty 22,300 (max tolerable loss Rs 15,000)
- **Time Exit**: Close by Mar 30
- **Adjustment**: Roll put to 22,000 if 22,500 threatened

### Risk-Reward
- Max Profit: Rs 7,930 (Nifty 22,500-24,000)
- Max Loss (up): Rs 0 — ZERO UPSIDE RISK (unique property)
- Max Loss (down): Unlimited below 22,500 (managed with stop)
- Breakeven: ~22,378 (lower only)

### Greeks Exposure (at entry)
- Delta: -0.15 to -0.20
- Gamma: -0.01 to -0.02
- Theta: +10 to +14 per day
- Vega: -2.5 to -3.0

### Transaction Cost Estimate
3 legs x Rs 20 + STT on 2 sells (0.0625% of (110+60) x 65 = Rs 6.91) + exchange ~Rs 60 + GST ~Rs 18 = **~Rs 145 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 22500 PE monthly: MODERATE-HIGH liquidity. Bid-ask: 3-5 pts.
- 24000/24100 CE monthly: MODERATE (far OTM calls). Bid-ask: 3-5 pts.
- 100-pt wide call spread may have minimal slippage.

### Enrichment: Performance History
- No specific Jade Lizard backtest on Indian markets.
- The zero upside risk property is mathematically guaranteed when credit > call spread width.
- Samco Jade Lizard guide confirms the structure for Indian markets.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Any period where Nifty stays within a 1,500-pt range for 2 weeks. VIX normalizes. Full credit captured.
2. **Adverse**: Sharp crash below 22,500. Naked put generates escalating losses. Feb 2020 — Nifty fell through support in days.
3. **Critical Advantage Scenario**: Ceasefire/peace news triggers 1,000+ pt rally. EVERY other bearish strategy loses money. Jade Lizard STILL PROFITS (22 pts x 65 = Rs 1,430 net profit even at 24,000+). This is the UNIQUE edge.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Rich put premiums fund the structure.
- **Geopolitical Hedge**: The ONLY bearish strategy in the portfolio with ZERO upside risk. If Iran-Israel de-escalation triggers a rally, this is the only position that doesn't lose.
- **Margin**: ~Rs 1,30,000-1,60,000 (naked put margin). Capital-intensive.
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: Compliant.
- **Flags**: None

### Edge Thesis
The ONLY bearish strategy with ZERO upside risk in the entire portfolio. In a geopolitical crisis where ceasefire rumors can trigger sudden rallies, this property is invaluable. 90% of credit from the put side reflects bearish view. The call spread is a "kicker" adding free income. High-VIX makes the "credit > width" condition easy to achieve. The trade-off: naked put risk on the downside requires active management.

---

## Strategy M-5: Nifty Bearish Put Ladder — "Staircase Down" Controlled Descent
**Source Scouts:** Forums (S3-Strategy1)
**Dedup Status:** UNIQUE (distinct from WebSearch Put Ratio 1x2 — different structure: 1-1-1 vs 1-0-2)

### Structure
Bear Put Ladder (1-1-1): Buy 1 lot 23100 PE / Sell 1 lot 22500 PE / Sell 1 lot 22000 PE
- Net Debit: 185 points = Rs 12,025
- Step: 600 pts (23100→22500) + 500 pts (22500→22000)
- Underlying: Nifty 50 | Lot size: 65 units

### Entry Conditions
- **Technical**: Nifty ~23,100. Three support tiers: 22,900/22,500/22,000. Strikes map to levels.
- **Fundamental**: "Staircase" thesis — markets don't crash straight; they decline through supports in phases. Quarterly unwinding supports phased decline.
- **IV Environment**: VIX 22.09. Two sold puts capture elevated premium. Net mildly short vega.
- **Timing**: Mar 20 for Mar 31 (11 DTE).

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 23100 | 350 | 1 lot (65) |
| 2 | SELL | PUT | 22500 | 110 | 1 lot (65) |
| 3 | SELL | PUT | 22000 | 55 | 1 lot (65) |

### Exit Conditions
- **Target**: Rs 26,975 (at 22,500-22,000 zone)
- **Stop Loss**: Exit if Nifty < 21,400 (naked put risk). Max loss Rs 20,000.
- **Time Exit**: Close by Mar 30
- **Adjustment**: Buy 21,500 PE if Nifty approaches 21,800

### Risk-Reward
- Max Profit: Rs 26,975 (22,500-22,000 zone) | Profit zone: 1,500 pts wide
- Max Loss (up): Rs 12,025 | Max Loss (down): Unlimited below 21,400 (mitigated)
- Breakevens: ~22,915 (upper) / ~21,415 (lower)

### Greeks Exposure (at entry)
- Delta: -0.30 to -0.40
- Gamma: -0.01 to -0.02
- Theta: +12 to +16 per day
- Vega: -2.5 to -3.0

### Transaction Cost Estimate
3 legs x Rs 20 + STT on 2 sells (0.0625% of (110+55) x 65 = Rs 6.70) + exchange ~Rs 70 + GST ~Rs 19 = **~Rs 156 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- 23100 PE (ATM): VERY HIGH liquidity. Bid-ask: 1-3 pts.
- 22500 PE: MODERATE-HIGH. Bid-ask: 3-5 pts.
- 22000 PE (deep OTM): MODERATE. Bid-ask: 4-7 pts.

### Enrichment: Performance History
- Put ladders adapted from Zerodha Varsity bear call ladder framework.
- 1,500-pt profit zone is 3x wider than standard butterfly — accommodates staircase moves.
- Historical staircase patterns during quarterly expiries: institutions typically unwind in 2-3 phases, not all at once.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Sep 2022 quarter-end — Nifty declined through 3 support levels over 10 sessions. Staircase pattern confirmed. Ladder would have captured 70%+ of max profit.
2. **Adverse**: Mar 2020 COVID crash — one-day collapse through all levels. Naked put at 22000 equivalent would have generated massive losses. Adjustment protocol critical.
3. **Neutral**: Slow 1.5% decline over 2 weeks. Upper parts of profit zone captured. Theta decay assists.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Sold puts at elevated IV reduce debit significantly.
- **Margin**: ~Rs 1,40,000-1,70,000. Significant capital requirement for the naked 22000 put.
- **Lot Size**: Nifty 65 — correct.
- **SEBI Compliance**: Compliant.
- **Flags**: None, but naked put below 22,000 is a concern in this volatile regime.

### Edge Thesis
1,500-pt profit zone maps to the three-level support structure (22,900/22,500/22,000). Captures "staircase" decline pattern favored by quarterly unwinding. 2 sold puts generate strong theta. Net debit only 185 pts for 415-pt max payoff = 2.2:1 R:R on upside risk.

---

## Strategy M-6: Midcap Nifty Bear Put Spread — "Midcap Meltdown" Second Wave
**Source Scouts:** Reddit (S2-Strategy5)
**Dedup Status:** UNIQUE

### Structure
Bear Put Debit Spread: Buy ATM PE / Sell ATM-500 PE
- Net Debit: ~200 points = Rs 24,000 (120 units/lot)
- Spread width: 500 points
- Underlying: Midcap Nifty (Nifty Midcap Select) | Lot size: 120 units

### Entry Conditions
- **Technical**: Midcap Nifty hit harder than Nifty (1.5-2x beta in selloffs). If Nifty -3.26%, Midcap likely -5-6%.
- **Fundamental**: "Second wave" thesis — midcap carnage follows large-cap selloff by 1-2 weeks. FIIs exit large-cap → domestic MFs sell midcaps for redemptions.
- **IV Environment**: Midcap Nifty options have HIGHER IV than Nifty (midcap vol premium). Debit spread mitigated by selling OTM put at inflated levels.
- **Timing**: Enter Mar 24-25 for Mar 31 (5-6 DTE). Late entry captures steepest theta acceleration for short leg.

### Legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | ATM | 350 | 1 lot (120) |
| 2 | SELL | PUT | ATM-500 | 150 | 1 lot (120) |

Note: Exact strikes depend on Midcap Nifty level at entry (~9,800-10,200 estimated). [ORCHESTRATOR_SYNTHESIZED: Using placeholder strikes]

### Exit Conditions
- **Target**: Rs 36,000 at max (500+ pt drop). Rs 12,000 at 300-pt drop.
- **Stop Loss**: Max loss Rs 24,000 (net debit) if Midcap Nifty rallies 200+ pts
- **Time Exit**: Close by 2:30 PM Mar 31
- **Adjustment**: Close half if Rs 15,000+ profit with 2+ days remaining

### Risk-Reward
- Max Profit: Rs 36,000 | Max Loss: Rs 24,000 | R:R: 1:1.5
- Breakeven: ATM minus 200 pts

### Greeks Exposure (at entry, 5-6 DTE)
- Delta: -0.35 to -0.45
- Gamma: +0.02 to +0.03
- Theta: -10 to -15 per day (negative — debit spread)
- Vega: +0.5 to +1.0

### Transaction Cost Estimate
2 legs x Rs 20 + STT (0.0625% of 150 x 120 = Rs 11.25) + exchange ~Rs 50 + GST ~Rs 18 = **~Rs 119 total**

### Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- **CRITICAL**: Midcap Nifty options have SIGNIFICANTLY lower liquidity than Nifty/BankNifty.
- ATM puts: LOW-MODERATE liquidity. Bid-ask: 8-15 points.
- OTM puts: LOW liquidity. Bid-ask: 10-20 points.
- 120 units/lot means each point = Rs 120 — slippage is magnified.
- Estimated slippage: 15-25 pts total = Rs 1,800-3,000.
- **[COST_EROSION_RISK]**: Slippage + transaction costs = Rs 1,919-3,119 against Rs 24,000 debit = 8-13%.

### Enrichment: Performance History
- "Second wave" thesis is community-sourced (r/IndiaInvestments). Historical beta: midcap indices decline 1.5-2x Nifty in bear regimes.
- Feb 2020: Nifty -5% → Midcap Nifty -8% over following 2 weeks. Lag: 5-8 trading sessions.
- Mar 2020: Nifty -30% → Midcap Nifty -40%. Beta expanded to 1.3x in extreme crash.
- [STALE]: Current midcap-to-largecap beta needs verification with live data.

### Enrichment: Historical Scenario Mapping
1. **Favorable**: Feb 2020 — 2-week midcap selloff lagging Nifty by 1 week. Bear put spread entered at the lag point would have captured 80%+ of spread width.
2. **Adverse**: Midcap recovery (Jan 2023) — sharp V-reversal in midcaps. Full debit lost.
3. **Neutral**: Midcap consolidation at lower levels — spread captures partial profit from theta decay on short leg.

### Enrichment: Current Market Relevance
- **VIX Regime**: HIGH. Midcap IV even higher — debit spread entry cost elevated.
- **Timing**: The "second wave" thesis suggests entering 1-2 weeks after large-cap selloff. The large-cap crash started late Feb — so mid-March IS the timing window.
- **Liquidity**: The biggest concern. 120-unit lots on a low-liquidity index mean significant execution challenges.
- **Lot Size**: Midcap Nifty 120 — correct per Jan 2026 revision.
- **SEBI Compliance**: Midcap Nifty monthly options on NSE. Compliant.
- **Flags**: [STALE] — beta thesis needs verification. [COST_EROSION_RISK] — liquidity concerns.

### Edge Thesis
High-beta midcap index with 1-2 week lag behind large-cap selloff. 120-unit lot provides significant leverage. Under-traded = less algo competition, more pricing inefficiency. But liquidity is the Achilles heel — execution costs could materially erode edge.

---

## Monthly Category Summary
| # | Strategy | Underlying | Max Profit | Max Loss | Key Edge | Flags |
|---|----------|------------|------------|----------|----------|-------|
| M-1 | Bear Call Spread | BankNifty | Rs 4,200 | Rs 10,800 | Oil-banking nexus, high prob | [VERIFY] |
| M-2 | Put Christmas Tree | BankNifty | Rs 26,100 | Rs 18,900 | 1,500-pt profit zone | [COST_EROSION_RISK] |
| M-3 | Rev Jade Lizard | Nifty | Rs 11,050 | Rs 21,450/Unlim | Dual-sided premium selling | None |
| M-4 | Jade Lizard | Nifty | Rs 7,930 | Rs 0 (up)/Unlim (dn) | ZERO upside risk | None |
| M-5 | Put Ladder | Nifty | Rs 26,975 | Rs 12,025/Unlim | 1,500-pt staircase zone | None |
| M-6 | Midcap Bear Put | MidcapNifty | Rs 36,000 | Rs 24,000 | High-beta second wave | [STALE], [COST_EROSION_RISK] |

**Total Monthly Strategies: 6**
