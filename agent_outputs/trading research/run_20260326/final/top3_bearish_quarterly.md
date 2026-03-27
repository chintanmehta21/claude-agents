# TOP 3 BEARISH QUARTERLY STRATEGIES
**Run ID:** run_20260326 | **Date:** 2026-03-26 | **IV Regime:** HIGH (VIX 24.64)
**Nifty:** 23306 | **BankNifty:** 53708

---

## #1 — Bearish Double Diagonal on Nifty (Quarterly/Monthly)
**Confidence Score:** 89/110 [Rubric v2.1]
**Bias:** BEARISH | **Expiry:** QUARTERLY
**Underlying:** NIFTY | **Structure:** Double Diagonal Spread (Bearish Positioned)

### Entry Conditions
- Technical: Nifty in downward channel 21500-24000. Price near mid-channel. Expect continued range with bearish lean.
- IV Environment: VIX > 22. Monthly IV > quarterly IV (backwardation). Both IVR > 50.
- Timing: Quarterly 60-90 DTE (long), Monthly 20-30 DTE (short).
- Rationale Summary: Bearish positioning through asymmetric strikes (PE closer to ATM at -100, CE further at +500). Multi-regime champion profitable in 9/12 regime combos. Theta engine with positive vega.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | PE | 23200 | 1 | Quarterly |
| SELL | PE | 23200 | 1 | Monthly |
| BUY | CE | 23800 | 1 | Quarterly |
| SELL | CE | 23800 | 1 | Monthly |

### Exit Conditions
- Profit Target: 250 pts (after monthly expiry — quarterly legs retain value)
- Stop Loss: 150 pts (if large breakout)
- Time Exit: Close all at monthly expiry. Reassess for next cycle.
- Adjustment: Re-center monthly sold legs if Nifty moves 500+ pts.
- Best Exit Strategy: Monthly expiry capture, then evaluate quarterly legs.

### Risk-Reward (pts)
- Max Profit: ~350 pts | Max Loss: ~180 pts | Breakeven: Between 23200-23800 ± debit
- Margin: ~₹95,000 | ROM: 1.9x

### Greeks Exposure
- Net Delta: -0.10 (slightly bearish from PE closer placement)
- Gamma: Very Low (different expiries) | Vega: +0.06 (positive — profits from VIX staying high)
- Theta: +6 pts/day (from monthly decay) | Theta/Gamma: Excellent

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (mod) | Moderate: +50 | Good: +100 | Good: +150 | Moderate: +80 |
| Down (mod) | Good: +150 | Very Good: +250 | Excellent: +300 | Good: +200 |
| Range | Very Good: +250 | Excellent: +350 | Excellent: +400 | Very Good: +300 |
**Versatility Score: 9/12** — HIGHEST AMONG BEARISH STRATEGIES

### Executor Parameters
```json
{
  "strategy_id": "bearish_double_diagonal_nifty_quarterly_monthly",
  "data_requirements": {"spot_price": "NSE:NIFTY", "vix": "NSE:INDIAVIX", "option_chain": "NIFTY quarterly+monthly CE+PE", "indicators": ["IV_term_structure", "channel_boundaries"]},
  "strike_selection": {"pe_strike": "ATM-100", "ce_strike": "ATM+500", "same_strike_both_expiries": true},
  "entry_signal": {"condition": "monthly_IV > quarterly_IV AND VIX > 22 AND channel_intact", "timing": "monthly_DTE >= 20 AND quarterly_DTE >= 60"},
  "exit_signal": {"profit_target_pts": 250, "stop_loss_pts": 150, "time_exit": "monthly_expiry"},
  "position_sizing": {"max_risk_pct": 3, "lots": 1, "lot_size": 75}
}
```

### Edge Thesis
The bearish double diagonal is the ultimate multi-regime strategy for bearish portfolios. By selling overpriced monthly options against cheaper quarterly options on both sides, it creates a theta engine that profits regardless of moderate directional moves. The bearish tilt (PE closer, CE further) ensures the structure benefits most from the expected decline or consolidation. Positive vega means it profits even if VIX stays high — a key advantage over strategies that need VIX to drop.

### Lead Commentary
Ranked #1 with 89/110 — the highest score among all bearish strategies. The 9/12 regime versatility is unmatched. Compared to #2 (bearish IC), it has positive vega (benefits from VIX staying high) vs negative vega. Compared to #3 (bearish strangle), it requires less margin and has less tail risk. The only weakness is complexity (4 legs, 2 expiries, rolling).

---

## #2 — Bearish-Skewed Iron Condor on Nifty (Quarterly)
**Confidence Score:** 87/110 [Rubric v2.1]
**Bias:** BEARISH | **Expiry:** QUARTERLY
**Underlying:** NIFTY | **Structure:** Asymmetric Iron Condor

### Entry Conditions
- Technical: Nifty quarterly downtrend channel. Price near upper channel. FPI selling. Global uncertainty.
- IV Environment: VIX > 22. Quarterly premium maximized. VIX mean reversion expected.
- Timing: 60-90 DTE.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | 23600 (ATM+300) | 1 | Quarterly |
| BUY | CE | 23800 (ATM+500) | 1 | Quarterly |
| SELL | PE | 22500 (ATM-800) | 1 | Quarterly |
| BUY | PE | 21800 (ATM-1500) | 1 | Quarterly |

### Exit Conditions
- Profit Target: 330 pts (60% of ~550 pts credit) | Stop Loss: 500 pts | Time Exit: 20 DTE
- Best Exit: VIX below 16.

### Risk-Reward (pts)
- Max Profit: ~550 pts | Max Loss: ~150 pts (CE side) or ~150 pts (PE side) | Breakeven: 22050 / 24150
- Margin: ~₹1,75,000 | ROM: 0.31x

### Regime Performance Matrix
Versatility Score: 8/12

### Executor Parameters
```json
{
  "strategy_id": "bearish_iron_condor_nifty_quarterly",
  "data_requirements": {"spot_price": "NSE:NIFTY", "option_chain": "NIFTY quarterly CE+PE", "indicators": ["quarterly_channel", "FPI_flow"]},
  "strike_selection": {"sell_ce": "ATM+300", "buy_ce": "ATM+500", "sell_pe": "ATM-800", "buy_pe": "ATM-1500"},
  "entry_signal": {"condition": "spot_near_upper_channel AND FPI_sellers AND VIX > 22", "timing": "quarterly_DTE >= 60"},
  "exit_signal": {"profit_target_pct": 60, "stop_loss_pts": 500, "vix_exit_below": 16},
  "position_sizing": {"max_risk_pct": 5, "lots": 1, "lot_size": 75}
}
```

### Lead Commentary
Ranked #2 for the 550 pts credit potential and VIX mean reversion thesis. The tight call spread (200 pts wide, 300 OTM) is the bearish edge — it collects more premium from the side that is most likely to expire worthless. Loses to #1 on versatility (8/12 vs 9/12) and needs VIX to drop (negative vega).

---

## #3 — Bearish Short Strangle on BankNifty (Quarterly Hedged)
**Confidence Score:** 85/110 [Rubric v2.1]
**Bias:** BEARISH | **Expiry:** QUARTERLY
**Underlying:** BANKNIFTY | **Structure:** Bearish-Tilted Hedged Strangle

### Entry Conditions
- Technical: BankNifty near upper quarterly range. CE closer (500 OTM), PE further (2000 OTM).
- IV Environment: VIX > 22. Quarterly premium maximized.
- Timing: 60-90 DTE.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | 54200 (ATM+500) | 1 | Quarterly |
| SELL | PE | 51700 (ATM-2000) | 1 | Quarterly |
| BUY | CE | 55200 (ATM+1500) | 1 | Quarterly |
| BUY | PE | 50700 (ATM-3000) | 1 | Quarterly |

### Exit Conditions
- Profit Target: 385 pts (55% of ~700 pts credit) | Stop Loss: 600 pts | Time Exit: 20 DTE

### Risk-Reward (pts)
- Max Profit: ~700 pts | Max Loss: ~300 pts per side | Breakeven: 51000 / 54900
- Margin: ~₹2,25,000 | ROM: 0.31x

### Regime Performance Matrix
Versatility Score: 9/12

### Executor Parameters
```json
{
  "strategy_id": "bearish_short_strangle_banknifty_quarterly",
  "data_requirements": {"spot_price": "NSE:BANKNIFTY", "option_chain": "BANKNIFTY quarterly CE+PE", "indicators": ["quarterly_range", "VIX_mean"]},
  "strike_selection": {"sell_ce": "ATM+500", "buy_ce": "ATM+1500", "sell_pe": "ATM-2000", "buy_pe": "ATM-3000"},
  "entry_signal": {"condition": "spot_near_upper_range AND VIX > 22", "timing": "quarterly_DTE >= 60"},
  "exit_signal": {"profit_target_pct": 55, "stop_loss_pts": 600, "vix_exit_below": 16},
  "position_sizing": {"max_risk_pct": 5, "lots": 1, "lot_size": 30}
}
```

### Lead Commentary
Ranked #3 for the highest absolute credit potential (700 pts) and excellent versatility (9/12). BankNifty-specific application allows for wider ranges due to higher absolute volatility. However, the large margin requirement (₹2.25L) and BankNifty's propensity for gap moves creates elevated tail risk. The bearish tilt (tight CE, wide PE) is well-suited for the current macro environment.
