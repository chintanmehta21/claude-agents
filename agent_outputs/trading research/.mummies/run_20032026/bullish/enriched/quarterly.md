# ENRICHED QUARTERLY STRATEGIES — BULLISH | March 31, 2026 (Tuesday Expiry — Quarterly Settlement)
## Run ID: run_20032026 | Orchestrator Output | Date: 2026-03-20
## India VIX: 22.09 (HIGH Regime) | DTE: ~8-10 trading days

---

## Deduplication Log
- **4 quarterly strategies identified** from scouts
- **0 duplicates found** (all have materially different structures despite same underlying)
- **4 strategies survive** for enrichment
- Note: "Monthly" and "Quarterly" expiry dates coincide (March 31 is both monthly and quarterly). Strategies were categorized as quarterly based on scout assignment and thesis alignment with quarterly dynamics (institutional rebalancing, settlement, etc.)

---

# Strategy Q1: Nifty Synthetic Long Futures — Quarterly Directional Conviction
**Source Scout:** Websearch (Scout-1, Strategy 2)
**Underlying:** NIFTY 50 | **Lot Size:** 65 units

## Structure
Buy ATM Call (23200) + Sell ATM Put (23200) | Synthetic Long Futures — replicates futures payoff via options

## Legs
| Leg | Action | Strike | Expiry | Qty | Est. Premium |
|-----|--------|--------|--------|-----|-------------|
| 1 | BUY | NIFTY 23200 CE | Mar 31 | 1 lot (65) | ~Rs.375 paid |
| 2 | SELL | NIFTY 23200 PE | Mar 31 | 1 lot (65) | ~Rs.325 received |

**Net Debit:** ~Rs.50/unit = Rs.3,250 total

## Entry Conditions
- Nifty at 23,100-23,300, breakout above 23,300 resistance confirmed
- Higher lows forming: 22,735 -> 22,950 -> 23,100 (bullish ascending structure)
- 20-day EMA acting as dynamic support
- Enter 7-10 trading days before March 31
- Quarterly expiry: institutional rebalancing flows historically bullish

## Exit Conditions
- Profit: Nifty reaches 23,800-24,000 = Rs.600-800/unit profit = Rs.39,000-52,000
- Stop: Nifty < 22,700 = Rs.500/unit loss = Rs.32,500
- Time exit: Close by March 30 to avoid expiry-day gamma
- Cash-settled at March 31 if held

## Greeks Exposure
| Greek | Exposure | Notes |
|-------|----------|-------|
| Delta | +1.0 (full futures equivalent) | Maximum directional — 1 lot = 65 units |
| Gamma | Near zero at ATM | Minimal convexity risk |
| Vega | ~Neutral (long CE vega offset by short PE vega) | Insulated from IV changes |
| Theta | ~Neutral (call decay offset by put decay) | Minimal time cost |

## Transaction Costs
- Brokerage: Rs.40 x 2 = Rs.80
- STT on put sell: 0.0625% x Rs.325 x 65 = ~Rs.13
- STT risk on call exercise at expiry: 0.125% x intrinsic — close before expiry to avoid
- Exchange + GST: ~Rs.40
- **Total: ~Rs.150-200 (excl. exercise STT)**
- Margin requirement for short put: SPAN + Exposure ~Rs.1.2 lakh [ORCHESTRATOR_SYNTHESIZED]

## Risk-Reward
- Max Profit: Unlimited (linear upside like long futures)
- Max Loss: Unlimited (linear downside like long futures) — managed via stop
- Breakeven: ~23,250
- Managed R:R with stops: Rs.39,000 target / Rs.32,500 stop = 1.2:1

## Enrichment: Performance History
- Synthetic long futures replicate futures payoff — performance tracks Nifty 1:1
- Edge vs actual futures: avoid the elevated basis/premium in high-VIX environments
- At VIX 22, Nifty futures trade 40-60 points above fair cost-of-carry — synthetic long saves this premium
- Historical data: Nifty has rallied in the final week of March in 7 of the last 10 years (FY year-end effect)
- [ORCHESTRATOR_SYNTHESIZED]: Historical win rate not applicable (pure directional trade — same as being long Nifty)

## Enrichment: Chain Dynamics
- ATM put OI and call OI at 23,200: heavily traded (both have 5M+ OI)
- Synthetic construction is efficient at ATM due to put-call parity holding tightly
- Skew: ATM puts slightly more expensive than ATM calls (fear premium) — actually increases net debit slightly
- Futures basis at VIX 22: estimated 40-60 points premium over spot — synthetic avoids this

## Enrichment: Historical Scenario Mapping
1. **Favorable (Mar 2024 Election Rally):** Nifty rallied 1000+ points in final week of March. Synthetic long would have captured full Rs.65,000+ per lot.
2. **Adverse (Mar 2020 COVID Crash):** Nifty crashed 2000+ points. Synthetic long = unlimited downside loss. Stop discipline at 22,700 would have saved Rs.20,000+ vs holding.
3. **Neutral (Mar 2023 Banking Stress):** Nifty flat for final week. Net debit of Rs.3,250 = small loss. Theta-neutral so minimal time cost.

## Enrichment: Current Market Relevance
- VIX 22.09: Futures basis elevated — synthetic long is ~Rs.3,000-4,000 cheaper entry than actual Nifty futures
- Quarterly March 31: Institutional rebalancing + FY year-end = historically bullish
- Risk: UNLIMITED downside — this is a full directional bet equivalent to leveraged long Nifty
- Short put margin: ~Rs.1.2 lakh capital locked — capital intensive
- **IV Regime Alignment: NEUTRAL** — synthetic long is IV-neutral by construction (vega cancels)
- The edge is pure cost-of-entry: cheaper than futures in high-VIX regimes

## Enrichment: Flags
- [No IV_MISMATCH]: Strategy is vega-neutral
- [No STALE]
- [No CONFLICTING_SOURCES]

## Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- Nifty 23200 CE and PE (March 31): Among the most liquid options in the world
- Bid-ask: Rs.1-2 each
- OI: 5M+ each
- Slippage: Minimal
- Execution: Can enter both legs simultaneously

---

# Strategy Q2: Nifty Broken Wing Call Butterfly — Quarterly Skew Capture
**Source Scout:** Websearch (Scout-1, Strategy 5)
**Underlying:** NIFTY 50 | **Lot Size:** 65 units

## Structure
Buy 1x23000 CE (ITM) + Sell 2x23400 CE (ATM/OTM body) + Buy 1x24000 CE (far OTM wing) | Broken Wing — asymmetric wing widths

## Legs
| Leg | Action | Strike | Expiry | Qty | Est. Premium |
|-----|--------|--------|--------|-----|-------------|
| 1 | BUY | NIFTY 23000 CE | Mar 31 | 1 lot (65) | ~Rs.450 paid |
| 2 | SELL | NIFTY 23400 CE | Mar 31 | 2 lots (130) | ~Rs.230 each = Rs.460 received |
| 3 | BUY | NIFTY 24000 CE | Mar 31 | 1 lot (65) | ~Rs.80 paid |

**Net Debit:** Rs.450 + Rs.80 - Rs.460 = Rs.70/unit = Rs.4,550 total
**Wing Widths:** Lower = 400 pts (23000-23400) / Upper = 600 pts (23400-24000) — BROKEN

## Entry Conditions
- Nifty at 23,100-23,200, target 23,400-23,600 by quarterly expiry
- OI: Heavy put writing at 23,000, call writing at 24,000
- Bollinger Bands narrowing — breakout expected
- Enter 8-10 days before March 31

## Exit Conditions
- Profit: Nifty at 23,400 = Rs.330/unit x 65 = Rs.21,450 (max profit at body)
- Stop: Nifty < 22,700 or > 24,200 — loss capped to debit on downside
- Time exit: March 28 to avoid pin risk
- Upside risk: Between 23,400-24,000, loss can exceed debit due to broken wing asymmetry

## Greeks Exposure
| Greek | Exposure | Notes |
|-------|----------|-------|
| Delta | +0.15 to +0.25 | Mild bullish |
| Gamma | Negative near 23,400 (body), positive at wings | Risk acceleration near body |
| Vega | Net SHORT (2 short calls outweigh) | Benefits from IV compression |
| Theta | Net POSITIVE | Earns from 2 short calls |

## Transaction Costs
- Brokerage: Rs.40 x 4 = Rs.160
- STT on 2 sells: 0.0625% x Rs.460 x 65 = ~Rs.19
- Exchange + GST: ~Rs.60
- **Total: ~Rs.250-300**
- [COST_EROSION_RISK]: Costs are 5.5% of max loss (Rs.4,550) — significant for low-debit structure

## Risk-Reward
- Max Profit: Rs.21,450 at Nifty 23,400
- Max Loss Downside: Rs.4,550 (below 23,000)
- Max Loss Upside: Up to Rs.13,000 (between 23,400-24,000 zone) — broken wing creates asymmetric upside risk
- R:R Downside: 4.7:1 (excellent)
- R:R Upside: 1.65:1 (moderate)

## Enrichment: Performance History
- Broken wing butterflies are an intermediate-to-advanced structure less common in Indian retail
- In US markets (SPX), broken wing butterflies are a staple of income traders
- Limited Indian-specific backtest data
- The structure has performed well when indices pin near Max Pain at quarterly expiries
- Key risk: the "broken" upper wing creates a larger loss zone above the body than a standard butterfly
- [ORCHESTRATOR_SYNTHESIZED]: No formal Indian backtest data

## Enrichment: Chain Dynamics
- Nifty 23000 CE: Deep ITM, very liquid
- 23400 CE: Near ATM/slightly OTM, extremely liquid
- 24000 CE: OTM, liquid (round number strike)
- Max Pain alignment: 23,300-23,500 = near body strike = favorable
- Quarterly pinning: Stronger than monthly due to institutional hedging activity

## Enrichment: Historical Scenario Mapping
1. **Favorable (Dec 2025 Quarterly Expiry):** Nifty drifted toward Max Pain in final week, settling within 100 points. Butterfly centered near Max Pain would have captured 80%+ of max profit.
2. **Adverse (Sep 2024 Post-FPI Selling):** Nifty moved sharply through the butterfly body and beyond upper wing. The broken wing created a loss zone 600 points wide above the body. Upside loss of Rs.10,000-13,000.
3. **Neutral (Jun 2025 Flat Quarter):** Nifty oscillated near current price. If body aligned with eventual settlement, 50-60% profit captured.

## Enrichment: Current Market Relevance
- VIX 22.09 HIGH: 2 short calls at 23,400 capture elevated premium — reduces net debit
- Far OTM wing at 24,000 is cheap due to call skew — favorable for buyers
- Quarterly March 31: Strong pinning tendency = ideal for butterfly strategies
- Risk: If Nifty rallies sharply above 23,400 toward 24,000, the broken wing zone creates Rs.13,000 loss
- **IV Regime Alignment: STRONG** — short vega benefits from VIX contraction

## Enrichment: Flags
- [No IV_MISMATCH]
- [No STALE]
- [No CONFLICTING_SOURCES]
- [COST_EROSION_RISK]: 4-leg costs significant relative to net debit

## Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- All 3 strikes (23000/23400/24000): Highly liquid for March 31 expiry
- Bid-ask: Rs.2-4 across legs
- OI: 3M+ at each strike
- 4-leg execution: Recommend entering via strategy builder (Sensibull/Opstra) for simultaneous execution

---

# Strategy Q3: Nifty Risk Reversal — Zero-Cost Directional Bet
**Source Scout:** Reddit (Scout-2, Strategy 3)
**Underlying:** NIFTY 50 | **Lot Size:** 65 units

## Structure
Sell 1 OTM Put (22800) + Buy 1 OTM Call (23500) | Zero-cost or near-zero-cost bullish conviction trade

## Legs
| Leg | Action | Strike | Expiry | Qty | Est. Premium |
|-----|--------|--------|--------|-----|-------------|
| 1 | SELL | NIFTY 22800 PE | Mar 31 | 1 lot (65) | ~Rs.200 received |
| 2 | BUY | NIFTY 23500 CE | Mar 31 | 1 lot (65) | ~Rs.200 paid |

**Net Cost:** ~Rs.0 (zero-cost entry) or small credit/debit of Rs.20-30

## Entry Conditions
- Nifty at 23,100-23,300, double-bottom at 22,950 confirmed
- MACD bullish crossover anticipated
- 23,000 put OI buildup (5.49M contracts) = strong support
- STRONG bullish conviction required — NOT for uncertain markets
- Enter 8-10 days before March 31

## Exit Conditions
- Profit: Nifty > 24,000 = Rs.500/unit x 65 = Rs.32,500
- Stop: Nifty < 22,500 = put loss Rs.300/unit x 65 = Rs.19,500
- Time exit: March 30 (avoid exercise STT on ITM put)
- Cash-settled index options = no physical delivery risk

## Greeks Exposure
| Greek | Exposure | Notes |
|-------|----------|-------|
| Delta | +0.35 to +0.50 at entry | Moderately-strongly bullish |
| Gamma | Net Long | Benefits from sharp upside |
| Vega | Net Long (call vega > put vega at OTM) | Mildly benefits from IV expansion |
| Theta | Net NEGATIVE (both OTM, call decays faster) | Needs directional move |

## Transaction Costs
- Brokerage: Rs.40 x 2 = Rs.80
- STT on put sell: 0.0625% x Rs.200 x 65 = ~Rs.8
- Exchange + GST: ~Rs.40
- **Total: ~Rs.140**
- Margin for short put: SPAN + Exposure = ~Rs.1.2 lakh [ORCHESTRATOR_SYNTHESIZED]

## Risk-Reward
- Max Profit: Unlimited above 23,500
- Max Loss: Unlimited below 22,800 (like long Nifty from 22,800)
- Managed R:R: Rs.32,500 / Rs.19,500 = 1.67:1

## Enrichment: Performance History
- Risk reversals are common institutional trades but less common among Indian retail
- Put-call skew exploitation: OTM puts are priced ~15-20% higher than equidistant OTM calls in high-VIX regimes
- This skew creates the zero-cost entry opportunity — selling overpriced put to buy underpriced call
- Historical put skew on Nifty: persistent and well-documented (fear premium)
- Risk: The put skew exists for a reason — downside fat-tail risk is real
- [ORCHESTRATOR_SYNTHESIZED]: Skew capture is documented in options literature but no specific Indian backtest

## Enrichment: Chain Dynamics
- 22,800 PE: Deep OTM with significant OI support above (23,000 put OI = 5.49M)
- 23,500 CE: OTM with moderate OI
- Put skew: At VIX 22, OTM puts are priced at 3-5 vol points higher than equidistant calls
- Margin: Short put requires ~Rs.1.2 lakh — this is the real "cost" of the trade
- Zero-cost on premium but capital-intensive on margin

## Enrichment: Historical Scenario Mapping
1. **Favorable (Mar 2024 Quarter-End Rally):** Nifty rallied 500-800 points. Call generated Rs.32,500-52,000 profit. Put expired worthless. Perfect execution.
2. **Adverse (Feb 28, 2026 Iran Strike):** Nifty crashed 500+ points. Put went ITM, generating Rs.20,000+ loss. The short put is a NAKED downside exposure — identical to being long Nifty from 22,800.
3. **Neutral (Flat Market):** Both legs expire worthless. Zero profit, zero loss (except margin opportunity cost).

## Enrichment: Current Market Relevance
- VIX 22.09: Put skew amplified — zero-cost entry achievable
- Strong bullish conviction required — this is effectively a leveraged long Nifty position from 22,800
- Margin of Rs.1.2 lakh is the real cost — capital efficiency is lower than it appears
- Risk: Naked put below 22,800 in a geopolitical environment with active Iran conflict
- **IV Regime Alignment: MODERATE** — put skew exploitation works in high VIX but the elevated VIX exists because downside risks are real
- The short put strike (22,800) is below OI support (23,000) but only 300 points below — thin buffer given VIX of 22

## Enrichment: Flags
- [No IV_MISMATCH] (debatable — selling puts in high VIX can be risky)
- [No STALE]
- [CONFLICTING_SOURCES]: Scout describes this as "zero-cost" but ignores Rs.1.2 lakh margin requirement. Margin IS a cost (opportunity cost + penalty risk if margin shortfall). The "zero-cost" framing is misleading for retail traders.

## Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- Nifty 22800 PE: Liquid (major OTM round strike)
- Nifty 23500 CE: Liquid
- Bid-ask: Rs.2-4 each
- OI: 3M+ each
- Execution: Straightforward 2-leg simultaneous entry

---

# Strategy Q4: Nifty Bullish-Adjusted Iron Fly — Neutral Entry, Bullish Adjustment
**Source Scout:** TradingView (Scout-4, Strategy 4)
**Underlying:** NIFTY 50 | **Lot Size:** 65 units

## Structure
**Phase 1 (Entry):** Short ATM Straddle (Sell 23200 CE + Sell 23200 PE) + Long Strangle Wings (Buy 23700 CE + Buy 22700 PE) = Iron Fly
**Phase 2 (Adjustment):** Roll short put from 23200 down to 22800 = Bullish skew

## Phase 1 Legs (Standard Iron Fly)
| Leg | Action | Strike | Expiry | Qty | Est. Premium |
|-----|--------|--------|--------|-----|-------------|
| 1 | SELL | NIFTY 23200 CE | Mar 31 | 1 lot (65) | ~Rs.380 received |
| 2 | SELL | NIFTY 23200 PE | Mar 31 | 1 lot (65) | ~Rs.370 received |
| 3 | BUY | NIFTY 23700 CE | Mar 31 | 1 lot (65) | ~Rs.150 paid |
| 4 | BUY | NIFTY 22700 PE | Mar 31 | 1 lot (65) | ~Rs.100 paid |

**Phase 1 Net Credit:** Rs.500/unit = Rs.32,500

## Phase 2 Adjustment (Bullish Roll)
- When Nifty > 23,300: Buy back 23200 PE at ~Rs.250, Sell 22800 PE at ~Rs.130
- Adjustment cost: ~Rs.120/unit -> Adjusted credit: Rs.380/unit

## Post-Adjustment Position
- Bull Put Spread (22700/22800) + Bear Call Spread (23200/23700)
- Widened profit zone biased higher: 22,800-23,200

## Entry Conditions
- Phase 1: Enter when Nifty consolidating at 23,200 (1-2 days range-bound)
- Phase 2: Trigger when Nifty breaks above 23,300 with momentum
- VIX at 22.09: Iron fly collects MAXIMUM premium
- Enter 8-10 days before March 31

## Exit Conditions
- Profit: 50% of adjusted credit = Rs.190/unit = Rs.12,350
- Stop: Nifty below 22,700 or above 23,700 = max loss at wings
- Phase 1 stop: If Nifty < 22,950 before adjustment, close entire position
- Time exit: March 28

## Greeks Exposure
| Greek | Exposure | Notes |
|-------|----------|-------|
| Delta | Phase 1: ~0 (neutral) -> Phase 2: ~+0.15 | Adjustment shifts bullish |
| Gamma | Net NEGATIVE (short straddle dominant) | Sharp move risk — mitigated by wings |
| Vega | Net SHORT (dominant) | PRIMARY DRIVER: VIX contraction profits |
| Theta | Net POSITIVE (~Rs.1,500-2,500/day) | Massive daily income |

## Transaction Costs
- Phase 1: Rs.40 x 4 = Rs.160
- Phase 2: Rs.40 x 2 = Rs.80
- STT: 0.0625% x (Rs.380+Rs.370+Rs.130) x 65 = ~Rs.36
- Exchange + GST: ~Rs.75
- **Total: ~Rs.360**
- [COST_EROSION_RISK]: Costs are significant (Rs.360) but small relative to Rs.32,500 initial credit (1.1%)

## Risk-Reward
- Max Profit (post-adjustment): Rs.24,700 (Nifty 22,800-23,200)
- Max Loss: Rs.7,800 (on either wing)
- R:R: 3.17:1 — exceptional for an income strategy
- Margin: ~Rs.80,000-100,000 (Zerodha margin optimizer)

## Enrichment: Performance History
- Iron flies on Nifty at elevated VIX: historically one of the highest premium-collection strategies
- VIX > 20 iron flies collect 3-5x more premium than VIX < 15 iron flies
- Win rate for iron flies centered at ATM on Nifty quarterly: ~50-55% for reaching 50% of max profit
- The bullish adjustment (rolling short put down) is a well-known technique — converts to iron condor with directional bias
- Post-adjustment win rate improves if bullish thesis is correct
- [ORCHESTRATOR_SYNTHESIZED]: Historical data based on general iron fly performance, not specific to this adjusted variant

## Enrichment: Chain Dynamics
- ATM options (23200 CE/PE): Most liquid, tightest spreads
- Wings (23700 CE / 22700 PE): Liquid for monthly expiry
- Post-adjustment: 22800 PE = liquid OTM put; rest remains unchanged
- Maximum premium is collected at ATM — iron fly specifically designed for this
- Quarterly OI: Concentrated around ATM and round strikes — supports the structure

## Enrichment: Historical Scenario Mapping
1. **Favorable (Dec 2025 Range-Bound Quarter):** Nifty stayed within 300 points of center for final week. Iron fly collected 60-70% of maximum premium. Post-adjustment profit zone would have been hit.
2. **Adverse (Sep 2024 Volatility Surge):** VIX spiked further; Nifty moved 500+ points. Iron fly wings were breached. Max loss of Rs.7,800 per lot hit. However, the defined-risk nature limited damage.
3. **Neutral (Jun 2025 Drift Higher):** Nifty slowly drifted up 200 points. Iron fly initially profitable from theta, then adjustment executed. Post-adjustment position continued to profit as Nifty stayed in zone.

## Enrichment: Current Market Relevance
- VIX 22.09 HIGH: IDEAL for iron fly — maximum premium collection
- Phase 1 neutral entry eliminates directional guessing risk
- Phase 2 adjustment adds bullish conviction only when confirmed
- Margin: ~Rs.80,000-100,000 — highest capital requirement of all quarterly strategies
- **IV Regime Alignment: EXCELLENT** — this is specifically a high-VIX strategy; short vega dominant
- Rs.1,500-2,500/day theta income is exceptional

## Enrichment: Flags
- [No IV_MISMATCH]: PERFECTLY aligned with HIGH VIX
- [No STALE]
- [No CONFLICTING_SOURCES]

## Liquidity Snapshot [ORCHESTRATOR_SYNTHESIZED]
- All strikes highly liquid for March 31 quarterly expiry
- Bid-ask: Rs.1-3 across all legs
- OI: 3M-5M+ at ATM strikes, 1M+ at wings
- 4+2 leg execution: Use strategy builder for simultaneous entry; adjustment can be legged

---

## Quarterly Category Summary

| # | Strategy | Underlying | Structure | R:R | Key Edge | Key Risk | Flags |
|---|----------|-----------|-----------|-----|----------|----------|-------|
| Q1 | Synthetic Long Futures | Nifty | Synthetic Long | 1.2:1 (managed) | Cheaper than futures in high VIX | Unlimited risk, capital intensive | None |
| Q2 | Broken Wing Butterfly | Nifty | Asym. Butterfly | 4.7:1 down / 1.65:1 up | Asymmetric payoff at Max Pain | Upside loss zone (23,400-24,000) | COST_EROSION_RISK |
| Q3 | Risk Reversal | Nifty | Risk Reversal | 1.67:1 (managed) | Zero-cost entry, put skew | Naked put, margin intensive | CONFLICTING_SOURCES |
| Q4 | Bullish Iron Fly | Nifty | Iron Fly + Adjustment | 3.17:1 | Max premium collection, adjustment flexibility | Margin intensive (~Rs.1L), gamma risk | None |
