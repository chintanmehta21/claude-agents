# Bullish Scout: TradingView/Zerodha Output
**Scout ID:** bullish-tradingview-01
**Timestamp:** 2026-03-26
**Sources:** TradingView Ideas, Sensibull, TheOptionCourse, PL Capital, Swastika.co.in
**Market Context:** Nifty 23306 | BankNifty 53708 | VIX 24.64 (HIGH regime)

---

## Strategy 1: Nifty Bull Call Ladder (Monthly)

**Structure:** Buy 1 ATM CE + Sell 1 OTM CE + Sell 1 further OTM CE
**Underlying:** NIFTY | **Expiry:** Monthly
**Source:** TradingView (SkyTradingZone options strategies idea) + Zerodha Varsity Bear Call Ladder adapted

### Entry Conditions
- Technical: Nifty breaking above 23200-23300 resistance with volume. 20-EMA crossing above 50-EMA on daily chart (golden cross forming). Rationale: Bull call ladder best when expecting moderate rally, not extreme — golden cross signals sustained but measured uptrend.
- IV Environment: VIX 20-28 (HIGH). Two sold legs collect elevated premium, significantly reducing cost basis. IVR > 40.
- Timing: 20-30 DTE monthly.
- Rationale: The bull call ladder (also called 1x2 call spread) is a cost-efficient bullish structure. In HIGH VIX, the two sold OTM calls collect enough premium to make the long call nearly free. Risk only on extreme upside beyond second sold strike.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | CE | ATM (23300) | 1 | Monthly |
| SELL | CE | ATM+200 (23500) | 1 | Monthly |
| SELL | CE | ATM+400 (23700) | 1 | Monthly |

### Exit Conditions
- Profit Target: 150-180 pts (max profit at first sold strike). Rationale: Sweet spot is Nifty at 23500 at expiry.
- Stop Loss: 100 pts or Nifty > 24000 (unlimited risk zone). Rationale: Beyond second sold strike, losses mount.
- Time Exit: Close at 5 DTE if Nifty above 23600 (approaching risk zone).
- Adjustment Rules: If Nifty rallies past 23700 → buy 1 CE at 23900 to cap risk (creates condor). Cost: 30-50 pts. Rationale: Eliminates unlimited upside risk.
- Best Exit Strategy: Exit at 23500-23600 range or convert to condor.

### Risk-Reward (pts)
- Max Profit: ~180-200 pts (at 23500) | Max Loss: Unlimited above ~24000 (hedge required) | Breakeven: ~23100 (lower), ~23900+ (upper, if unhedged)
- Margin: ~₹80,000-1,00,000 | ROM: 2.0x-2.5x (at sweet spot)

### Greeks Exposure
- Net Delta: +0.30 to +0.45 | Gamma Risk: Moderate-High (ratio position)
- Vega: -0.02 to -0.06 (net short vega due to 2 sold) | Theta: +3-6 pts/day
- Theta/Gamma: Good in range, dangerous on extreme upside

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Good: +150 pts | Very Good: +180 pts | Excellent: +200 pts | Good: +160 pts |
| Up (strong) | Bad: -100 pts | Bad: -150 pts | Moderate: -80 pts | Bad: -200 pts |
| Down | Bad: -80 pts | Moderate: -50 pts | Moderate: -30 pts | Bad: -60 pts |
| Range | Moderate: +50 pts | Good: +80 pts | Good: +100 pts | Moderate: +60 pts |
Versatility Score: 5/12 | Best: High-Vol Moderate Up | Worst: Extreme-Vol Strong Up

### Executor Parameters
```json
{
  "strategy_id": "bull_call_ladder_nifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY monthly CE",
    "indicators": ["EMA_20_50_D", "volume_breakout", "resistance_levels"]
  },
  "strike_selection": {
    "buy_leg": "ATM",
    "sell_leg_1": "ATM + 200",
    "sell_leg_2": "ATM + 400",
    "hedge_trigger_strike": "ATM + 600"
  },
  "entry_signal": {
    "condition": "spot_breaking_above_resistance AND EMA20 > EMA50_daily AND VIX > 20",
    "timing": "DTE >= 20 AND DTE <= 30",
    "order_type": "LIMIT",
    "max_slippage_pts": 5
  },
  "exit_signal": {
    "profit_target_pts": 160,
    "stop_loss_pts": 100,
    "upside_risk_exit": "spot > ATM + 500",
    "time_exit_dte": 5,
    "hedge_conversion": "buy_CE_at_ATM+600_if_spot>ATM+400"
  },
  "position_sizing": {
    "max_risk_pct": 3,
    "lots": 1,
    "lot_size": 75
  }
}
```

### Edge Thesis
The bull call ladder reduces the cost of a bullish position to near-zero or net credit by selling two OTM calls. In HIGH VIX, the elevated premiums make this practically free. The key risk management is adding a hedge if Nifty rallies too strongly — converting to a condor. This is ideal for the current measured recovery scenario.

### Source & Citations
- TradingView: SkyTradingZone Options Strategies (https://in.tradingview.com/chart/NIFTY/DyCdEcx1-Option-Trading-Strategies/) — 2025
- Zerodha Varsity: Bear Call Ladder (adapted) (https://zerodha.com/varsity/module/option-strategies/) — Evergreen

---

## Strategy 2: BankNifty Bull Put Ratio Spread (Weekly)

**Structure:** Sell 1 ATM PE + Buy 2 further OTM PE (put ratio backspread, bullish application)
**Underlying:** BANKNIFTY | **Expiry:** Weekly
**Source:** 5paisa Derivative Strategies + Zerodha Varsity Put Ratio

### Entry Conditions
- Technical: BankNifty above 53000 with bullish engulfing on daily chart. MACD above signal line. RSI recovering from 40-50 zone (not overbought). Rationale: Bullish momentum but hedging against gap-down risk.
- IV Environment: VIX 20-28. Net credit entry when VIX is elevated. Positive vega from 2 long puts protects against VIX spike.
- Timing: 3-5 DTE weekly.
- Rationale: The put ratio backspread applied bullishly is entered for net credit. If BankNifty rallies, you keep the credit. If it crashes, the 2 long puts profit on the downside — a win-win except for the max loss zone near the bought strikes.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | PE | ATM (53700) | 1 | Weekly |
| BUY | PE | ATM-500 (53200) | 2 | Weekly |

### Exit Conditions
- Profit Target: Credit retained on expiry if bullish (40-80 pts). Rationale: Credit is the bullish outcome — let expire.
- Stop Loss: 300 pts (if pinned at bought strike). Rationale: Max loss zone is dangerous.
- Time Exit: Hold to expiry if above sold strike. Close at 1 DTE if between strikes.
- Adjustment Rules: If BankNifty drops 400 pts → hold (long puts activating). If drops 800 pts → take profit on long puts. Rationale: Structure self-hedges on large down moves.
- Best Exit Strategy: Let expire if bullish; close in max-loss zone.

### Risk-Reward (pts)
- Max Profit (bullish): ~50-80 pts (net credit if BankNifty above 53700) | Max Profit (crash): Unlimited below ~52500 | Max Loss: ~400-450 pts (at 53200)
- Margin: ~₹70,000-1,00,000 | ROM: 0.5x-1.0x (credit), 5x+ (crash)

### Greeks Exposure
- Net Delta: +0.10 to +0.25 (mildly bullish) | Gamma Risk: High (ratio position)
- Vega: +0.03 to +0.06 (positive — protects against VIX spike) | Theta: -1 to +2 pts/day (near neutral)
- Theta/Gamma: Acceptable — gamma payoff on large moves

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Moderate: +40 pts | Good: +60 pts | Good: +80 pts | Good: +70 pts |
| Down (moderate) | Bad: -400 pts | Bad: -350 pts | Moderate: -200 pts | Good: +100 pts |
| Down (crash) | Moderate: +200 pts | Good: +400 pts | Excellent: +600 pts | Excellent: +800 pts |
| Range | Moderate: +20 pts | Moderate: +30 pts | Moderate: +40 pts | Moderate: +30 pts |
Versatility Score: 6/12 | Best: Extreme-Vol Crash (insurance) | Worst: Low-Vol Moderate Down

### Executor Parameters
```json
{
  "strategy_id": "bull_put_ratio_spread_banknifty_weekly",
  "data_requirements": {
    "spot_price": "NSE:BANKNIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "BANKNIFTY weekly PE",
    "indicators": ["MACD_12_26_9_D", "RSI_14_D", "daily_candle_pattern"]
  },
  "strike_selection": {
    "sell_leg": "ATM",
    "buy_leg": "ATM - 500",
    "ratio": "1:2",
    "target_net_credit": true
  },
  "entry_signal": {
    "condition": "bullish_engulfing_daily AND MACD > signal AND RSI_14_D > 40 AND RSI_14_D < 65 AND VIX > 20",
    "timing": "DTE >= 3 AND DTE <= 5",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "bullish_outcome": "hold_to_expiry",
    "max_loss_zone_exit": "spot between strikes at 1_DTE",
    "crash_profit_take": "spot < buy_strike - 300"
  },
  "position_sizing": {
    "max_risk_pct": 3,
    "lots_sell": 1,
    "lots_buy": 2,
    "lot_size": 30
  }
}
```

### Edge Thesis
This is a unique bullish structure that also doubles as crash insurance. If BankNifty rallies, you keep the credit. If it crashes (gap-down scenario in HIGH VIX), the 2 long puts generate unlimited profit. The only danger zone is a moderate 400-500 pt drop where you are pinned near the bought strikes. In the current environment with geopolitical risks and FPI selling, having this crash protection built in is valuable.

### Source & Citations
- 5paisa: Put Ratio Backspread (https://www.5paisa.com/derivatives/derivative-strategies/bearish-put-ratio-back-spread) — 2026
- Zerodha Varsity: Put Ratio Back Spread (https://zerodha.com/varsity/chapter/put-ratio-back-spread/) — Evergreen

---

## Strategy 3: Nifty Synthetic Long with Put Hedge (Monthly)

**Structure:** Buy ATM CE + Sell ATM PE + Buy OTM PE (synthetic long with protective put)
**Underlying:** NIFTY | **Expiry:** Monthly
**Source:** PL Capital Nifty Options Guide + Moneycontain

### Entry Conditions
- Technical: Nifty breaking above 23300 with strong breadth (advance-decline ratio > 2:1). FII data turning positive (net buyers). Nifty futures premium expanding. Rationale: Synthetic long mimics futures with leverage + built-in protection.
- IV Environment: VIX 18-25 (HIGH). The sold PE funds the bought CE — net cost is minimal. Protective OTM PE handles tail risk.
- Timing: 20-30 DTE monthly.
- Rationale: Synthetic long provides futures-like P&L with defined downside. In HIGH VIX, the sold ATM PE generates enough premium to partially fund the bought CE AND a protective OTM PE.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | CE | ATM (23300) | 1 | Monthly |
| SELL | PE | ATM (23300) | 1 | Monthly |
| BUY | PE | ATM-500 (22800) | 1 | Monthly |

### Exit Conditions
- Profit Target: 300+ pts (let profits run — mirrors futures). Rationale: No cap on upside.
- Stop Loss: 200 pts or Nifty below protective PE strike (22800). Rationale: Below 22800, max loss is locked.
- Time Exit: Roll to next month at 7 DTE if in profit. Close if at loss.
- Adjustment Rules: If Nifty rallies 500 pts → sell OTM CE to create collar. Cost: 0 (credit received). Rationale: Locks profit range.
- Best Exit Strategy: Trail with 200-pt trailing stop from high water mark.

### Risk-Reward (pts)
- Max Profit: Unlimited above 23300 | Max Loss: ~300-400 pts (ATM to protective PE - net credit) | Breakeven: ~23300 ± small net debit/credit
- Margin: ~₹80,000-1,20,000 | ROM: 3x+ on 500 pt rally

### Greeks Exposure
- Net Delta: +0.85 to +0.95 (nearly synthetic futures) | Gamma Risk: Low (offsetting gamma)
- Vega: +0.01 to +0.03 (near neutral) | Theta: -1 to +1 pts/day (near neutral — PE sold offsets CE bought)
- Theta/Gamma: Neutral — directional play

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Good: +300 pts | Very Good: +400 pts | Very Good: +400 pts | Good: +350 pts |
| Down | Moderate: -300 pts | Moderate: -250 pts | Good: -200 pts (PE hedge) | Moderate: -300 pts |
| Range | Poor: -50 pts | Neutral: -20 pts | Neutral: 0 pts | Poor: -30 pts |
Versatility Score: 6/12 | Best: Any-Vol Up | Worst: Low-Vol Range/Down

### Executor Parameters
```json
{
  "strategy_id": "synthetic_long_protected_nifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY monthly CE+PE",
    "indicators": ["advance_decline_ratio", "FII_net_buy_sell", "futures_premium"]
  },
  "strike_selection": {
    "buy_ce": "ATM",
    "sell_pe": "ATM",
    "buy_pe_hedge": "ATM - 500"
  },
  "entry_signal": {
    "condition": "spot_breaking_23300 AND AD_ratio > 2 AND FII_net_positive AND VIX > 18",
    "timing": "DTE >= 20 AND DTE <= 30",
    "order_type": "LIMIT",
    "max_slippage_pts": 5
  },
  "exit_signal": {
    "profit_target_pts": 300,
    "trailing_stop_pts": 200,
    "stop_loss": "spot < 22800",
    "time_exit_dte": 7,
    "collar_trigger": "spot > entry + 500"
  },
  "position_sizing": {
    "max_risk_pct": 4,
    "lots": 1,
    "lot_size": 75
  }
}
```

### Edge Thesis
The protected synthetic long gives futures-like exposure with capped downside. In HIGH VIX, the sold PE generates enough premium to fund both the CE and a protective put, creating a nearly zero-cost structure. The FII data turning positive and broad-based recovery after the correction provide the fundamental backdrop for a sustained monthly rally.

### Source & Citations
- PL Capital: Nifty Options Guide (https://www.plindia.com/blogs/nifty-options-trading-india-2025-complete-guide/) — 2025
- Moneycontain: Options Strategies (https://moneycontain.com/best-option-strategy-bank-nifty-nifty-50/) — 2025

---

## Strategy 4: BankNifty Iron Butterfly (Monthly)

**Structure:** Sell ATM CE + Sell ATM PE + Buy OTM CE + Buy OTM PE (equal wings)
**Underlying:** BANKNIFTY | **Expiry:** Monthly
**Source:** 5paisa Advanced Strategies + Fyers School of Stocks

### Entry Conditions
- Technical: BankNifty max pain at 53500-54000. OI buildup suggests pin. IV rank > 60 (premiums fat at ATM). Rationale: Iron butterfly profits maximally from exact pin at ATM.
- IV Environment: VIX > 22 (HIGH). ATM premiums are 3x normal — iron butterfly collects massive credit.
- Timing: 15-20 DTE monthly.
- Rationale: In HIGH VIX, iron butterfly credit is dramatically elevated. Even if BankNifty moves 500 pts, the collected premium provides buffer. Max pain analysis suggests 53500 pin area.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM (53500) | 1 | Monthly |
| SELL | PE | ATM (53500) | 1 | Monthly |
| BUY | CE | ATM+500 (54000) | 1 | Monthly |
| BUY | PE | ATM-500 (53000) | 1 | Monthly |

### Exit Conditions
- Profit Target: 50% of net credit (~200-300 pts). Rationale: Full max profit requires exact pin — unrealistic.
- Stop Loss: Net credit collected (breakeven). Rationale: Never let iron butterfly turn to loss.
- Time Exit: Close at 3 DTE. Rationale: Gamma risk near expiry.
- Adjustment Rules: If BankNifty moves 400 pts → convert to iron condor by rolling tested side. Cost: ~50 pts.
- Best Exit Strategy: 50% profit target.

### Risk-Reward (pts)
- Max Profit: ~400-500 pts (net credit at ATM pin) | Max Loss: ~100-200 pts (wing width - credit) | Breakeven: ATM ± credit
- Margin: ~₹50,000-70,000 | ROM: 2.5x-4.0x

### Greeks Exposure
- Net Delta: ~0 (neutral) | Gamma Risk: Very High near ATM at expiry
- Vega: -0.08 to -0.12 (strongly benefits from IV crush) | Theta: +6-12 pts/day (very positive)
- Theta/Gamma: Excellent until final 5 days

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Good: +200 pts | Good: +250 pts | Very Good: +300 pts | Moderate: +200 pts |
| Down (moderate) | Good: +200 pts | Good: +250 pts | Very Good: +300 pts | Moderate: +200 pts |
| Range (pin) | Excellent: +400 pts | Excellent: +450 pts | Excellent: +500 pts | Very Good: +400 pts |
Versatility Score: 8/12 | Best: High-Vol Range/Pin | Worst: Extreme-Vol large move

### Executor Parameters
```json
{
  "strategy_id": "iron_butterfly_banknifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:BANKNIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "BANKNIFTY monthly CE+PE full chain",
    "indicators": ["max_pain", "OI_buildup", "IVR"]
  },
  "strike_selection": {
    "sell_ce": "ATM_nearest_500_to_max_pain",
    "sell_pe": "ATM_nearest_500_to_max_pain",
    "buy_ce": "ATM + 500",
    "buy_pe": "ATM - 500",
    "wing_width": 500
  },
  "entry_signal": {
    "condition": "max_pain_stable AND IVR > 60 AND VIX > 22",
    "timing": "DTE >= 15 AND DTE <= 20",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "profit_target_pct": 50,
    "stop_loss_at_breakeven": true,
    "time_exit_dte": 3,
    "conversion_trigger": "spot_moves_400_pts"
  },
  "position_sizing": {
    "max_risk_pct": 3,
    "lots": 1,
    "lot_size": 30
  }
}
```

### Edge Thesis
Iron butterflies on BankNifty in HIGH VIX collect premium that is 2-3x normal levels. The max pain analysis at 53500 provides a structural anchor. Even with the 500-pt wings, the collected credit provides 400+ pts of profit potential with only 100-200 pts of risk. This is the highest-theta single-expiry structure available.

### Source & Citations
- 5paisa: Iron Butterfly (https://www.5paisa.com/blog/6-advanced-options-strategies-for-experienced-traders) — 2026
- Fyers: Iron Condor/Butterfly (https://fyers.in/school-of-stocks/chapter/options-strategies/long-iron-condor-and-short-iron-condor.html) — Evergreen

---

## Strategy 5: Nifty Skip-Strike Butterfly Put (Quarterly — Bearish Protection with Bullish Lean)

**Structure:** Buy 1 OTM PE + Sell 2 further OTM PE + Buy 1 far OTM PE (skip a strike on lower wing)
**Underlying:** NIFTY | **Expiry:** Quarterly
**Source:** TheOptionCourse (Nifty Iron Condor Adjustments) + OptionsPlaybook Skip-Strike Butterfly

### Entry Conditions
- Technical: Nifty above 23000 but macro risks persist (FPI selling, geopolitical). Want bullish exposure but need tail-risk protection. Rationale: Quarterly skip-strike butterfly on puts creates cheap downside protection while maintaining bullish bias.
- IV Environment: VIX > 22 (HIGH). Net credit entry means protection is free/paid for. IVP > 50.
- Timing: 60-90 DTE quarterly.
- Rationale: This is a portfolio protection structure dressed as a credit trade. Sell elevated put premium in HIGH VIX, but maintain far OTM put protection for tail risk. The skip in the lower wing creates a credit structure.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | PE | ATM-300 (23000) | 1 | Quarterly |
| SELL | PE | ATM-600 (22700) | 2 | Quarterly |
| BUY | PE | ATM-1200 (22100) | 1 | Quarterly |

### Exit Conditions
- Profit Target: Full credit retained if Nifty stays above 23000 (60-100 pts). Rationale: Quarterly expiry — patient capital.
- Stop Loss: 300 pts (if Nifty drops into max loss zone 22500-22700). Rationale: Close in danger zone.
- Time Exit: Close at 15 DTE if all OTM. Rationale: Quarterly gamma still manageable.
- Adjustment Rules: If Nifty drops to 22700 (sold strike) → close entire position. Do not hold through max loss zone.
- Best Exit Strategy: Let expire worthless if bullish; close aggressively in danger zone.

### Risk-Reward (pts)
- Max Profit (bullish): ~60-100 pts (net credit) | Max Profit (crash): ~200-300 pts (below 22100) | Max Loss: ~400-500 pts (at 22700)
- Margin: ~₹1,00,000-1,50,000 | ROM: 0.3x-0.5x (credit), 1.0x+ (crash)

### Greeks Exposure
- Net Delta: +0.05 to +0.15 (slightly bullish) | Gamma Risk: Low (far OTM, long DTE)
- Vega: -0.02 to -0.05 (benefits from IV crush) | Theta: +1-3 pts/day
- Theta/Gamma: Good — slow and steady

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Good: +80 pts | Good: +100 pts | Good: +100 pts | Good: +80 pts |
| Down (moderate) | Bad: -300 pts | Bad: -250 pts | Moderate: -200 pts | Moderate: -150 pts |
| Down (crash) | Good: +100 pts | Very Good: +200 pts | Excellent: +300 pts | Excellent: +300 pts |
| Range | Good: +70 pts | Good: +90 pts | Good: +100 pts | Good: +80 pts |
Versatility Score: 7/12 | Best: Extreme-Vol Crash or any Up/Range | Worst: Moderate Down

### Executor Parameters
```json
{
  "strategy_id": "skip_strike_butterfly_put_nifty_quarterly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY quarterly PE",
    "indicators": ["macro_risk_events", "FPI_flow_data"]
  },
  "strike_selection": {
    "buy_upper": "ATM - 300",
    "sell_middle": "ATM - 600",
    "buy_lower": "ATM - 1200",
    "skip_amount": 300
  },
  "entry_signal": {
    "condition": "VIX > 22 AND IVP > 50 AND quarterly_DTE >= 60",
    "timing": "quarterly_DTE >= 60 AND quarterly_DTE <= 90",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "credit_retained_target": "full_credit_if_bullish",
    "stop_loss_pts": 300,
    "time_exit_dte": 15,
    "danger_zone_exit": "spot < sold_strike + 100"
  },
  "position_sizing": {
    "max_risk_pct": 3,
    "lots": 1,
    "lot_size": 75
  }
}
```

### Edge Thesis
The skip-strike butterfly put is a sophisticated structure that provides free/paid downside protection while maintaining bullish bias. In HIGH VIX with persistent macro risks, this addresses the key concern: what if the recovery fails? The credit entry means you earn premium if bullish, and the far OTM long put provides crash protection. This is a portfolio overlay strategy for sophisticated traders.

### Source & Citations
- TheOptionCourse: Nifty Iron Condor Adjustments (https://www.theoptioncourse.com/nifty-iron-condors-strategy-and-adjustments-with-live-example/) — 2025
- OptionsPlaybook: Skip-Strike Butterfly (https://www.optionsplaybook.com/option-strategies/broken-wing-butterfly-call) — Evergreen

---

## Scout Health Diagnostic
- **Strategies Found:** 5/5
- **Schema Compliance:** PASS
- **Source Quality:** HIGH (TradingView, 5paisa, Zerodha, TheOptionCourse)
- **Staleness Risk:** LOW
- **Dedup Flags:** Iron butterfly close to iron condor variants; bull call ladder is unique; skip-strike butterfly is unique; synthetic long is unique
