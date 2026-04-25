# TOP 3 BULLISH MONTHLY STRATEGIES
**Run ID:** run_20260326 | **Date:** 2026-03-26 | **IV Regime:** HIGH (VIX 24.64)
**Nifty:** 23306 | **BankNifty:** 53708

---

## #1 — Iron Butterfly on BankNifty
**Confidence Score:** 88/110 [Rubric v2.1]
**Bias:** BULLISH | **Expiry:** MONTHLY
**Underlying:** BANKNIFTY | **Structure:** Iron Butterfly

### Entry Conditions
- Technical: BankNifty max pain near 53500. OI buildup at 53000 PE and 54000 CE. ATR declining (consolidation). Rationale: Pin zone identified through OI and max pain convergence.
- IV Environment: VIX > 22. IVR > 60. ATM premiums 2-3x normal in HIGH VIX — massive credit collection.
- Timing: 15-20 DTE monthly.
- Rationale Summary: Iron butterfly at 53500 center collects 400-500 pts credit in HIGH VIX with only 50-100 pts max loss. The 4:1+ R:R is exceptional.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | 53500 (ATM) | 1 | Monthly |
| SELL | PE | 53500 (ATM) | 1 | Monthly |
| BUY | CE | 54000 (ATM+500) | 1 | Monthly |
| BUY | PE | 53000 (ATM-500) | 1 | Monthly |

### Exit Conditions
- Profit Target: 230 pts (50% of ~460 pts credit). Rationale: Full max profit requires exact pin — unrealistic.
- Stop Loss: At breakeven (net credit). Rationale: Never let iron butterfly turn to loss.
- Time Exit: Close at 3 DTE. Rationale: Gamma risk explosion.
- Adjustment Rules: If BNF moves 400+ pts → convert to iron condor by rolling tested side out. Cost: ~50 pts.
- Best Exit Strategy: 50% profit target limit order.

### Risk-Reward (pts)
- Max Profit: ~460 pts (at 53500 pin) | Max Loss: ~40 pts (wing - credit) | Breakeven: 53040 / 53960
- Margin: ~₹55,000 | ROM: 8.4x (theoretical max)

### Greeks Exposure
- Net Delta: ~0 (neutral) | Gamma Risk: Very High near ATM at expiry
- Vega: -0.10 (strongly benefits from IV crush) | Theta: +9 pts/day (extremely positive)
- Theta/Gamma: Excellent until final 5 days

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Good: +200 | Good: +250 | Very Good: +300 | Moderate: +200 |
| Down (moderate) | Good: +200 | Good: +250 | Very Good: +300 | Moderate: +200 |
| Range (pin) | Excellent: +400 | Excellent: +450 | Excellent: +500 | Very Good: +400 |
Versatility Score: 8/12 | Best: High-Vol Range/Pin | Worst: Extreme-Vol Large Move

### Executor Parameters
```json
{
  "strategy_id": "iron_butterfly_banknifty_monthly",
  "data_requirements": {"spot_price": "NSE:BANKNIFTY", "vix": "NSE:INDIAVIX", "option_chain": "BANKNIFTY monthly CE+PE", "indicators": ["max_pain", "OI_buildup", "IVR"]},
  "strike_selection": {"sell_ce": "ATM_nearest_500_to_max_pain", "sell_pe": "same", "buy_ce": "ATM+500", "buy_pe": "ATM-500", "wing_width": 500},
  "entry_signal": {"condition": "max_pain_stable AND IVR > 60 AND VIX > 22", "timing": "DTE >= 15 AND DTE <= 20"},
  "exit_signal": {"profit_target_pct": 50, "stop_loss_at_breakeven": true, "time_exit_dte": 3},
  "position_sizing": {"max_risk_pct": 3, "lots": 1, "lot_size": 30}
}
```

### Edge Thesis
Iron butterfly in HIGH VIX collects credit equal to ~92% of wing width, creating the most favorable R:R of any monthly strategy. The max pain pin at 53500 provides structural support for the center strike. IV crush over 15-20 days drives rapid profitability.

### Lead Commentary
Ranked #1 for the exceptional R:R ratio (8.4x theoretical, 4.2x practical at 50% target) and highest theta income (+9 pts/day). The 50% profit target at 230 pts represents a realistic, achievable return. Compared to #2 (BWB), it has higher absolute profit potential. Compared to #3 (bull put spread), it profits in both up AND down moderately. The main risk is the 3-DTE exit requirement — gamma near expiry is extreme.

---

## #2 — Broken Wing Butterfly (Call) on Nifty
**Confidence Score:** 86/110 [Rubric v2.1]
**Bias:** BULLISH | **Expiry:** MONTHLY
**Underlying:** NIFTY | **Structure:** Broken Wing Call Butterfly

### Entry Conditions
- Technical: Nifty in range 22800-23500. Bollinger Bands narrowing. ATR declining. Rationale: BWB profits from range.
- IV Environment: VIX > 20. IVR > 50. Net credit entry.
- Timing: 15-20 DTE monthly.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | CE | 23300 (ATM) | 1 | Monthly |
| SELL | CE | 23500 (ATM+200) | 2 | Monthly |
| BUY | CE | 23800 (ATM+500) | 1 | Monthly |

### Exit Conditions
- Profit Target: 110 pts (50% of max ~220 pts) | Stop Loss: 80 pts | Time Exit: 3 DTE

### Risk-Reward (pts)
- Max Profit: ~220 pts | Max Loss: ~80 pts (extreme upside beyond 23800) | Downside: credit retained (~30 pts)
- Margin: ~₹55,000 | ROM: 2.0x

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Good: +120 | Very Good: +150 | Very Good: +160 | Good: +130 |
| Down | Neutral: -30 | Neutral: -20 | Good: +10 (credit) | Poor: -50 |
| Range | Very Good: +140 | Excellent: +170 | Excellent: +180 | Good: +140 |
Versatility Score: 8/12

### Executor Parameters
```json
{
  "strategy_id": "broken_wing_butterfly_call_nifty_monthly",
  "data_requirements": {"spot_price": "NSE:NIFTY", "vix": "NSE:INDIAVIX", "option_chain": "NIFTY monthly CE", "indicators": ["BB_20_2_D", "ATR_14_D"]},
  "strike_selection": {"buy_lower": "ATM", "sell_middle": "ATM+200", "buy_upper": "ATM+500"},
  "entry_signal": {"condition": "ATR_declining AND BB_narrowing AND VIX > 20 AND IVR > 50", "timing": "DTE >= 15 AND DTE <= 22"},
  "exit_signal": {"profit_target_pct_of_max": 50, "stop_loss_pts": 80, "time_exit_dte": 3},
  "position_sizing": {"max_risk_pct": 2, "lots": 1, "lot_size": 75}
}
```

### Lead Commentary
Ranked #2 for the unique zero-downside-risk profile (credit retained if Nifty declines). The 8/12 versatility ties with #1 but the absolute profit potential is lower. The BWB is the safest monthly bullish structure — you cannot lose money on the downside, which is rare and valuable in uncertain markets.

---

## #3 — Bull Put Spread on Nifty (Monthly)
**Confidence Score:** 84/110 [Rubric v2.1]
**Bias:** BULLISH | **Expiry:** MONTHLY
**Underlying:** NIFTY | **Structure:** Bull Put Spread

### Entry Conditions
- Technical: Nifty above 23000. Daily close above 10-EMA. MACD histogram positive. 22800 support validated 2+ times.
- IV Environment: VIX > 20. IVR > 45. Credit strategy optimal.
- Timing: 20-30 DTE.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | PE | 23100 (ATM-200) | 1 | Monthly |
| BUY | PE | 22800 (ATM-500) | 1 | Monthly |

### Exit Conditions
- Profit Target: 200 pts (65% of ~310 pts credit) | Stop Loss: 300 pts | Time Exit: 7 DTE

### Risk-Reward (pts)
- Max Profit: ~310 pts (credit) | Max Loss: ~0 pts (credit nearly = spread width) | Breakeven: 22790
- Margin: ~₹55,000 | ROM: 5.6x (theoretical, due to near-zero max loss)

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Good: +280 | Very Good: +320 | Excellent: +340 | Good: +280 |
| Down | Bad: -200 | Bad: -150 | Moderate: -100 | Very Bad: -300 |
| Range | Good: +250 | Very Good: +300 | Very Good: +320 | Good: +260 |
Versatility Score: 7/12

### Executor Parameters
```json
{
  "strategy_id": "bull_put_spread_nifty_monthly",
  "data_requirements": {"spot_price": "NSE:NIFTY", "vix": "NSE:INDIAVIX", "option_chain": "NIFTY monthly PE", "indicators": ["EMA_10_D", "MACD_12_26_9_D"]},
  "strike_selection": {"sell_leg": "ATM-200", "buy_leg": "ATM-500", "spread_width": 300},
  "entry_signal": {"condition": "spot > EMA_10_D AND MACD_hist_positive AND VIX > 20", "timing": "DTE >= 20 AND DTE <= 30"},
  "exit_signal": {"profit_target_pct": 65, "stop_loss_pts": 300, "time_exit_dte": 7},
  "position_sizing": {"max_risk_pct": 2, "lots": 1, "lot_size": 75}
}
```

### Lead Commentary
Ranked #3 for the near-zero max loss scenario — in HIGH VIX, the credit collected (310 pts) nearly equals the spread width (300 pts), creating an extraordinary risk-reward. However, it lacks the multi-directional profitability of #1 and the downside credit retention of #2. It is the simplest and highest probability of the three.
