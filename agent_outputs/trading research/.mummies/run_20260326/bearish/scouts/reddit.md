# Bearish Scout: Reddit/Community Output
**Scout ID:** bearish-reddit-01
**Timestamp:** 2026-03-26
**Sources:** IndianStreetBets, Traderji.com, Quora, 5paisa community
**Market Context:** Nifty 23306 | BankNifty 53708 | VIX 24.64 (HIGH regime)

---

## Strategy 1: Short Straddle with Bearish Bias on Nifty (Weekly)

**Structure:** Sell ATM CE + Sell ATM PE, with plan to close CE leg on breakdown
**Underlying:** NIFTY | **Expiry:** Weekly
**Source:** Traderji.com (Premium Eating thread) + 5paisa Short Straddle Guide

### Entry Conditions
- Technical: Nifty at resistance zone 23300-23500 with declining volume on up-moves. OI data shows massive CE writing at 23500 (resistance confirmation). PCR < 0.8 (bearish). Rationale: OI-confirmed resistance makes short straddle viable — Nifty unlikely to break much higher.
- IV Environment: VIX > 24 (HIGH/EXTREME border). ATM premiums are 2-3x normal. Short straddle at peak VIX captures maximum premium. IVR > 70.
- Timing: 3-5 DTE weekly.
- Rationale: The ISB community frequently discusses selling at peak VIX. Short straddle at VIX 24+ collects 200+ pts premium. The bearish twist: if Nifty breaks down, close the PE leg to remove downside risk while letting the CE profit from the decline.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM (23300) | 1 | Weekly |
| SELL | PE | ATM (23300) | 1 | Weekly |

### Exit Conditions
- Profit Target: 60% of collected premium (~120-150 pts). Rationale: Don't hold to expiry — gamma risk.
- Stop Loss: 150 pts loss on either leg individually. Rationale: Limit directional exposure.
- Time Exit: Close Monday EOD before Tuesday expiry.
- Adjustment Rules: If Nifty drops 200 pts → close PE leg (lock PE profit, let CE run). If Nifty rallies 200 pts → close CE leg (lock CE profit, manage PE). Cost: nil — you're closing a profitable leg.
- Best Exit Strategy: 60% profit target or leg-out on directional move.

### Risk-Reward (pts)
- Max Profit: ~200-250 pts (full premium if pinned) | Max Loss: Unlimited (unhedged) — managed by leg-out | Breakeven: ATM ± combined premium
- Margin: ~₹1,00,000-1,50,000 | ROM: 1.5x-2.0x

### Greeks Exposure
- Net Delta: ~0 initially | Gamma Risk: Very High (naked short ATM)
- Vega: -0.10 to -0.15 (strongly benefits from IV crush) | Theta: +8-15 pts/day (very positive)
- Theta/Gamma: High theta but high gamma risk — needs active management

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Good: +150 pts | Very Good: +200 pts | Excellent: +250 pts | Very Good: +200 pts |
| Down (moderate) | Good: +150 pts | Very Good: +200 pts | Excellent: +250 pts | Very Good: +200 pts |
| Range | Excellent: +200 pts | Excellent: +250 pts | Excellent: +250 pts | Very Good: +220 pts |
| Strong move | Very Bad: -300 pts | Bad: -200 pts | Moderate: -100 pts | Bad: -200 pts |
Versatility Score: 7/12 | Best: High-Vol Range | Worst: Low-Vol Strong Move

### Executor Parameters
```json
{
  "strategy_id": "short_straddle_bearish_bias_nifty_weekly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY weekly CE+PE ATM",
    "indicators": ["OI_CE_writing_23500", "PCR", "volume_decline"]
  },
  "strike_selection": {
    "ce_leg": "ATM_nearest_50",
    "pe_leg": "ATM_nearest_50"
  },
  "entry_signal": {
    "condition": "VIX > 24 AND IVR > 70 AND OI_CE_heavy_at_resistance AND PCR < 0.8",
    "timing": "DTE >= 3 AND DTE <= 5",
    "order_type": "LIMIT",
    "max_slippage_pts": 5
  },
  "exit_signal": {
    "profit_target_pct": 60,
    "per_leg_stop_loss_pts": 150,
    "leg_out_trigger": "200_pt_directional_move",
    "time_exit": "expiry_day_minus_1_EOD"
  },
  "position_sizing": { "max_risk_pct": 4, "lots": 1, "lot_size": 75 }
}
```

### Edge Thesis
Short straddles at VIX 24+ capture extreme premium that rarely decays to zero loss. The bearish bias conversion (closing PE on breakdown) converts a neutral structure to a pure bearish credit play. OI data confirming resistance at 23500 provides high-confidence resistance for the CE leg.

### Source & Citations
- Traderji: Premium Eating Strategy (https://www.traderji.com/community/threads/premium-eating-strategy-banknifty-weekly-options.106647/) — Forum
- 5paisa: Straddle/Strangle High VIX (https://www.5paisa.com/blog/straddle-and-strangle-strategies-when-india-vix-is-high) — 2026

---

## Strategy 2: BankNifty Momentum Put Buy on Resistance Rejection (Weekly)

**Structure:** Naked ATM+1 PE on momentum breakdown
**Underlying:** BANKNIFTY | **Expiry:** Weekly
**Source:** Traderji (MK Nifty Options System) + ISB community

### Entry Conditions
- Technical: BankNifty rejects at 54500-55000 resistance with 5-min close below VWAP. Volume spike on breakdown candle (> 2x avg). SuperTrend(10,3) flips bearish on 15-min. Rationale: Mirror of bullish momentum buy — applied to breakdown.
- IV Environment: VIX > 20. Premiums expensive but intraday scalp negates theta concern.
- Timing: 1-3 DTE weekly. Intraday only (enter 10:15 AM, exit by 3:00 PM).
- Rationale: BankNifty 800+ pt daily ranges in HIGH VIX create intraday put buying opportunities on breakdown. Strict discipline on stops and timing.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | PE | ATM+100 (1 strike OTM) | 1 | Weekly |

### Exit Conditions
- Profit Target: 150-200 pts. Rationale: Quick scalp.
- Stop Loss: 60 pts (30% premium). Rationale: Discipline.
- Time Exit: Close by 2:30 PM.
- Adjustment Rules: If 300 pts profit → sell further OTM PE to lock gains. Rationale: Convert to spread.
- Best Exit Strategy: Trail to breakeven at +100 pts.

### Risk-Reward (pts)
- Max Profit: 300+ pts | Max Loss: ~60-80 pts | Breakeven: Strike - premium
- Margin: ~₹30,000-50,000 | ROM: 2.5x-5.0x

### Greeks Exposure
- Net Delta: -0.40 to -0.55 | Gamma: Very High | Vega: +0.04 to +0.06
- Theta: -10 to -20 pts/day (intraday irrelevant) | Theta/Gamma: Pure gamma

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Very Bad: -80 pts | Very Bad: -80 pts | Very Bad: -80 pts | Very Bad: -80 pts |
| Down | Moderate: +100 pts | Good: +200 pts | Very Good: +300 pts | Excellent: +400 pts |
| Range | Bad: -50 pts | Bad: -40 pts | Moderate: -30 pts | Moderate: -20 pts |
Versatility Score: 4/12 | Best: Extreme-Vol Down | Worst: Any Up

### Executor Parameters
```json
{
  "strategy_id": "banknifty_momentum_put_buy_weekly",
  "data_requirements": {
    "spot_price": "NSE:BANKNIFTY",
    "option_chain": "BANKNIFTY weekly PE near ATM",
    "indicators": ["VWAP_5MIN", "SuperTrend_10_3_15MIN", "volume_ratio_5MIN"]
  },
  "strike_selection": { "buy_leg": "ATM + 100", "premium_cap_pts": 250 },
  "entry_signal": {
    "condition": "spot < VWAP AND SuperTrend_bearish_15MIN AND volume > 2x_avg AND spot < 55000",
    "timing": "time >= 10:15 AND time <= 12:00",
    "order_type": "MARKET",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "profit_target_pts": 150,
    "stop_loss_pts": 60,
    "time_exit": "14:30",
    "trailing_stop_trigger_pts": 100
  },
  "position_sizing": { "max_risk_pct": 2, "lots": 1, "lot_size": 30 }
}
```

### Edge Thesis
BankNifty intraday put buying on resistance rejection mirrors the bullish momentum approach. In HIGH VIX, daily ranges create 200-400 pt opportunities on breakdown. VWAP + SuperTrend filter ensures entry only on confirmed momentum.

### Source & Citations
- Traderji: MK Nifty Options System (https://www.traderji.com/community/threads/mk-nifty-options-trading-system-for-day-trading.72865/) — Forum
- ISB community discussions — Ongoing

---

## Strategy 3: Nifty Bearish Calendar Put Spread (Monthly over Weekly)

**Structure:** Buy monthly PE + Sell weekly PE at same strike
**Underlying:** NIFTY | **Expiry:** Monthly (long) / Weekly (short)
**Source:** TalkOptions.in + 5paisa Calendar Spreads

### Entry Conditions
- Technical: Nifty in downtrend channel. Expected to decline but slowly. Support at 22500-23000 may cause choppy decline. Rationale: Calendar profits from range — bearish calendar captures theta while maintaining downside exposure.
- IV Environment: VIX > 22. Weekly IV > monthly IV (backwardation). Front-month PE overpriced.
- Timing: Monthly 20-30 DTE (bought), Weekly 3-5 DTE (sold).
- Rationale: Selling overpriced weekly puts against cheaper monthly puts captures the term structure differential. The monthly PE maintains bearish exposure through the decline cycle.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| BUY | PE | ATM-100 (23200) | 1 | Monthly |
| SELL | PE | ATM-100 (23200) | 1 | Weekly |

### Exit Conditions
- Profit Target: 100-150 pts per weekly cycle (roll weekly PE each week). Rationale: Theta differential harvest.
- Stop Loss: 200 pts net. Rationale: If Nifty crashes through strike, calendar collapses.
- Time Exit: Close at 10 DTE monthly.
- Adjustment Rules: If Nifty drops 300 pts → re-center at new ATM-100. Cost: ~40 pts.
- Best Exit Strategy: 3-4 weekly rolls then close.

### Risk-Reward (pts)
- Max Profit: ~200-400 pts cumulative | Max Loss: ~150-250 pts | Breakeven: Near strike ± debit
- Margin: ~₹50,000-70,000 | ROM: 1.5x-2.5x

### Greeks Exposure
- Net Delta: -0.05 to -0.15 (mildly bearish) | Gamma: Low | Vega: +0.03 to +0.06
- Theta: +5-10 pts/day | Theta/Gamma: Excellent

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Moderate: -50 pts | Moderate: -30 pts | Moderate: -20 pts | Moderate: -40 pts |
| Down (slow) | Good: +150 pts | Very Good: +200 pts | Excellent: +250 pts | Good: +200 pts |
| Down (crash) | Moderate: -50 pts | Moderate: -30 pts | Moderate: -20 pts | Bad: -100 pts |
| Range | Good: +150 pts | Very Good: +200 pts | Excellent: +250 pts | Very Good: +200 pts |
Versatility Score: 8/12 | Best: High-Vol Range/Slow Down | Worst: Extreme-Vol Crash

### Executor Parameters
```json
{
  "strategy_id": "bearish_calendar_put_nifty_monthly_weekly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "vix": "NSE:INDIAVIX",
    "option_chain": "NIFTY monthly+weekly PE",
    "indicators": ["IV_term_structure", "downtrend_channel"]
  },
  "strike_selection": {
    "both_legs": "ATM - 100",
    "re_center_trigger": "300_pt_move"
  },
  "entry_signal": {
    "condition": "weekly_IV > monthly_IV AND VIX > 22 AND downtrend_channel_intact",
    "timing": "monthly_DTE >= 20 AND weekly_DTE >= 3",
    "order_type": "LIMIT",
    "max_slippage_pts": 5
  },
  "exit_signal": {
    "per_cycle_target_pts": 100,
    "cumulative_target_pts": 300,
    "stop_loss_pts": 200,
    "time_exit_monthly_dte": 10
  },
  "position_sizing": { "max_risk_pct": 3, "lots": 1, "lot_size": 75 }
}
```

### Edge Thesis
The bearish calendar put exploits the same term structure differential as the bullish calendar but with a bearish lean. In HIGH VIX with backwardation, the weekly put overpricing creates a reliable theta engine. The monthly long put maintains sustained bearish exposure while the weekly short generates income.

### Source & Citations
- TalkOptions.in: Calendar Spread Strategy (https://www.talkoptions.in/calendar-spread-strategy) — 2025
- 5paisa: Calendar Spreads (https://www.5paisa.com/stock-market-guide/derivatives-trading-basics/calendar-spreads-on-nifty-banknifty) — 2026

---

## Strategy 4: BankNifty Bear Call Ladder (Monthly)

**Structure:** Sell 1 ATM CE + Buy 1 OTM CE + Buy 1 further OTM CE
**Underlying:** BANKNIFTY | **Expiry:** Monthly
**Source:** Zerodha Varsity Module 6 + ISB discussions

### Entry Conditions
- Technical: BankNifty at 54000+ with RSI divergence (price making higher high, RSI lower high). Sector rotation away from banking. PSU bank weakness. Rationale: Divergence signals exhaustion of rally.
- IV Environment: VIX > 20. Net credit from sold ATM CE covers two bought OTM CEs.
- Timing: 15-25 DTE monthly.
- Rationale: Bear call ladder profits from decline, collects credit, and has unlimited profit potential if extreme rally occurs. In HIGH VIX, the structure is entered for meaningful credit.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| SELL | CE | ATM (54000) | 1 | Monthly |
| BUY | CE | ATM+500 (54500) | 1 | Monthly |
| BUY | CE | ATM+1000 (55000) | 1 | Monthly |

### Exit Conditions
- Profit Target: 200 pts (credit retained if BankNifty declines). Rationale: Standard credit exit.
- Stop Loss: 350 pts (max loss zone between bought strikes).
- Time Exit: Close at 7 DTE.
- Adjustment Rules: If pinned between bought strikes → close immediately. If extreme rally → hold.
- Best Exit Strategy: Exit in max-loss zone; hold in profit zones.

### Risk-Reward (pts)
- Max Profit (bearish): ~200-300 pts | Max Profit (extreme rally): Unlimited above 55500 | Max Loss: ~300-500 pts
- Margin: ~₹80,000-1,20,000 | ROM: 1.0x-1.5x

### Greeks Exposure
- Net Delta: -0.25 to -0.40 | Gamma: Moderate | Vega: +0.02 to +0.05
- Theta: +2-5 pts/day | Theta/Gamma: Acceptable

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up (moderate) | Bad: -350 pts | Bad: -300 pts | Moderate: -200 pts | Moderate: -150 pts |
| Up (extreme) | Good: +200 pts | Very Good: +400 pts | Excellent: +600 pts | Excellent: +800 pts |
| Down | Good: +200 pts | Very Good: +300 pts | Excellent: +300 pts | Good: +250 pts |
| Range | Moderate: +100 pts | Good: +180 pts | Good: +200 pts | Moderate: +150 pts |
Versatility Score: 6/12 | Best: High-Vol Down or Extreme Up | Worst: Low-Vol Moderate Up

### Executor Parameters
```json
{
  "strategy_id": "bear_call_ladder_banknifty_monthly",
  "data_requirements": {
    "spot_price": "NSE:BANKNIFTY",
    "option_chain": "BANKNIFTY monthly CE",
    "indicators": ["RSI_divergence_D", "sector_rotation", "PSU_bank_index"]
  },
  "strike_selection": {
    "sell_leg": "ATM",
    "buy_leg_1": "ATM + 500",
    "buy_leg_2": "ATM + 1000"
  },
  "entry_signal": {
    "condition": "RSI_divergence_bearish AND sector_rotation_away_banking AND VIX > 20",
    "timing": "DTE >= 15 AND DTE <= 25",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "profit_target_bearish_pts": 200,
    "stop_loss_pts": 350,
    "time_exit_dte": 7
  },
  "position_sizing": { "max_risk_pct": 3, "lots": 1, "lot_size": 30 }
}
```

### Edge Thesis
The bear call ladder on BankNifty targets the exhaustion of the recovery rally. RSI divergence at resistance signals a likely pullback. The credit entry and dual profit zones (bearish + extreme bullish) provide flexibility in uncertain markets.

### Source & Citations
- Zerodha Varsity: Options Module (https://zerodha.com/varsity/module/option-strategies/) — Evergreen
- ISB community — Ongoing

---

## Strategy 5: Nifty Protective Collar (Quarterly — Portfolio Hedge)

**Structure:** Long Nifty (existing position) + Buy OTM PE + Sell OTM CE
**Underlying:** NIFTY | **Expiry:** Quarterly
**Source:** Zerroday Protective Put Strategy + ISB portfolio protection discussions

### Entry Conditions
- Technical: Portfolio is long Indian equities. Macro risks persist (FPI selling, geopolitical). Want protection without liquidating. Rationale: Collar provides downside protection while capping upside — portfolio insurance.
- IV Environment: VIX > 22 (HIGH). The sold CE premium partially or fully funds the bought PE. In HIGH VIX, the collar can be free or credit.
- Timing: 60-90 DTE quarterly.
- Rationale: For investors with long equity portfolios, the collar is the primary hedging structure. In HIGH VIX, the sold OTM CE generates enough premium to buy the OTM PE for free.

### Legs
| Action | Type | Strike Selection | Qty (lots) | Expiry |
|--------|------|-----------------|------------|--------|
| (Existing) | Long | NIFTY exposure via ETF/futures | N/A | N/A |
| BUY | PE | ATM-500 (22800) | 1 | Quarterly |
| SELL | CE | ATM+500 (23800) | 1 | Quarterly |

### Exit Conditions
- Profit Target: Collar stays until expiry (protective). Remove CE if bullish conviction returns.
- Stop Loss: PE provides the stop — automatic protection below 22800.
- Time Exit: Roll to next quarter at 15 DTE.
- Adjustment Rules: If Nifty drops below PE strike → exercise/roll PE down. If Nifty rallies past CE → accept capped upside or roll CE up (cost: debit).
- Best Exit Strategy: Hold as portfolio insurance.

### Risk-Reward (pts)
- Max Profit: Capped at 500 pts (CE strike - current price) | Max Loss: ~500 pts (current price - PE strike) net of premium | Breakeven: Current price ± net premium
- Margin: Nil (covered by existing position) | ROM: N/A (hedge)

### Greeks Exposure
- Net Delta: +0.50 to +0.70 (reduced from full long) | Gamma: Low
- Vega: Near neutral (+PE/-CE offset) | Theta: Near neutral
- Theta/Gamma: Neutral — not a theta play

### Regime Performance Matrix
| Regime | Low-Vol | Med-Vol | High-Vol | Extreme-Vol |
|--------|---------|---------|----------|-------------|
| Up | Moderate: capped at +500 pts | Moderate: capped | Moderate: capped | Moderate: capped |
| Down | Good: loss limited to -500 pts | Good: limited | Very Good: limited | Excellent: limited while VIX spikes |
| Range | Neutral: 0 pts | Neutral | Neutral | Neutral |
Versatility Score: 9/12 | Best: Any volatile regime (protection) | Worst: Low-Vol Strong Up (capped)

### Executor Parameters
```json
{
  "strategy_id": "protective_collar_nifty_quarterly",
  "data_requirements": {
    "spot_price": "NSE:NIFTY",
    "portfolio_exposure": "NIFTY_equivalent_lots",
    "option_chain": "NIFTY quarterly CE+PE"
  },
  "strike_selection": {
    "buy_pe": "ATM - 500",
    "sell_ce": "ATM + 500",
    "zero_cost_target": true
  },
  "entry_signal": {
    "condition": "portfolio_long AND VIX > 22 AND macro_risk_elevated",
    "timing": "quarterly_DTE >= 60",
    "order_type": "LIMIT",
    "max_slippage_pts": 10
  },
  "exit_signal": {
    "roll_at_dte": 15,
    "remove_ce_if": "bullish_conviction_returns",
    "exercise_pe_if": "spot < pe_strike"
  },
  "position_sizing": { "max_risk_pct": 2, "lots": "match_portfolio", "lot_size": 75 }
}
```

### Edge Thesis
The protective collar is the most important bearish strategy for portfolio holders. In HIGH VIX at 24.64, the sold CE premium at ATM+500 fully funds the bought PE at ATM-500, creating a zero-cost collar. This provides 500 pts of downside protection for free — the only cost is capping upside at +500 pts. For long-only investors facing macro headwinds, this is essential risk management.

### Source & Citations
- Zerroday: Protective Put Strategy (https://zerroday.com/blog/best-options-trading-strategies-2026) — 2026
- ISB: Portfolio protection discussions — Ongoing

---

## Scout Health Diagnostic
- **Strategies Found:** 5/5
- **Schema Compliance:** PASS
- **Source Quality:** MEDIUM-HIGH
- **Staleness Risk:** LOW
- **Dedup Flags:** Bear call ladder overlaps with websearch short call ladder; calendar put overlaps with bullish calendar structures
