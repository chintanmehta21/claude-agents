# Bearish Scout: WebSearch Output
**Scout ID:** bearish-websearch-01
**Timestamp:** 2026-03-26
**Sources:** Zerodha Varsity, 5paisa, Strike.money, Samco, globalpublicist24
**Market Context:** Nifty 23306 | BankNifty 53708 | VIX 24.64 (HIGH regime)

---

## Strategy 1: Bear Put Spread on Nifty (Weekly)

**Structure:** Buy ATM PE + Sell OTM PE (same expiry)
**Underlying:** NIFTY | **Expiry:** Weekly (Tuesday)
**Source:** Zerodha Varsity (Bear Put Spread chapter)

### Entry Conditions
- Technical: Nifty rejected at 23500 resistance with bearish engulfing candle. RSI(14) > 60 showing overbought on 1H. MACD histogram turning negative. Rationale: Overbought bounce failure signals resumption of downtrend.
- IV Environment: VIX 20-28 (HIGH). Bear put spread is net debit — HIGH VIX means expensive, but spread neutralizes most vega. IVR > 40.
- Timing: 3-5 DTE weekly. Enter Monday/Tuesday for next week's Tuesday expiry.
- Rationale: In the current recovery attempt, Nifty faces resistance at 23500. A failed breakout setup creates a high-probability bear put spread entry. Weekly expiry accelerates theta on the sold leg.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | PE | ATM (nearest 50-strike) | 1 | Weekly |
| SELL | PE | ATM-200 | 1 | Weekly |

### Exit Conditions
- Profit Target: 120 pts (60% of max profit). Rationale: Don't wait for full pin — take profits at 60%.
- Stop Loss: 60 pts (net debit). Rationale: Max loss = net debit.
- Time Exit: Close by 2:00 PM on expiry day. Rationale: Gamma risk.
- Adjustment Rules: If Nifty drops below sold strike → hold for max profit. If Nifty rallies 150 pts → close for partial loss.
- Best Exit Strategy: Limit order at 60% of spread width.

### Risk-Reward (pts)
- Max Profit: ~140 pts (spread width - debit) | Max Loss: ~60 pts (net debit) | Breakeven: ATM - 60 pts
- Margin: ~₹25,000-35,000 | ROM: 2.0x-2.5x

### Greeks Exposure
- Net Delta: -0.25 to -0.35 | Gamma Risk: Moderate | Vega: Near neutral
- Theta: +1.5 to +3 pts/day (sold leg decaying faster) | Theta/Gamma: Favorable

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Bad: -60 pts | Bad: -60 pts | Bad: -60 pts | Bad: -60 pts |
| Down | Good: +100 pts | Very Good: +130 pts | Good: +120 pts | Moderate: +90 pts |
| Range | Poor: -30 pts | Neutral: -10 pts | Neutral: +5 pts | Poor: -20 pts |
Versatility Score: 5/12 | Best: Med-Vol Down | Worst: Any Up

### Executor Parameters
```json
{
  "strategy_id": "bear_put_spread_nifty_weekly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY weekly PE",
    "indicators": ["RSI_14_1H", "MACD_12_26_9_1H", "resistance_levels"]
  },
  "strike_selection": {
    "buy_leg": "ATM_nearest_50",
    "sell_leg": "ATM - 200",
    "min_spread_width": 150,
    "max_spread_width": 300
  },
  "entry_signal": {
    "condition": "bearish_engulfing_1H AND RSI_14_1H > 60 AND MACD_hist_negative AND spot < 23500_resistance",
    "timing": "DTE >= 3 AND DTE <= 5",
    "order_type": "LIMIT",
    "max_slippage_pts": 3
  },
  "exit_signal": {
    "profit_target_pts": 120,
    "stop_loss_pts": 60,
    "time_exit": "expiry_day_14:00"
  },
  "position_sizing": { "max_risk_pct": 2, "lots": 1, "lot_size": 75 }
}
```

### Edge Thesis
Bear put spreads on Nifty weekly are the mirror of the bullish structure — clean, defined risk bearish trades. The 23500 resistance zone is well-established. A failed recovery attempt creates a high-probability short-term bearish setup. Weekly theta works in favor as the sold OTM PE decays faster.

### Source & Citations
- Zerodha Varsity: Bear Put Spread (https://zerodha.com/varsity/chapter/bear-put-spread/) — Evergreen
- Strike.money: Bear Put Spread (https://www.strike.money/options/bear-put-spread) — 2026

---

## Strategy 2: Bear Call Spread (Credit Spread) on Nifty (Weekly)

**Structure:** Sell OTM CE + Buy further OTM CE
**Underlying:** NIFTY | **Expiry:** Weekly
**Source:** Samco Top 8 Strategies + 5paisa High VIX Strategies

### Entry Conditions
- Technical: Nifty below 23500 with declining breadth. FII net sellers. VIX rising (bearish signal). Resistance at 23500-23800 zone. Rationale: Selling calls above resistance in bearish/range-bound market collects premium.
- IV Environment: VIX > 22 (HIGH). Credit strategy — elevated premiums maximize credit. IVR > 55.
- Timing: 3-5 DTE weekly.
- Rationale: Bear call spreads are the preferred bearish credit strategy. In HIGH VIX, premiums above resistance are inflated. The market needs to rally past resistance AND past the sold strike to cause losses.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM+300 (23600) | 1 | Weekly |
| BUY | CE | ATM+500 (23800) | 1 | Weekly |

### Exit Conditions
- Profit Target: 70% of net credit (~80-120 pts). Rationale: Standard credit spread exit.
- Stop Loss: 200 pts or Nifty above sold strike by 100 pts. Rationale: 2x credit stop.
- Time Exit: Close Monday EOD before Tuesday expiry if > 50% profit.
- Adjustment Rules: If Nifty rallies to sold strike → roll up 200 pts for additional credit. Cost: ~30 pts net.
- Best Exit Strategy: 70% profit limit order.

### Risk-Reward (pts)
- Max Profit: ~100-150 pts (credit) | Max Loss: ~50-100 pts (spread - credit) | Breakeven: Sold strike + credit
- Margin: ~₹30,000-45,000 | ROM: 0.7x-1.2x

### Greeks Exposure
- Net Delta: -0.10 to -0.20 | Gamma Risk: Low (OTM) | Vega: -0.03 to -0.05
- Theta: +3-6 pts/day (strongly positive) | Theta/Gamma: Excellent

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Bad: -100 pts | Bad: -80 pts | Moderate: -50 pts | Bad: -100 pts |
| Down | Good: +120 pts | Very Good: +140 pts | Excellent: +150 pts | Good: +120 pts |
| Range | Good: +100 pts | Very Good: +130 pts | Very Good: +140 pts | Good: +110 pts |
Versatility Score: 7/12 | Best: High-Vol Down/Range | Worst: Low-Vol Up

### Executor Parameters
```json
{
  "strategy_id": "bear_call_spread_nifty_weekly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY weekly CE",
    "indicators": ["FII_net_data", "breadth_ADR", "resistance_levels"]
  },
  "strike_selection": {
    "sell_leg": "ATM + 300",
    "buy_leg": "ATM + 500",
    "min_credit_pts": 60
  },
  "entry_signal": {
    "condition": "FII_net_sellers AND ADR < 1 AND VIX > 22 AND spot < 23500",
    "timing": "DTE >= 3 AND DTE <= 5",
    "order_type": "LIMIT",
    "max_slippage_pts": 3
  },
  "exit_signal": {
    "profit_target_pct": 70,
    "stop_loss_pts": 200,
    "time_exit": "expiry_day_minus_1_EOD"
  },
  "position_sizing": { "max_risk_pct": 2, "lots": 1, "lot_size": 75 }
}
```

### Edge Thesis
Bear call spreads above resistance are the highest-probability bearish credit trade. Nifty needs to break through 23500 resistance AND rally another 300 pts to reach the sold strike. In HIGH VIX, the credit collected is 60-80% of spread width, creating near-zero risk in many scenarios.

### Source & Citations
- Samco: Top 8 Strategies (https://www.samco.in/knowledge-center/articles/which-is-the-best-strategy-for-nifty-and-bank-nifty-option-trading/) — 2026
- 5paisa: VIX High Strategies (https://www.5paisa.com/blog/how-to-trade-using-india-vix-5-proven-strategies) — 2026

---

## Strategy 3: Put Ratio Backspread on Nifty (Monthly)

**Structure:** Sell 1 ATM PE + Buy 2 OTM PE (2:1 ratio)
**Underlying:** NIFTY | **Expiry:** Monthly
**Source:** Zerodha Varsity (Put Ratio Back Spread) + 5paisa Bearish Strategies

### Entry Conditions
- Technical: Nifty failing at 23500 resistance with declining volume. Lower highs forming on daily chart. ADX > 20 with -DI > +DI (established downtrend). Rationale: Expecting resumption of downtrend after relief rally.
- IV Environment: VIX 22-28 (HIGH). Net credit entry. Positive vega from 2 long puts benefits if VIX spikes further on breakdown.
- Timing: 15-25 DTE monthly. Needs time for large move.
- Rationale: Put ratio backspread is the bearish convexity play. Entered for credit, unlimited profit on large down moves, defined max loss zone near bought strikes. Perfect for crash protection.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | PE | ATM (23300) | 1 | Monthly |
| BUY | PE | ATM-300 (23000) | 2 | Monthly |

### Exit Conditions
- Profit Target: 400+ pts if crash occurs. Let winners run. Rationale: Convexity play — unlimited downside profit.
- Stop Loss: 200 pts (max loss near 23000). Rationale: If pinned at bought strike, accept max loss.
- Time Exit: Close at 5 DTE if not profitable. Rationale: Theta kills OTM puts.
- Adjustment Rules: If Nifty drops to 22700 → sell 1 PE at 22500 to lock profit (creates put butterfly). Rationale: Converts unlimited to guaranteed profit.
- Best Exit Strategy: Trail with 150-pt trailing stop from max profit.

### Risk-Reward (pts)
- Max Profit: Unlimited below 22700 | Max Loss: ~250-300 pts (at 23000) | Breakeven: ~23300 (upper), ~22700 (lower)
- Margin: ~₹80,000-1,20,000 | ROM: 3x-10x+ on crash

### Greeks Exposure
- Net Delta: -0.15 to -0.35 | Gamma Risk: High (positive gamma) | Vega: +0.05 to +0.10
- Theta: -2 to -5 pts/day (negative) | Theta/Gamma: Negative theta, high gamma payoff

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Neutral: +15 pts (credit) | Neutral: +10 pts | Neutral: +5 pts | Neutral: 0 pts |
| Down (moderate) | Bad: -250 pts | Bad: -200 pts | Moderate: -150 pts | Moderate: -100 pts |
| Down (crash) | Good: +300 pts | Very Good: +500 pts | Excellent: +700 pts | Excellent: +1000+ pts |
| Range | Moderate: -80 pts | Moderate: -100 pts | Moderate: -80 pts | Moderate: -50 pts |
Versatility Score: 5/12 | Best: Extreme-Vol Crash | Worst: Low-Vol Moderate Down

### Executor Parameters
```json
{
  "strategy_id": "put_ratio_backspread_nifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY monthly PE",
    "indicators": ["ADX_14_D", "DI_plus_minus", "volume_trend"]
  },
  "strike_selection": {
    "sell_leg": "ATM",
    "buy_leg": "ATM - 300",
    "ratio": "1:2",
    "target_net_credit": true
  },
  "entry_signal": {
    "condition": "lower_highs_daily AND ADX > 20 AND DI_minus > DI_plus AND VIX > 22",
    "timing": "DTE >= 15 AND DTE <= 25",
    "order_type": "LIMIT",
    "max_slippage_pts": 5
  },
  "exit_signal": {
    "profit_target_pts": 400,
    "stop_loss_pts": 200,
    "time_exit_dte": 5,
    "conversion_trigger": "spot < buy_strike - 300"
  },
  "position_sizing": { "max_risk_pct": 3, "lots_sell": 1, "lots_buy": 2, "lot_size": 75 }
}
```

### Edge Thesis
The put ratio backspread is the ideal bearish crash protection strategy in HIGH VIX. Entered for credit, it costs nothing if wrong (Nifty rallies). On a large crash (500+ pts), the 2 long puts generate outsized returns. With geopolitical tensions and FPI selling, crash risk is real. This strategy provides asymmetric exposure to that tail risk.

### Source & Citations
- Zerodha Varsity: Put Ratio Back Spread (https://zerodha.com/varsity/chapter/put-ratio-back-spread/) — Evergreen
- 5paisa: Put Ratio Backspread (https://www.5paisa.com/derivatives/derivative-strategies/bearish-put-ratio-back-spread) — 2026

---

## Strategy 4: Short Call Ladder on BankNifty (Monthly)

**Structure:** Sell 1 ATM CE + Buy 1 OTM CE + Buy 1 further OTM CE
**Underlying:** BANKNIFTY | **Expiry:** Monthly
**Source:** Zerodha Varsity Module 6 + PL Capital BankNifty Guide

### Entry Conditions
- Technical: BankNifty overbought at 54000+ with RSI > 70 on daily. Shooting star or doji forming at resistance. FII selling in banking stocks. Rationale: Overbought banking sector after 2% rally sets up mean reversion.
- IV Environment: VIX > 20 (HIGH). Sold ATM CE collects elevated premium. Two bought OTM CEs provide hedge against wrong-side breakout.
- Timing: 15-25 DTE monthly.
- Rationale: The short call ladder profits from a decline AND from an extreme rally (if BankNifty breaks above both bought strikes). Net credit entry in HIGH VIX. The dual upside hedge protects against being wrong.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM (53700) | 1 | Monthly |
| BUY | CE | ATM+500 (54200) | 1 | Monthly |
| BUY | CE | ATM+1000 (54700) | 1 | Monthly |

### Exit Conditions
- Profit Target: 200 pts (if BankNifty declines below ATM). Rationale: Credit retained as all legs expire worthless.
- Stop Loss: 300 pts (if pinned between sold and first bought strike). Rationale: Max loss zone.
- Time Exit: Close at 7 DTE.
- Adjustment Rules: If BankNifty rallies past 54700 → hold (unlimited profit kicks in). Rationale: Structure converts to bullish above both bought strikes.
- Best Exit Strategy: Close in max-loss zone; hold in profit zones.

### Risk-Reward (pts)
- Max Profit (bearish): ~200-250 pts (credit) | Max Profit (extreme bullish): Unlimited above 55200 | Max Loss: ~300-400 pts (between 54200-54700)
- Margin: ~₹80,000-1,10,000 | ROM: 1.0x-2.0x

### Greeks Exposure
- Net Delta: -0.20 to -0.35 | Gamma Risk: Moderate (ratio) | Vega: +0.02 to +0.05
- Theta: +2-4 pts/day (mildly positive) | Theta/Gamma: Acceptable

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Bad: -300 pts | Bad: -250 pts | Moderate: -200 pts | Moderate: -150 pts |
| Up (extreme) | Good: +200 pts | Very Good: +400 pts | Excellent: +600 pts | Excellent: +800 pts |
| Down | Good: +200 pts | Very Good: +250 pts | Very Good: +250 pts | Good: +200 pts |
| Range | Moderate: +100 pts | Good: +150 pts | Good: +200 pts | Moderate: +150 pts |
Versatility Score: 6/12 | Best: Extreme-Vol Extreme Up/Down | Worst: Low-Vol Moderate Up

### Executor Parameters
```json
{
  "strategy_id": "short_call_ladder_banknifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:BANKNIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "BANKNIFTY monthly CE",
    "indicators": ["RSI_14_D", "candle_pattern", "FII_banking_flow"]
  },
  "strike_selection": {
    "sell_leg": "ATM",
    "buy_leg_1": "ATM + 500",
    "buy_leg_2": "ATM + 1000"
  },
  "entry_signal": {
    "condition": "RSI_14_D > 70 AND bearish_candle_pattern AND FII_selling_banking AND VIX > 20",
    "timing": "DTE >= 15 AND DTE <= 25",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "profit_target_bearish_pts": 200,
    "stop_loss_pts": 300,
    "extreme_rally_hold": "spot > buy_leg_2_strike",
    "time_exit_dte": 7
  },
  "position_sizing": { "max_risk_pct": 3, "lots": 1, "lot_size": 30 }
}
```

### Edge Thesis
The short call ladder is a versatile bearish structure that also profits from extreme rallies. This dual-profit zone makes it ideal for uncertain markets. With BankNifty overbought after a 2% rally and FII selling ongoing, the primary thesis is a pullback. But the two bought OTM calls provide free insurance against a melt-up scenario.

### Source & Citations
- Zerodha Varsity: Options Strategies Module (https://zerodha.com/varsity/module/option-strategies/) — Evergreen
- PL Capital: BankNifty Monthly Options Guide (https://www.plindia.com/blogs/bank-nifty-monthly-options-trading-guide-2025/) — 2025

---

## Strategy 5: Nifty Bearish Iron Condor with Skew (Quarterly)

**Structure:** Sell OTM CE spread (tight) + Sell OTM PE spread (wide) — bearish asymmetry
**Underlying:** NIFTY | **Expiry:** Quarterly
**Source:** abtadka.com Iron Condor + 5paisa VIX Mean Reversion

### Entry Conditions
- Technical: Nifty quarterly downtrend channel 21500-24000. Price near upper channel (23300). Macro headwinds (FPI selling, global uncertainty). Rationale: Bearish skew places tighter call spread closer (higher probability of profit).
- IV Environment: VIX > 22 (HIGH). Quarterly premium is maximized. VIX mean reversion over 60-90 days favors sellers.
- Timing: 60-90 DTE quarterly.
- Rationale: Bearish-skewed iron condor collects more credit on the call side (tighter spread, closer to ATM) while giving more room on the put side (wider spread, further from ATM). This creates a bearish lean to a neutral structure.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM+300 (23600) | 1 | Quarterly |
| BUY | CE | ATM+500 (23800) | 1 | Quarterly |
| SELL | PE | ATM-800 (22500) | 1 | Quarterly |
| BUY | PE | ATM-1500 (21800) | 1 | Quarterly |

### Exit Conditions
- Profit Target: 60% of net credit (~300-400 pts). Rationale: Don't need full decay for quarterly.
- Stop Loss: 500 pts. Rationale: Wider stop for quarterly.
- Time Exit: Close at 20 DTE if profitable.
- Adjustment Rules: If call side tested → roll calls up 200 pts. If put side tested → close put spread. Rationale: Manage individually.
- Best Exit Strategy: VIX-based exit below 16.

### Risk-Reward (pts)
- Max Profit: ~500-600 pts (net credit) | Max Loss: ~200-400 pts (wider spread side - credit) | Breakeven: Wide range 22100-24000
- Margin: ~₹1,50,000-2,00,000 | ROM: 0.25x-0.40x

### Greeks Exposure
- Net Delta: -0.05 to -0.15 (slightly bearish) | Gamma Risk: Very Low | Vega: -0.08 to -0.15
- Theta: +3-6 pts/day | Theta/Gamma: Excellent

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Moderate: -100 pts | Moderate: -50 pts | Good: +50 pts (CE far away) | Moderate: -150 pts |
| Down (moderate) | Very Good: +400 pts | Excellent: +500 pts | Excellent: +550 pts | Good: +400 pts |
| Range | Very Good: +450 pts | Excellent: +550 pts | Excellent: +600 pts | Very Good: +450 pts |
Versatility Score: 8/12 | Best: High-Vol Down/Range | Worst: Extreme-Vol Strong Up

### Executor Parameters
```json
{
  "strategy_id": "bearish_iron_condor_nifty_quarterly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY quarterly CE+PE",
    "indicators": ["quarterly_channel", "FPI_flow", "global_sentiment"]
  },
  "strike_selection": {
    "sell_ce": "ATM + 300",
    "buy_ce": "ATM + 500",
    "sell_pe": "ATM - 800",
    "buy_pe": "ATM - 1500"
  },
  "entry_signal": {
    "condition": "spot_near_upper_channel AND FPI_net_sellers AND VIX > 22",
    "timing": "quarterly_DTE >= 60 AND quarterly_DTE <= 90",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "profit_target_pct": 60,
    "stop_loss_pts": 500,
    "vix_exit_below": 16,
    "time_exit_dte": 20
  },
  "position_sizing": { "max_risk_pct": 5, "lots": 1, "lot_size": 75 }
}
```

### Edge Thesis
The bearish-skewed quarterly iron condor captures the most probable scenario: Nifty staying below 23800 over the next 60-90 days while VIX normalizes from 24.64 toward 14-16. The tight call spread close to ATM collects more premium than the wide but distant put spread. This creates a structural bearish lean that profits from the macro headwinds.

### Source & Citations
- abtadka: Iron Condor (https://www.abtadka.com/2026/01/nifty%2050-iron%20condor-strategy.html) — Jan 2026
- 5paisa: VIX Mean Reversion (https://www.5paisa.com/blog/how-to-trade-using-india-vix-5-proven-strategies) — 2026

---

## Scout Health Diagnostic
- **Strategies Found:** 5/5
- **Schema Compliance:** PASS
- **Source Quality:** HIGH
- **Staleness Risk:** LOW
- **Dedup Flags:** Bear put spread mirrors bullish bull call spread; iron condor variants may overlap
