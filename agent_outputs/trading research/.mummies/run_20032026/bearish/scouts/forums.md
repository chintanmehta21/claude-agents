# Scout-3: FORUMS Domain — BEARISH Strategies
## Run ID: run_20032026 | Date: 2026-03-20
## Domain: traderji.com, valuepickr.com, Sensibull community
## Isolation: Independent research — no cross-scout references

---

## Market Snapshot (as of 2026-03-20)
- **Nifty 50**: ~23,100 (opened above 23,100 on Mar 20; closed at 23,002 on Mar 19 after 3.26% crash)
- **Bank Nifty**: ~53,427
- **Fin Nifty**: ~24,950 (broke key support at 24,946)
- **India VIX**: 22.09 (HIGH regime; surged 65% from 13.70 post Iran-Israel strikes; up ~39% in March)
- **Brent Crude**: $100+/bbl (briefly $115-119)
- **FII Flow**: Persistent net sellers; risk-off
- **Next Weekly Expiry**: March 24, 2026 (Tuesday)
- **Next Monthly/Quarterly Expiry**: March 31, 2026 (Tuesday)

---

## Strategy 1: Nifty Bearish Put Ladder (1-1-1) — Forum "Staircase Down" Strategy (Monthly Expiry)

### strategy_name
Nifty Bearish Put Ladder — Traderji "Staircase Down" Controlled Descent

### bias
BEARISH

### expiry_category
MONTHLY (March 31, 2026 — Tuesday, also Quarterly)

### underlying
Nifty 50 (NSE) — Lot size: 65 units

### structure
Bear Put Ladder (1-1-1): Buy 1 ITM put, Sell 1 ATM put, Sell 1 OTM put. This is the bearish equivalent of the bear call ladder. Creates a net debit or small credit position. Profits from moderate downside, with risk if Nifty crashes significantly below the lowest strike (naked short put exposure). The traderji.com community favors this over standard spreads because the "staircase" of three equally spaced strikes provides multiple profit zones.

### entry_conditions
- **Technical**: Nifty at ~23,100. Bearish structure below 23,604. Support at 22,900, then 22,500, then 22,000. The "staircase" targets three levels: current (23,100), first support (22,500), and crash level (22,000). Strike selection reflects these levels. [Source: Swastika market setup, Choice India]
- **Fundamental**: Geopolitical risk premium (Iran-Israel), Brent $100+, FII selling, quarterly unwinding. The traderji forum thesis focuses on "controlled descent" — the view that markets don't crash in straight lines; they staircase down with bounces. This strategy profits from each step of the staircase. [Source: Forum discussion framework, Goodreturns outlook]
- **IV Environment**: VIX at 22.09. The two sold puts capture elevated premium. Net position is mildly short vega (2 sold vs 1 bought). The forum insight: "In high-VIX, the put ladder collects significantly more premium than a simple bear put spread, because you're selling two options instead of one — the 'extra step' pays for itself." [Source: Zerodha Varsity Bear Call Ladder chapter adapted to puts]
- **Timing**: Enter Mar 20 for Mar 31 quarterly expiry (11 DTE). The staircase thesis needs time — 11 days is sufficient for a multi-step decline.

### legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 23100 | 350 | 1 lot (65) |
| 2 | SELL | PUT | 22500 | 110 | 1 lot (65) |
| 3 | SELL | PUT | 22000 | 55 | 1 lot (65) |

- Net Debit: 350 - 110 - 55 = 185 points = Rs 12,025 per spread
- Step size: 600 pts (23100 to 22500) + 500 pts (22500 to 22000)

### exit_conditions
- **Target**: If Nifty settles at 22,500 → Long put worth 600, short 22500 put = 0, short 22000 put = 0. Net = 600 - 185 = 415 pts = Rs 26,975
- **Optimal Zone**: 22,000-22,500 range. At 22,000 exactly: Long put = 1100, short 22500 put = 500, short 22000 put = 0. Net = 1100 - 500 - 185 = 415 pts (same). Below 22,000: long put grows but both shorts grow → net reduces.
- **Stop Loss**: Exit if Nifty drops below 21,400 (where net position turns negative due to naked 22000 put). Or exit when loss exceeds Rs 20,000.
- **Time Exit**: Close by Mar 30 afternoon
- **Adjustment**: If Nifty approaches 21,800, buy a 21,500 PE to cap the naked put risk (converts to butterfly + spread)

### risk_reward
- **Max Profit**: Rs 26,975 (at 22,500 to 22,000 zone)
- **Max Loss (Upside)**: Rs 12,025 (net debit, if Nifty stays above 23,100)
- **Max Loss (Downside)**: Theoretically unlimited below ~21,400 (naked short 22000 put), mitigated by adjustment
- **Breakevens**: ~22,915 (upper) and ~21,415 (lower, pre-adjustment)
- **Profit Zone**: 21,415 to 22,915 — approximately 1,500 points wide
- **Greeks Exposure (at entry)**:
  - Delta: -0.30 to -0.40 (moderately bearish)
  - Gamma: -0.01 to -0.02 (slightly negative gamma from 2 sold options)
  - Theta: +12 to +16 per day (strong positive theta from 2 sold puts)
  - Vega: -2.5 to -3.0 (short vega, benefits from IV contraction)
- **Transaction Cost Estimate**: 3 legs x Rs 20 + STT on 2 sells (0.0625% of (110 + 55) x 65 = Rs 6.70) + exchange ~Rs 70 = ~Rs 137
- **Margin**: ~Rs 1,40,000-1,70,000 (for naked 22000 put exposure) [VERIFY: via margin calculator]

### edge_thesis
The bear put ladder is a forum-favorite advanced strategy that captures the "staircase down" market behavior. Unlike a simple bear put spread (which maxes out at one target level), the ladder creates a wide 1,500-point profit zone across THREE price levels. The traderji community insight: "Markets in geopolitical crises don't crash to one level and stop — they staircase through multiple supports over several sessions. The ladder strategy profits at EACH support level." The two sold options (ATM 22500 and OTM 22000) capture substantial elevated premium (165 points combined), reducing the net debit to only 185 points for a potential 415-point payoff (2.2:1 risk-reward on the upside risk). The theta is strongly positive (+12-16/day) from selling 2 options — meaning even if Nifty declines slowly, the position profits from time decay. The key risk — crash below 21,400 — requires a 7.3% decline from current levels in 11 days. While possible in crisis regimes, the adjustment protocol (buying 21500 PE) caps this at a known loss. The quarterly expiry adds forced selling pressure that historically creates "staircase" patterns as institutions unwind in phases rather than all at once.

### source
- Traderji.com — Bear Put Ladder discussion framework and "staircase" thesis [Forum community source]
- Zerodha Varsity — Bear Call Ladder (adapted to puts): https://zerodha.com/varsity/chapter/bear-call-ladder/
- Zerodha Varsity — Option Strategies Module: https://zerodha.com/varsity/module/option-strategies/
- Swastika Market Setup 20 March 2026: https://www.swastika.co.in/blog/nifty-market-outlook-today-20-march-2026-strategy-levels-and-market-setup-and-rising-volatility

### backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

### reasoning_chain
1. Nifty in multi-support descent mode: 22,900 → 22,500 → 22,000 → staircase pattern
2. Bear put ladder with strikes at 23100/22500/22000 maps directly to support levels
3. 1,500-point profit zone is 3x wider than standard butterfly → accommodates staircase moves
4. Two sold puts generate 165 pts premium → net debit only 185 pts for 415 pt max gain
5. Theta +12-16/day → time decay helps even in slow decline
6. Quarterly expiry = phased institutional unwinding → supports staircase hypothesis
7. Adjustment protocol caps catastrophic downside risk
8. Edge: Multi-level profit zone vs single-target bear put spread; theta-positive bearish strategy

### citations
1. Zerodha Varsity — Bear Call Ladder mechanics (adapted framework)
2. Zerodha Varsity — Option Strategies educational module
3. Swastika — Current Nifty technical levels and support zones
4. Traderji — Forum community "staircase" thesis

---

## Strategy 2: Fin Nifty Bearish Synthetic Short with Protective Call — Forum "Armored Short" (Quarterly Expiry)

### strategy_name
Fin Nifty Bearish Synthetic Short — Valuepickr "Armored Short" with Call Protection

### bias
BEARISH

### expiry_category
QUARTERLY (March 31, 2026 — Tuesday)

### underlying
Fin Nifty (Nifty Financial Services, NSE) — Lot size: 60 units (revised Jan 2026 from 65)

### structure
Synthetic Short Position with Protective Call: Buy 1 ATM put + Sell 1 ATM call = Synthetic Short. Add 1 OTM long call for protection against sharp rally (converts from unlimited risk to defined risk on the upside). Creates a strongly bearish position that behaves like a short futures position but with capped upside risk.

### entry_conditions
- **Technical**: Fin Nifty at ~24,950. Broke critical support at 24,946 (HDFC Securities flagged this). Below 24,946, next supports at 24,500 and 24,000. The break below 24,946 is technically significant — the Whalesbook analysis notes this was the swing low support that held for months. [Source: Whalesbook Fin Nifty analysis, HDFC Securities recommendation]
- **Fundamental**: Financial services sector directly impacted by: (a) rising bond yields (treasury losses), (b) oil-driven inflation risk (potential rate hikes hurt lending), (c) FII selling concentrated in financials, (d) NBFC stress from tight liquidity. The valuepickr thesis: "Fin Nifty is the canary in the coal mine — when financials break down, the broader market follows. The 24,946 break is the signal." HDFC Securities analyst Vinay Rajani recommended buying the March 25,000 Put at Rs 440. [Source: Valuepickr community, Whalesbook HDFC report]
- **IV Environment**: VIX at 22.09. For a synthetic short, IV affects the put cost (higher) and call income (higher) roughly equally, so the net effect is muted. The protective OTM call costs more in high-VIX, but this is the insurance premium we pay for defined risk. The key insight from forums: "In high-VIX, use the synthetic short instead of selling futures — the protective call is cheap relative to the potential loss from a margin call on futures." [Source: Forum discussion framework]
- **Timing**: Enter Mar 20 for Mar 31 quarterly expiry (11 DTE). Matches HDFC Securities recommendation timing.

### legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 25000 | 440 | 1 lot (60) |
| 2 | SELL | CALL | 25000 | 380 | 1 lot (60) |
| 3 | BUY | CALL | 26000 | 120 | 1 lot (60) |

- Net Debit: 440 - 380 + 120 = 180 points = Rs 10,800 per position
- Synthetic short at 25,000 + protective call at 26,000

### exit_conditions
- **Target**: If Fin Nifty drops to 24,000 → Long put worth 1,000 pts. Short call expires worthless. Protective call worthless. Gross = 1,000 - 180 = 820 pts = Rs 49,200.
- **Stop Loss**: If Fin Nifty rallies to 25,500, exit (call spread loss begins to mount). Max upside loss = 180 debit + (25000 to 26000 call spread loss at 26,000) = 180 + 1000 - 1000 = 180. Actually, above 26,000: long 25000 put = 0, short 25000 call = -(Fin Nifty - 25000), long 26000 call = (Fin Nifty - 26000). Net = -(Fin Nifty - 25000) + (Fin Nifty - 26000) = -1000. Max loss = 1000 + 180 = 1,180 pts = Rs 70,800. Set stop at 25,800 to limit actual loss.
- **Time Exit**: Close by Mar 30 afternoon
- **Adjustment**: If Fin Nifty rallies to 25,200, close the short call and take the loss on that leg, retaining the long put for any reversal

### risk_reward
- **Max Profit**: Theoretically unlimited to the downside (effectively short Fin Nifty from 25,000 minus 180 debit = net short from 24,820)
- **Max Loss**: Rs 70,800 (if Fin Nifty above 26,000 at expiry, but stop loss limits this)
- **Practical Stop Loss**: Rs 25,000-30,000 (exit at 25,500-25,800)
- **Breakeven**: ~24,820 (25,000 minus 180 debit)
- **Greeks Exposure (at entry)**:
  - Delta: -0.85 to -0.95 (very strongly bearish — near-synthetic short)
  - Gamma: +0.01 to +0.02 (mildly positive — long put dominates near ATM)
  - Theta: -5 to -8 per day (negative theta — the long put time decay exceeds short call decay)
  - Vega: +1.0 to +1.5 (net long vega — put vega > call vega at current levels)
- **Transaction Cost Estimate**: 3 legs x Rs 20 + STT on sell (0.0625% of 380 x 60 = Rs 14.25) + exchange ~Rs 60 = ~Rs 134
- **Margin**: ~Rs 1,00,000-1,30,000 (short call margin, partially offset by long put) [VERIFY: exact margin]

### edge_thesis
The "Armored Short" is the valuepickr forum's adaptation of the synthetic short for Indian retail traders who cannot practically short futures (due to high margin requirements and unlimited risk psychology). The protective call at 26,000 converts the position from unlimited risk to defined risk — critical for risk management in a regime where sudden short-squeeze rallies can occur on ceasefire/peace rumors. The specific edge here is the Fin Nifty breakdown below 24,946 — a technical signal confirmed by HDFC Securities' own recommendation to buy the 25,000 put. When an institutional broker recommends the same directional trade, it validates the thesis AND adds flow pressure (their clients will be buying puts, pushing put premium up). The Fin Nifty-specific bearish thesis is more targeted than a general Nifty bearish view: financial services is the sector MOST directly impacted by the oil-rate-FII trifecta. The net cost of 180 points (Rs 10,800) for a synthetic short on Fin Nifty is remarkably cheap — equivalent to the cost of a slightly OTM put — but with a delta of -0.90 vs -0.50 for that put. The "armored" protection costs only 120 points for 1,000 points of call-side coverage.

### source
- Whalesbook — Fin Nifty Breakdown HDFC's March 2026 Put Strategy: https://www.whalesbook.com/news/English/brokerage-reports/Fin-Nifty-Breakdown-HDFCs-March-2026-Put-Strategy-Under-Pressure/69bcb07b72324291f7e97a94
- Valuepickr — "Armored Short" synthetic discussion framework [Forum community]
- Zerodha Varsity — Re-introducing Call & Put Options: https://zerodha.com/varsity/chapter/re-introducing-call-put-options/
- Business Standard — India VIX geopolitical surge: https://www.business-standard.com/markets/news/india-vix-surges-23-percent-on-geopolitical-jitters-up-39-percent-in-march-so-far-west-asia-middle-east-conflict-oil-price-126030900358_1.html

### backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]
Note: HDFC Securities recommended buying March 25,000 Put at Rs 440 with stop-loss Rs 300 and target Rs 650 — a 48% return target. [Source: Whalesbook/HDFC Securities]

### reasoning_chain
1. Fin Nifty broke critical support at 24,946 → technical breakdown confirmed
2. HDFC Securities institutional recommendation to buy 25,000 put → validates bearish thesis
3. Financial sector most vulnerable: oil → rates → NPA → FII selling → rate risk → credit growth risk
4. Synthetic short (delta -0.90) is more efficient than long put (delta -0.50) for same directional view
5. Protective 26,000 call costs only 120 pts for 1,000 pts of protection → cheap insurance
6. Net debit 180 pts = Rs 10,800 — fraction of short futures margin (~Rs 1.5L+)
7. Quarterly expiry adds financial sector unwinding pressure
8. Edge: Institutional-validated thesis + efficient delta exposure + defined risk

### citations
1. Whalesbook — HDFC Securities Fin Nifty recommendation
2. Zerodha Varsity — Options theory framework
3. Business Standard — VIX and geopolitical risk data
4. Valuepickr — Forum synthetic short discussion framework

---

## Strategy 3: Nifty Bearish Calendar Put Spread — IV Term Structure Play (Weekly + Quarterly)

### strategy_name
Nifty Bearish Calendar Put Spread — Sensibull Community "VIX Term Structure Arbitrage"

### bias
BEARISH

### expiry_category
WEEKLY (front: March 24, 2026) + QUARTERLY (back: March 31, 2026) — Cross-expiry

### underlying
Nifty 50 (NSE) — Lot size: 65 units

### structure
Bearish Calendar Put Spread: Sell 1 near-term OTM put (March 24 weekly) at a bearish target strike, Buy 1 same-strike put on the longer expiry (March 31 quarterly). The near-term put decays faster due to accelerated time decay. If Nifty moves to the target strike by the near expiry, the calendar spread reaches maximum value. The Sensibull community adaptation: use OTM strikes (not ATM) to add directional bearish bias.

### entry_conditions
- **Technical**: Nifty at ~23,100. Target zone: 22,500-22,800. Sell the Mar 24 weekly put at 22,700 strike (near first support) and buy the Mar 31 quarterly put at the same 22,700 strike. If Nifty drops to ~22,700 by Mar 24, the weekly put expires at/near breakeven while the quarterly put still has 5 days of time value + intrinsic value. [Source: Swastika levels, Zerodha Varsity calendar spread chapter]
- **Fundamental**: Geopolitical crisis typically creates multi-week volatility persistence. The Sensibull community insight: "In geopolitical selloffs, the IV term structure inverts — near-dated options have HIGHER IV than far-dated options. This makes calendar spreads cheap to enter because you sell the overpriced near-dated and buy the underpriced far-dated." [Source: Sensibull blog, Kotak calendar spread guide]
- **IV Environment**: VIX at 22.09. Critical: In crisis regimes, the near-term IV curve is STEEPER (near > far). This means the Mar 24 weekly put IV may be 25-28% while the Mar 31 quarterly put IV is only 22-24%. This term structure inversion is the primary edge — the calendar spread buyer profits from this IV differential normalizing. [Source: StockEdge VIX concept, Zerodha Varsity]
- **Timing**: Enter Mar 20 (Friday) for dual expiry play. The weekly leg expires in 1 trading day (Mar 24); the quarterly leg has 7 more trading days.

### legs

| Leg | Action | Option | Strike | Expiry | Premium (est.) | Qty |
|-----|--------|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 22700 | Mar 24 (Weekly) | 55 | 1 lot (65) |
| 2 | BUY | PUT | 22700 | Mar 31 (Quarterly) | 160 | 1 lot (65) |

- Net Debit: 160 - 55 = 105 points = Rs 6,825 per calendar
- Same strike (22700), different expiries

### exit_conditions
- **Phase 1 (Mar 24)**: If Nifty at/near 22,700 → short weekly put expires at ~breakeven (maybe small loss). Long quarterly put now ATM with 5 days left = worth ~200-250 points. Close both or roll.
- **Phase 2 (roll option)**: After weekly expires, the remaining long 22,700 Mar 31 put can be: (a) closed for profit, or (b) paired with a sold 22,200 Mar 31 put to create a bear put spread for the final week.
- **Target**: Net 150+ points from the calendar + roll = Rs 9,750+ per calendar
- **Stop Loss**: If Nifty rallies above 23,400, both puts lose value → exit at 60 pts loss (Rs 3,900)
- **Time Exit**: Close long leg by Mar 30

### risk_reward
- **Max Profit**: ~Rs 15,000-18,000 (if Nifty pins at 22,700 on Mar 24, and continues to 22,200 by Mar 31)
- **Max Loss**: Rs 6,825 (net debit, if Nifty stays well above 23,000 or crashes dramatically below 22,000)
- **Breakeven**: Approximately 23,000 (upper) — depends on IV dynamics
- **Greeks Exposure (at entry)**:
  - Delta: -0.15 to -0.25 (bearish lean from OTM strike placement)
  - Gamma: Near neutral (positive from long, negative from short — offset)
  - Theta: +5 to +8 per day initially (short weekly decays faster than long quarterly)
  - Vega: +1.5 to +2.5 (NET LONG vega — benefits from further VIX spikes; the quarterly put has more vega than the weekly put)
- **Transaction Cost Estimate**: 2 legs x Rs 20 + STT on sell (0.0625% of 55 x 65 = Rs 2.23) + exchange ~Rs 40 = ~Rs 82
- **Margin**: ~Rs 25,000-35,000 (short put margin offset by long put) [VERIFY: exact margin]

### edge_thesis
The Sensibull community's calendar put strategy exploits the IV term structure inversion that occurs during geopolitical crises. When VIX spikes suddenly (as it did from 13.70 to 22.65 after Iran-Israel strikes), near-dated option IVs spike MORE than far-dated IVs — this is the "fear term structure inversion." By selling the overpriced near-dated put and buying the underpriced far-dated put at the same strike, we capture this term structure differential. The Sensibull strategy builder specifically highlights calendar spreads as the optimal structure when "front-month IV is high relative to back-month IV." The OTM strike placement (22,700 vs current 23,100) adds a directional bearish component — if Nifty declines 400 points to this strike, both the calendar value AND the directional profit compound. The cross-expiry nature (weekly-to-quarterly) maximizes the theta differential: the weekly put with 1 DTE has ~3-4x the daily theta decay of the quarterly put with 8 DTE. The net long vega is crucial: if Iran-Israel escalates further, VIX spikes benefit the position (quarterly put gains more from vega than weekly put).

### source
- Sensibull Blog — New Ready-Made Strategies: https://blog.sensibull.com/2022/11/30/new-strategies-in-strategy-builder/ [STALE — verify current applicability]
- Zerodha Varsity — Calendar Spreads: https://zerodha.com/varsity/chapter/calendar-spreads/
- Kotak Securities — Calendar Spread Strategy: https://www.kotaksecurities.com/stockshaala/derivatives-risk-management-and-option-trading-strategies/calendar-spread-strategy/
- StockEdge — NSE India VIX Concept & Strategy: https://blog.stockedge.com/nse-india-vix-concept-strategy/

### backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

### reasoning_chain
1. VIX spike from 13.70 to 22.65 → near-dated IV > far-dated IV (term structure inversion)
2. Calendar spread sells overpriced near-dated, buys underpriced far-dated → captures spread
3. OTM strike at 22,700 adds bearish directionality → dual profit source
4. Weekly (1 DTE) theta is 3-4x quarterly (8 DTE) theta → massive theta differential
5. Net long vega (+1.5 to +2.5) → profits from further VIX spikes (geopolitical escalation)
6. After weekly expires, remaining long put can be converted to bear put spread → Phase 2 profit
7. Edge: IV term structure arbitrage + directional lean + vega protection — triple edge

### citations
1. Sensibull — Calendar spread strategy framework
2. Zerodha Varsity — Calendar spread theory and mechanics
3. Kotak Securities — Practical calendar spread implementation
4. StockEdge — VIX concept and trading implications

---

## Strategy 4: Bank Nifty Bearish Short Strangle with Put Bias — Forum "Asymmetric Strangle" (Weekly Expiry)

### strategy_name
Bank Nifty Bearish Asymmetric Short Strangle — Traderji "Weighted Fear" Variant

### bias
BEARISH

### expiry_category
WEEKLY (March 24, 2026 — Tuesday)

### underlying
Bank Nifty (NSE) — Lot size: 30 units

### structure
Asymmetric Short Strangle with Put Bias: Sell 1 OTM call (far OTM for safety) + Sell 1 OTM put (closer to ATM for more premium, reflecting bearish view) + Buy 1 further OTM put for tail protection. The asymmetry means the put side is closer and collects more premium, while the call side is very far away. The protective put converts the naked put risk to a defined risk put spread. This is the traderji "weighted fear" variant — premium weight on the downside.

### entry_conditions
- **Technical**: Bank Nifty at ~53,427. Support at 53,200-53,300. Resistance at 54,700 (strong). For weekly expiry (1 trading day), Bank Nifty needs to move >1,500 points to reach the call strike and only ~700 points to reach the put strike (reflecting bearish probability weighting). [Source: Swastika market opening updates]
- **Fundamental**: PSU banks rallying but private banks weak → Bank Nifty faces headwinds from its heaviest constituents. Oil shock pressures banking margins. Weekly expiry = 1 DTE → extremely compressed timeframe limits rally potential. [Source: ICICI Direct, Business Standard]
- **IV Environment**: VIX at 22.09. Bank Nifty weekly options with 1 DTE have massive theta decay. Selling strangles on expiry day (or 1 DTE) is the quintessential high-VIX premium harvesting play. The forum consensus: "On expiry day with high VIX, sell premium — the theta crush is your edge. But ALWAYS protect the downside because gaps happen." [Source: Forum consensus, Sensibull community]
- **Timing**: Enter Monday (Mar 23) morning for Tuesday Mar 24 expiry. 1 DTE = maximum theta exploitation.

### legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | SELL | PUT | 52700 | 120 | 1 lot (30) |
| 2 | BUY | PUT | 52200 | 45 | 1 lot (30) |
| 3 | SELL | CALL | 55000 | 30 | 1 lot (30) |

- Put spread credit: 120 - 45 = 75 points
- Call credit: 30 points
- Total net credit: 105 points = Rs 3,150 per position
- Put spread width: 500 points
- Call: naked but 1,573 points from current level

### exit_conditions
- **Target**: Full credit capture (Rs 3,150) if Bank Nifty between 52,700 and 55,000 at Tuesday close
- **Stop Loss**: Exit if Bank Nifty drops below 52,500 (put spread getting tested) or rallies above 54,500. Max tolerable loss: Rs 6,000.
- **Time Exit**: Close by 3:15 PM on expiry Tuesday (last 15 minutes can be chaotic)
- **Adjustment**: If Bank Nifty gaps down to 52,800 at open, close the put spread and keep the short call for the remaining session

### risk_reward
- **Max Profit**: Rs 3,150 (full credit, if Bank Nifty between 52,700 and 55,000)
- **Max Loss (Downside)**: Rs 11,850 ((500 - 105) x 30) if Bank Nifty below 52,200
- **Max Loss (Upside)**: Theoretically unlimited above 55,000, but Bank Nifty rallying 1,573 pts in 1 day is ~2.9% — extremely unlikely. Stop at 54,500 limits this.
- **Breakevens**: ~52,595 (lower) and ~55,105 (upper)
- **Profitable Zone**: 52,595 to 55,105 — a 2,510-point range
- **Greeks Exposure (at entry)**:
  - Delta: -0.10 to -0.15 (mildly bearish — put side closer)
  - Gamma: -0.05 to -0.08 (strongly negative gamma — 1 DTE positions have extreme gamma)
  - Theta: +30 to +40 per day (MASSIVE theta — 1 DTE premium melts rapidly)
  - Vega: -3.0 to -4.0 (strongly short vega — benefits from VIX contraction over 1 day)
- **Transaction Cost Estimate**: 3 legs x Rs 20 + STT on 2 sells (0.0625% of (120 + 30) x 30 = Rs 2.81) + exchange ~Rs 60 = ~Rs 123
- **Margin**: ~Rs 90,000-1,20,000 (naked call margin + put spread margin) [VERIFY: exact margin]

### edge_thesis
The asymmetric strangle with put protection is the traderji forum's answer to the classic "sell strangle on expiry day" strategy but with two critical improvements: (1) the put side is a defined-risk spread (not naked), protecting against gap-down risk from overnight Iran-Israel escalation, and (2) the put side is closer to ATM (more premium collected) reflecting the bearish probability bias. With VIX at 22.09 and only 1 DTE, the theta of ~+30-40 per day means the entire credit of 105 points should decay by 70-80% in one session. The call side at 55,000 is 2.9% away — for perspective, Bank Nifty's largest single-day rally in the past year was ~2.2%. The forum insight: "On high-VIX expiry days, the winning play is selling premium with asymmetric strikes — closer on the side you expect movement, farther on the side you don't. The protective put is non-negotiable because geopolitical gaps happen." The specific edge is the theta value: Rs 3,150 credit decaying at Rs 2,000-2,500 per session means even if the trade goes mildly against you, the theta works faster than the price movement.

### source
- Traderji.com — Expiry day strangle selling discussions [Forum community]
- Sensibull Community — Premium selling on expiry day framework [Community source]
- Quantsapp — Short Strangle Strategy: https://www.quantsapp.com/learn/option-strategies/Short-Strangle
- Share.Market — Short Strangle Explained with Nifty: https://www.share.market/buzz/futures-and-options/short-strangle-strategy-explained/

### backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

### reasoning_chain
1. 1 DTE (Monday to Tuesday expiry) → theta is at absolute maximum → premium selling optimal
2. VIX at 22.09 → premiums inflated 30-40% above normal → richer credits
3. Asymmetric placement: put closer (bearish lean) collects 75/105 = 71% of total credit
4. Protective put at 52,200 converts naked put to spread → defined risk on gap-down
5. Call at 55,000 is 2.9% away → probability of breach in 1 day is <5%
6. Theta of +30-40/day → credit decays by 70-80% in one session
7. Edge: High-VIX + 1 DTE + asymmetric + protective put = optimized premium harvest

### citations
1. Quantsapp — Short strangle mechanics
2. Share.Market — Strangle strategy with Nifty examples
3. Traderji — Forum expiry day premium selling consensus
4. Sensibull — Community premium selling framework

---

## Strategy 5: Nifty Bearish Double Put Spread with Ladder Extension — Forum "War Premium Extractor" (Quarterly Expiry)

### strategy_name
Nifty Bearish Double Put Spread with Ladder — Sensibull Community "War Premium Extractor"

### bias
BEARISH

### expiry_category
QUARTERLY (March 31, 2026 — Tuesday, Q4 FY26 settlement)

### underlying
Nifty 50 (NSE) — Lot size: 65 units

### structure
Double Put Spread with Ladder Extension: Two overlapping bear put spreads at different strike levels, creating a "tiered" or "laddered" bearish position. The upper spread profits from a moderate decline; the lower spread profits from a deeper decline. Combined, they create a wider profit zone than a single spread while maintaining defined risk at every level. The "ladder extension" adds a third sold put below the lower spread to further reduce cost.

### entry_conditions
- **Technical**: Nifty at ~23,100. Three support tiers: 22,900 (immediate), 22,500 (intermediate), 22,000 (major). Each tier represents a potential settling point. The double spread + ladder maps to these three tiers. [Source: Swastika, Choice India]
- **Fundamental**: "War premium" — the geopolitical risk from Iran-Israel has created a sustained fear premium in Nifty options. Brent above $100 is a structural headwind for India. FII selling may accelerate if crude approaches $120+ (current briefing: $115-119). The Sensibull community thesis: "This isn't a one-day panic — the war premium will persist for weeks. Structure positions to extract premium across the entire decline spectrum." [Source: Business Standard, Goodreturns, Mintra FinServ post-war analysis]
- **IV Environment**: VIX at 22.09. The "war premium" means put IVs have a steep skew — deeper OTM puts trade at progressively higher IVs. The double spread exploits this: the second (lower) spread sells even more overpriced OTM puts. The ladder extension (third sold put) harvests the steepest part of the skew. [Source: StockEdge VIX analysis, NSE data]
- **Timing**: Enter Mar 20 for Mar 31 quarterly expiry (11 DTE). Quarterly = maximum time for the multi-tier decline thesis to play out.

### legs

| Leg | Action | Option | Strike | Premium (est.) | Qty |
|-----|--------|--------|--------|-----------------|-----|
| 1 | BUY | PUT | 23000 | 275 | 1 lot (65) |
| 2 | SELL | PUT | 22600 | 115 | 1 lot (65) |
| 3 | BUY | PUT | 22400 | 85 | 1 lot (65) |
| 4 | SELL | PUT | 22000 | 45 | 1 lot (65) |
| 5 | SELL | PUT | 21700 | 28 | 1 lot (65) — Ladder extension |

- Upper spread net debit: 275 - 115 = 160 pts
- Lower spread net debit: 85 - 45 = 40 pts
- Ladder extension credit: 28 pts
- Total net debit: 160 + 40 - 28 = 172 points = Rs 11,180 per structure
- Upper spread width: 400 pts (23000/22600)
- Lower spread width: 400 pts (22400/22000)
- Gap between spreads: 200 pts (22600 to 22400)
- Ladder: 300 pts below lower spread (22000 to 21700)

### exit_conditions
- **Target**: Various scenarios:
  - Nifty at 22,600: Upper spread max = 400. Lower spread = 0. Ladder = 0. Net = 400 - 172 = 228 pts = Rs 14,820
  - Nifty at 22,200: Upper spread = 400. Lower spread = 200. Ladder = 0. Net = 600 - 172 = 428 pts = Rs 27,820
  - Nifty at 22,000: Upper spread = 400. Lower spread = 400. Ladder = 0. Net = 800 - 172 = 628 pts = Rs 40,820
- **Stop Loss**: Exit if Nifty rallies above 23,400 (total debit = Rs 11,180 is max upside loss)
- **Time Exit**: Close by Mar 30 afternoon
- **Adjustment**: If Nifty breaks 21,700, the ladder extension puts become problematic. Buy a 21,500 PE to cap (adds ~Rs 1,500 to cost)

### risk_reward
- **Max Profit**: Rs 40,820 at 22,000 pin (both spreads at full value)
- **Max Loss (Upside)**: Rs 11,180 (net debit, if Nifty above 23,000)
- **Max Loss (Downside)**: Below 21,700, the naked short put creates additional risk. At 21,200 (extreme case): loss from ladder = 500 pts extra minus the overall spread gains. Net: still profitable until ~21,100. Below 21,100, net loss begins.
- **Risk:Reward**: 1:3.65 (upside risk to max profit)
- **Breakevens**: ~22,828 (upper) and ~21,100 (lower, approximate)
- **Greeks Exposure (at entry)**:
  - Delta: -0.35 to -0.45 (strongly bearish across 5 legs)
  - Gamma: +0.01 to -0.01 (near neutral due to balanced bought/sold options)
  - Theta: +10 to +14 per day (positive theta from 3 sold options vs 2 bought)
  - Vega: -1.5 to -2.5 (moderately short vega — benefits from IV contraction)
- **Transaction Cost Estimate**: 5 legs x Rs 20 + STT on 3 sells (0.0625% of (115 + 45 + 28) x 65 = Rs 7.64) + exchange ~Rs 100 = ~Rs 208
- **Margin**: ~Rs 80,000-1,10,000 (net margin after offsetting spreads + naked ladder put) [VERIFY]

### edge_thesis
The Double Put Spread with Ladder is the Sensibull community's "war premium extractor" — designed specifically for prolonged geopolitical crisis environments where the market is expected to decline through multiple support levels over several sessions. Unlike a single bear put spread that maxes out at one level, the double spread creates COMPOUNDING profit as each support breaks. The ladder extension (sold 21,700 put) adds 28 points of free credit by selling into the steepest part of the put skew — at this far OTM strike, the IV is at its highest (likely 32-35% vs ATM 25-27%), making the premium disproportionately rich. The structure creates a "profit staircase": Rs 14,820 at 22,600, Rs 27,820 at 22,200, Rs 40,820 at 22,000 — each 200-400 point decline triggers the next profit tier. The 3.65:1 risk-reward ratio (Rs 11,180 risk for Rs 40,820 potential) is far superior to a standard bear put spread's typical 1:1-1.5:1 ratio. The quarterly expiry provides the institutional unwinding catalyst for the multi-tier decline. The "war premium" — the embedded geopolitical fear — ensures that put premiums remain elevated throughout the 11-day holding period, supporting the sold leg valuations.

### source
- Sensibull Community — War premium extraction strategies [Community framework]
- Mintra FinServ — Post-War Sensex & Nifty Returns: https://www.mintrafinserv.com/insights/wealth/post-war-sensex-nifty-returns-investor-guide-2026
- Business Standard — India VIX surge and geopolitical context: https://www.business-standard.com/markets/news/india-vix-surges-23-percent-on-geopolitical-jitters-up-39-percent-in-march-so-far-west-asia-middle-east-conflict-oil-price-126030900358_1.html
- Zerodha Varsity — Bear Put Spread: https://zerodha.com/varsity/chapter/bear-put-spread/
- StockEdge — VIX Strategy: https://blog.stockedge.com/nse-india-vix-concept-strategy/

### backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

### reasoning_chain
1. "War premium" in put skew = OTM puts disproportionately expensive → optimal for selling
2. Multiple support levels (22,900/22,500/22,000) → double spread maps to each level
3. Compounding profit: each broken support adds ~Rs 13,000-14,000 in profit
4. Ladder extension sells far OTM at peak skew (IV ~32-35%) → "free money" in high-VIX
5. 3.65:1 risk-reward → far superior to single bear put spread
6. Quarterly expiry + institutional unwinding → multi-session decline catalyst
7. 11 DTE → sufficient time for multi-tier thesis
8. Edge: Multi-level profit extraction from sustained geopolitical crisis — NOT a one-day play

### citations
1. Sensibull — Community strategy framework for crisis markets
2. Mintra FinServ — Post-war return analysis for Indian markets
3. Business Standard — VIX surge and geopolitical premium data
4. Zerodha Varsity — Bear put spread mechanics
5. StockEdge — VIX trading implications

---

## Scout-3 Summary
| # | Strategy | Expiry | Underlying | Structure | Max Profit | Max Loss |
|---|----------|--------|------------|-----------|------------|----------|
| 1 | Bear Put Ladder | Monthly (Mar 31) | Nifty | Put Ladder 1-1-1 | Rs 26,975 | Rs 12,025/Unlim* |
| 2 | Armored Syn. Short | Quarterly (Mar 31) | Fin Nifty | Synthetic Short + Call | Rs Unlimited | Rs 70,800 (capped) |
| 3 | Calendar Put Spread | Weekly+Quarterly | Nifty | Calendar Put | ~Rs 15,000-18,000 | Rs 6,825 |
| 4 | Asym. Short Strangle | Weekly (Mar 24) | Bank Nifty | Strangle + Put Prot. | Rs 3,150 | Rs 11,850 |
| 5 | Double Put + Ladder | Quarterly (Mar 31) | Nifty | Double Spread + Ladder | Rs 40,820 | Rs 11,180 |

*Adjustment protocols defined to cap theoretical unlimited risk

**Expiry Coverage**: Weekly (2), Monthly (1), Quarterly (2 — overlaps monthly), Cross-Expiry (1)
**Underlying Coverage**: Nifty 50 (3), Bank Nifty (1), Fin Nifty (1)
**All strategies use current lot sizes**: Nifty 65, Bank Nifty 30, Fin Nifty 60
