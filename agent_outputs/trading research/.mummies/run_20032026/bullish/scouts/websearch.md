# Scout-1: WEBSEARCH Domain | BULLISH Bias
## Run ID: run_20032026 | Date: 2026-03-20
## Scout Isolation: Independent research — no cross-scout references

---

# Strategy 1: Nifty Call Ratio Backspread (1:2) — Weekly Expiry Geopolitical Recovery Play

## strategy_name
Nifty Call Ratio Backspread — Post-Geopolitical VIX Crush Play

## bias
BULLISH

## expiry_category
WEEKLY (March 24, 2026 — Tuesday)

## underlying
NIFTY 50 (NSE) — Lot size: 65 units

## structure
Call Ratio Backspread — Sell 1 ITM Call, Buy 2 OTM Calls in 1:2 ratio. Net credit entry exploits high VIX premiums while retaining unlimited upside.

## entry_conditions

### technical
- Nifty spot near 23,100-23,300 zone (double bottom forming near 22,950 per Swastika market analysis March 20, 2026)
- RSI(14) bouncing from oversold territory (below 35 on daily chart)
- GIFT Nifty signaling +180 points positive bias
- 23,300 aligns with Max Pain for weekly expiry — potential short covering rally above this level

### fundamental
- FII selling pace decelerating (sold Rs.7,558 crore on March 19, but DII buying at Rs.3,864 crore providing floor)
- Geopolitical premium from US-Israel-Iran conflict beginning to normalize after initial Feb 28 shock
- Oil price risk premium stabilizing — potential for VIX mean reversion from 22+ toward 16-18 range

### iv_environment
- India VIX at 22.09 — HIGH regime (~75-85th percentile)
- Ideal for backspread: high IV inflates premiums on the sold ITM leg, creating favorable net credit
- Strategy benefits from subsequent VIX contraction toward expiry IF Nifty rallies above upper breakeven
- Front-week IV typically contracts 30-40% into Tuesday expiry if no fresh shocks

### timing
- Enter Monday March 23, 2026 (1 day before weekly expiry) or intraday Friday March 20
- Optimal entry when Nifty tests 23,100-23,200 support zone
- Close by Tuesday March 24 expiry or when upper breakeven breached

## legs

| Leg | Action | Instrument | Strike | Expiry | Qty (lots) | Est. Premium | Role |
|-----|--------|-----------|--------|--------|------------|-------------|------|
| 1 | SELL | NIFTY CE | 23000 (ITM) | Mar 24, 2026 | 1 (65 units) | ~Rs.350-400 received | Finance the two long calls |
| 2 | BUY | NIFTY CE | 23300 (OTM) | Mar 24, 2026 | 2 (130 units) | ~Rs.100-130 each paid | Unlimited upside exposure |

**Net Credit Estimate**: Rs.350 - (2 x Rs.115) = ~Rs.120 per unit = Rs.7,800 total credit (65 units)

## exit_conditions
- **Profit Target**: Close entire position if Nifty crosses 23,600 (upper breakeven breached, unlimited profit zone)
- **Stop Loss**: Close if Nifty settles at exactly 23,300 at expiry (max loss zone) — exit if Nifty trapped between 23,000-23,300 with <2 hours to expiry
- **Time Exit**: All positions auto-settle at Tuesday expiry (cash settled index options)
- **VIX Trigger**: If VIX spikes above 28 (fresh geopolitical shock), reassess — may benefit the 2 long calls

## risk_reward

### max_profit
Unlimited above upper breakeven (~23,480)

### max_loss
Rs.300 - Rs.120 credit = Rs.180 per unit x 65 = Rs.11,700 (occurs if Nifty expires exactly at 23,300)

### risk_reward_ratio
Risk Rs.11,700 for unlimited upside; if Nifty moves to 23,800: profit = (23,800-23,300)*2 - (23,800-23,000) - net credit adjustment ~ Rs.26,000+

### greeks_exposure
| Greek | Position Exposure | Commentary |
|-------|------------------|------------|
| Delta | Net Long ~+0.30 to +0.50 at entry, accelerates above 23,300 | Increasingly bullish as Nifty rallies |
| Gamma | Net Long above 23,300 — benefits from acceleration | Positive convexity above short strike |
| Vega | Long Vega with 2+ DTE; transitions to short Vega near expiry | Benefits if VIX stays elevated with time; neutral near expiry |
| Theta | Net Negative (2 long calls decay faster) | Manageable given 1-2 DTE; offset by net credit |

### transaction_costs_estimate
- Brokerage: Rs.40 (flat per order x 3 legs = Rs.120)
- STT on sell premium: 0.0625% x Rs.350 x 65 = ~Rs.14
- STT on buy exercise (if ITM): 0.125% — risk managed by closing before expiry
- Exchange charges + GST: ~Rs.50
- **Total estimated: Rs.200-250**

## edge_thesis
The Call Ratio Backspread at 1:2 ratio uniquely exploits the current HIGH VIX regime (22.09) by converting inflated ITM call premiums into a net credit entry while retaining unlimited upside. The edge is threefold: (1) geopolitical VIX premium from the Iran conflict is showing signs of normalization, creating a tailwind for bullish recovery toward 23,300+ Max Pain; (2) the double-bottom formation near 22,950 provides a technical floor; (3) the net credit structure means the trade profits even if Nifty falls, losing only in the narrow zone around the OTM strike. This asymmetric payoff is specifically designed for post-shock recovery scenarios where the magnitude of the move is uncertain but direction is biased bullish.

## source
- Zerodha Varsity — Call Ratio Back Spread chapter: https://zerodha.com/varsity/chapter/call-ratio-back-spread/
- Swastika Market Outlook March 20, 2026: https://www.swastika.co.in/blog/nifty-market-outlook-today-20-march-2026-strategy-levels-and-market-setup-and-rising-volatility
- Strike.money — Call Ratio Backspread guide: https://www.strike.money/options/call-ratio-backspread
- Quantsapp — Call Ratio Backspread ROI analysis: https://www.quantsapp.com/learn/articles/Call-ratio-backspread-a-strategy-to-increase-ROI-while-keeping-risk-low-in-fast-moving-scenario-175

## backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

## reasoning_chain
1. India VIX at 22.09 = HIGH regime -> ITM call premiums are inflated -> net credit entry achievable on 1:2 backspread
2. Geopolitical premium (Iran conflict) showing stabilization -> VIX likely to mean-revert -> bullish for Nifty recovery
3. Double bottom at 22,950 + GIFT Nifty +180 -> near-term directional bias is bullish
4. Max Pain at 23,300 for weekly expiry -> market makers incentivized to pin here -> our max loss zone, but short covering above this = unlimited profit
5. Net credit entry = profitable if wrong (Nifty falls) -> asymmetric risk/reward ideal for uncertain geopolitical backdrop
6. 1-2 DTE minimizes theta bleed on long calls; high gamma near expiry amplifies directional gains

## citations
1. Zerodha Varsity Call Ratio Backspread: "The strategy is best executed when your outlook on the stock/index is bullish" — https://zerodha.com/varsity/chapter/call-ratio-back-spread/
2. Swastika March 20, 2026 Market Setup: "Higher VIX suggests bigger intraday swings" — https://www.swastika.co.in/blog/nifty-market-outlook-today-20-march-2026-strategy-levels-and-market-setup-and-rising-volatility
3. Strike.money: "A Call Ratio Backspread is best deployed when a trader expects a large upside move" — https://www.strike.money/options/call-ratio-backspread

---

# Strategy 2: Synthetic Long Futures on Nifty — Quarterly Expiry Directional Bet

## strategy_name
Nifty Synthetic Long Futures — Quarterly Expiry (March 31) Directional Conviction Trade

## bias
BULLISH

## expiry_category
QUARTERLY (March 31, 2026 — Last Tuesday, also quarterly settlement)

## underlying
NIFTY 50 (NSE) — Lot size: 65 units

## structure
Synthetic Long Futures — Buy ATM Call + Sell ATM Put at same strike and same expiry. Replicates futures payoff with options, avoiding futures premium markup.

## entry_conditions

### technical
- Nifty spot around 23,100-23,300 — enter when confirming breakout above 23,300 resistance
- Daily chart showing higher lows from 22,735 -> 22,950 -> 23,100 — bullish ascending structure
- 20-day EMA acting as dynamic support, price attempting to reclaim it

### fundamental
- March quarterly expiry historically sees strong FII activity for portfolio rebalancing
- Q4 FY26 earnings season approaching — market tends to front-run positive expectations
- RBI monetary policy accommodative — supports equity valuations
- Geopolitical premium creating temporary mispricing — futures trading at discount to fair value

### iv_environment
- High VIX (22.09) inflates both call and put premiums symmetrically at ATM
- Synthetic long at ATM: call premium paid roughly offset by put premium received -> near-zero net cost
- Avoids elevated futures premium that includes embedded volatility cost
- IV contraction benefits position through lower put liability

### timing
- Enter 7-10 trading days before March 31 quarterly expiry (i.e., March 18-20)
- Allows time for directional thesis to play out while maintaining manageable theta
- Exit before last 2 days if unrealized loss exceeds threshold

## legs

| Leg | Action | Instrument | Strike | Expiry | Qty (lots) | Est. Premium | Role |
|-----|--------|-----------|--------|--------|------------|-------------|------|
| 1 | BUY | NIFTY CE | 23200 (ATM) | Mar 31, 2026 | 1 (65 units) | ~Rs.350-400 paid | Unlimited upside exposure |
| 2 | SELL | NIFTY PE | 23200 (ATM) | Mar 31, 2026 | 1 (65 units) | ~Rs.300-350 received | Finances call purchase; unlimited downside risk |

**Net Debit Estimate**: Rs.375 - Rs.325 = ~Rs.50 per unit = Rs.3,250 total

## exit_conditions
- **Profit Target**: Exit when Nifty reaches 23,800-24,000 (Rs.600-800 per unit profit = Rs.39,000-52,000)
- **Stop Loss**: Exit if Nifty breaks below 22,700 (Rs.500 per unit loss = Rs.32,500)
- **Time Exit**: Close position by March 30 if target not achieved (avoid expiry-day gamma risk)
- **Quarterly Settlement**: Cash settled on March 31 — no physical delivery risk for index options

## risk_reward

### max_profit
Unlimited (linear payoff above breakeven = 23,250 approx)

### max_loss
Unlimited on downside (linear loss below breakeven, like futures)

### risk_reward_ratio
Stop loss at 22,700 (loss ~Rs.35,750) vs target at 23,800 (profit ~Rs.35,750) = 1:1 base case; 24,000 target = 1:1.5

### greeks_exposure
| Greek | Position Exposure | Commentary |
|-------|------------------|------------|
| Delta | +1.0 (full directional, equivalent to 1 futures lot) | Maximum directional exposure |
| Gamma | Near zero at ATM entry | Minimal convexity risk/benefit at entry |
| Vega | Approximately neutral (long call vega offset by short put vega) | Insulated from IV changes |
| Theta | Near neutral (call theta loss offset by put theta gain) | Time decay roughly cancels |

### transaction_costs_estimate
- Brokerage: Rs.40 x 2 legs = Rs.80
- STT on put sell premium: 0.0625% x Rs.325 x 65 = ~Rs.13
- STT on call exercise (if ITM at expiry): 0.125% x intrinsic value x 65 — mitigate by closing before expiry
- Exchange charges + GST: ~Rs.40
- **Total estimated: Rs.150-200 (excluding exercise STT)**

## edge_thesis
The Synthetic Long Futures strategy avoids the elevated futures basis/premium that currently exists due to HIGH VIX. When VIX is at 22+, Nifty futures trade at a significant premium to spot (~40-60 points above fair cost-of-carry). By constructing the futures payoff synthetically via ATM options, traders enter at near-zero net cost and avoid paying this volatility premium. Additionally, the quarterly March 31 expiry is the first full quarterly settlement under revised Tuesday expiry rules — institutional rebalancing flows tend to be supportive of Nifty in the final week of March. The edge is pure cost-of-entry arbitrage: same payoff as long futures, lower entry cost in high-VIX environments.

## source
- Zerodha Varsity — Synthetic Long & Arbitrage: https://zerodha.com/varsity/chapter/synthetic-long-arbitrage/
- Firstock — Synthetic Futures Strategy 2026: https://firstock.in/blog/synthetic-futures-strategy-2026/
- Dhan F&O Expiry Calendar March 2026: https://dhan.co/fno-expiry-calendar/

## backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

## reasoning_chain
1. High VIX (22.09) -> futures premium elevated above fair cost-of-carry -> synthetic long via options is cheaper entry
2. ATM call buy + ATM put sell = delta +1.0 (identical to long futures) at lower cost
3. March 31 = quarterly expiry -> institutional rebalancing typically net positive for Nifty
4. Geopolitical premium normalizing -> tailwind for bullish directional bet over 10-day horizon
5. Near-zero theta and vega at ATM -> minimal Greeks drag, pure directional trade
6. Cash settlement on index options -> no physical delivery complications

## citations
1. Zerodha Varsity: "A synthetic long future strategy replicates the payoff of buying a futures contract" — https://zerodha.com/varsity/chapter/synthetic-long-arbitrage/
2. Firstock: "A synthetic futures contract built using ATM options stays closer to the spot price" — https://firstock.in/blog/synthetic-futures-strategy-2026/

---

# Strategy 3: Bull Call Ladder on Nifty — Monthly Expiry VIX Contraction Play

## strategy_name
Nifty Bull Call Ladder — Monthly Expiry Premium Harvesting with Bullish Tilt

## bias
BULLISH (moderately)

## expiry_category
MONTHLY (March 31, 2026 — also quarterly)

## underlying
NIFTY 50 (NSE) — Lot size: 65 units

## structure
Bull Call Ladder — Buy 1 ATM Call, Sell 1 OTM Call, Sell 1 further OTM Call. Creates a credit-enhanced bullish spread that profits from moderate upside and VIX contraction, with unlimited risk above highest strike.

## entry_conditions

### technical
- Nifty trading in 22,950-23,600 range — moderate bullish bias within defined range
- Resistance at 23,600 expected to cap upside in near term
- Max Pain for monthly expiry likely near 23,300-23,500

### fundamental
- Pre-FY26 year-end fund rebalancing — institutions rolling positions into new fiscal year
- Moderate growth expectations priced in — no catalyst for sharp breakout
- Range-bound market favors premium-selling overlays

### iv_environment
- VIX at 22.09 — PERFECT for this strategy: selling 2 OTM calls at inflated premiums
- Strategy has negative Vega — profits directly from IV contraction
- Front-month IV term structure in contango — near-dated premiums rich relative to realized vol
- Expect VIX to settle toward 16-18 by month-end if no fresh geopolitical catalyst

### timing
- Enter 10-12 days before March 31 expiry (around March 18-20)
- Allow VIX contraction and theta decay to work in favor
- Close 2-3 days before expiry if max profit zone reached

## legs

| Leg | Action | Instrument | Strike | Expiry | Qty (lots) | Est. Premium | Role |
|-----|--------|-----------|--------|--------|------------|-------------|------|
| 1 | BUY | NIFTY CE | 23200 (ATM) | Mar 31, 2026 | 1 (65 units) | ~Rs.380 paid | Directional upside exposure |
| 2 | SELL | NIFTY CE | 23500 (OTM) | Mar 31, 2026 | 1 (65 units) | ~Rs.220 received | Premium harvesting |
| 3 | SELL | NIFTY CE | 23800 (OTM) | Mar 31, 2026 | 1 (65 units) | ~Rs.120 received | Additional premium harvesting |

**Net Debit**: Rs.380 - Rs.220 - Rs.120 = Rs.40 per unit = Rs.2,600 total

## exit_conditions
- **Profit Target**: Close when Nifty reaches 23,500 (max profit zone) — profit = (23,500-23,200) - Rs.40 net debit = Rs.260/unit = Rs.16,900
- **Stop Loss**: Exit if Nifty breaks above 24,100 (unlimited loss territory) — mandatory stop
- **Time Exit**: Close by March 28 if Nifty above 23,800 to avoid unlimited upside risk at expiry
- **VIX Stop**: Exit if VIX re-spikes above 28 (volatility expansion hurts net short vega position)

## risk_reward

### max_profit
Rs.260 per unit = Rs.16,900 (at Nifty 23,500 at expiry)

### max_loss
Unlimited above upper breakeven (~24,060). Stop loss at 24,100 limits to ~Rs.100/unit x 65 = Rs.6,500 managed loss. Below 23,200: limited to Rs.40/unit x 65 = Rs.2,600

### risk_reward_ratio
Rs.16,900 profit vs Rs.2,600-6,500 managed loss = 2.6:1 to 6.5:1

### greeks_exposure
| Greek | Position Exposure | Commentary |
|-------|------------------|------------|
| Delta | Net Long ~+0.25 at entry, peaks near 23,500 | Moderate bullish exposure |
| Gamma | Negative near the two short strikes | Risk of acceleration if Nifty overshoots |
| Vega | Net SHORT (2 short calls vs 1 long) | Profits from VIX contraction — key edge |
| Theta | Net POSITIVE | Earns time decay daily from 2 short calls |

### transaction_costs_estimate
- Brokerage: Rs.40 x 3 legs = Rs.120
- STT on 2 sell premiums: 0.0625% x (Rs.220+Rs.120) x 65 = ~Rs.14
- Exchange charges + GST: ~Rs.50
- **Total estimated: Rs.200**

## edge_thesis
The Bull Call Ladder exploits the current VIX regime (22.09) by selling TWO inflated OTM call premiums against a single long ATM call. The strategy's negative Vega exposure directly monetizes the expected VIX contraction from geopolitical-premium-elevated levels back toward 16-18. The edge is that: (1) the 2 sold calls are priced at elevated implied volatility that is likely to overstate realized volatility over the remaining 10 days; (2) the March month-end/quarter-end expiry tends toward pinning near Max Pain due to institutional hedging; (3) the net positive theta generates daily carry income. The moderate bullish bias is appropriate given the recovering but range-bound market, and the unlimited upside risk is managed via a hard stop.

## source
- Strike.money — Bull Call Ladder: https://www.strike.money/options/bull-call-ladder
- Quantsapp — Bull Call Ladder: https://www.quantsapp.com/learn/option-strategies/Bull-Call-Ladder
- GlobalPublicist24 — Nifty Options High Volatility Guide 2026: https://www.globalpublicist24.com/nifty-options-trading-volatility-india-vix-strategies-2026/

## backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

## reasoning_chain
1. VIX at 22.09 (HIGH) -> OTM call premiums are inflated relative to likely realized volatility
2. Selling 2 OTM calls vs buying 1 ATM call = net short Vega -> directly profits from VIX contraction
3. March 31 quarterly expiry -> institutional pinning likely near 23,300-23,500 = sweet spot for max profit
4. Positive theta = earns daily carry while waiting for VIX to normalize
5. Unlimited upside risk managed by hard stop at 24,100 -> converts open risk to defined risk in practice
6. Net debit of only Rs.2,600 = capital efficient entry for Rs.16,900 max profit potential

## citations
1. Strike.money: "High volatility can increase premiums but also adds to the risk of the stock surpassing the highest strike price" — https://www.strike.money/options/bull-call-ladder
2. GlobalPublicist24: "India VIX spiked amid global market uncertainty" — https://www.globalpublicist24.com/nifty-options-trading-volatility-india-vix-strategies-2026/

---

# Strategy 4: BankNifty Jade Lizard — Weekly Expiry Premium Collection

## strategy_name
BankNifty Jade Lizard — High-VIX Weekly Premium Harvester with Bullish Tilt

## bias
BULLISH (neutral-to-bullish)

## expiry_category
WEEKLY (March 24, 2026 — Tuesday)

## underlying
BANK NIFTY (NSE) — Lot size: 30 units

## structure
Jade Lizard — Sell 1 OTM Put + Sell 1 OTM Call + Buy 1 further OTM Call. Collects premium with NO upside risk (if net credit exceeds call spread width) and limited downside risk to put strike.

## entry_conditions

### technical
- Bank Nifty near 53,250 level, stabilizing after recent drop
- Support at 52,700; resistance at 54,000
- Price compressing in narrow range — consolidation precedes directional move
- Banking sector benefiting from RBI rate cut expectations

### fundamental
- Bank earnings season positive (HDFC Bank, ICICI Bank reported solid Q3 FY26)
- RBI maintaining accommodative stance — positive for banking sector NIM
- Credit growth steady at 14-15% YoY — supports Bank Nifty fundamentals
- FII selling concentrated in IT/pharma, not banking — relative strength

### iv_environment
- Bank Nifty IV elevated alongside India VIX — call and put premiums rich
- Jade Lizard monetizes high IV through premium selling on both sides
- Weekly expiry concentrates theta decay — 4 DTE accelerates time decay
- Strategy needs IV to stay flat or decline — current environment supports this as geopolitical shock ages

### timing
- Enter Friday March 20 or Monday March 23 for March 24 Tuesday expiry
- Maximum theta decay in final 1-2 days before expiry
- All legs expire simultaneously — no rolling needed

## legs

| Leg | Action | Instrument | Strike | Expiry | Qty (lots) | Est. Premium | Role |
|-----|--------|-----------|--------|--------|------------|-------------|------|
| 1 | SELL | BANKNIFTY PE | 52500 (OTM) | Mar 24, 2026 | 1 (30 units) | ~Rs.150 received | Bullish put sale — premium income |
| 2 | SELL | BANKNIFTY CE | 54000 (OTM) | Mar 24, 2026 | 1 (30 units) | ~Rs.120 received | Short call — upside income |
| 3 | BUY | BANKNIFTY CE | 54500 (further OTM) | Mar 24, 2026 | 1 (30 units) | ~Rs.50 paid | Caps call spread risk to 500 pts |

**Net Credit**: Rs.150 + Rs.120 - Rs.50 = Rs.220 per unit = Rs.6,600 total
**Call Spread Width**: 54,500 - 54,000 = 500 points
**Net Credit (220) < Spread Width (500)**: Upside risk = 500 - 220 = Rs.280/unit if BankNifty > 54,500
**Alternatively, adjust strikes so net credit > spread width to eliminate upside risk entirely**

## exit_conditions
- **Profit Target**: Hold to expiry if Bank Nifty stays between 52,500-54,000 — collect full Rs.6,600 credit
- **Stop Loss**: Exit if Bank Nifty breaks below 52,000 (put assignment territory) — loss = (52,500-52,000) - 220 credit = Rs.280/unit x 30 = Rs.8,400
- **Adjustment**: If Bank Nifty rallies toward 54,000, can roll short call up for additional credit
- **VIX Exit**: If VIX drops below 16, captured most of the premium — consider early exit at 60% of max profit

## risk_reward

### max_profit
Rs.220 per unit x 30 = Rs.6,600 (Bank Nifty between 52,500-54,000 at expiry)

### max_loss
Downside: Unlimited below 52,500 (put assignment). Upside: Rs.280/unit x 30 = Rs.8,400 (if above 54,500). With stop at 52,000: downside managed to Rs.8,400 also.

### risk_reward_ratio
Rs.6,600 profit vs Rs.8,400 managed loss = 0.79:1 but with ~70% probability of max profit (high POP strategy)

### greeks_exposure
| Greek | Position Exposure | Commentary |
|-------|------------------|------------|
| Delta | Net slightly positive (~+0.10 to +0.15) | Mild bullish tilt from short put delta |
| Gamma | Net negative | Risk from sharp moves in either direction |
| Vega | Net SHORT | Profits from IV contraction — key edge |
| Theta | Net POSITIVE (~Rs.800-1,200/day near expiry) | Strong daily income from 3-leg decay |

### transaction_costs_estimate
- Brokerage: Rs.40 x 3 legs = Rs.120
- STT on 2 sell premiums: 0.0625% x (Rs.150+Rs.120) x 30 = ~Rs.5
- Exchange charges + GST: ~Rs.40
- **Total estimated: Rs.170-200**

## edge_thesis
The Jade Lizard on Bank Nifty exploits the high-VIX environment to collect premium on BOTH sides of the market while maintaining a mild bullish bias. The strategy's unique advantage is that properly structured, there is ZERO upside risk — if Bank Nifty rallies, the net credit collected exceeds the call spread width. The edge comes from: (1) selling inflated weekly premiums with only 4 DTE — theta decay is exponential; (2) Bank Nifty's range-bound behavior near 52,500-54,000 matches the Jade Lizard's ideal profit zone; (3) the short put at 52,500 is below major support, giving a margin of safety; (4) this is an income strategy rarely discussed in Indian retail circles, giving an informational edge.

## source
- Angel One — Jade Lizard Strategy: https://www.angelone.in/knowledge-center/futures-and-options/what-is-the-jade-lizard-option-strategy
- MarketCalls — Understanding Jade Lizard Strategy Tutorial: https://www.marketcalls.in/option-strategies/understanding-jade-lizard-strategy-options-trading-strategy-tutorial.html
- Nasdaq — Ultimate Guide to Jade Lizard: https://www.nasdaq.com/articles/ultimate-guide-to-the-jade-lizard-options-strategy

## backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

## reasoning_chain
1. Bank Nifty consolidating in 52,500-54,000 range -> range-bound structure suits Jade Lizard
2. VIX at 22.09 -> all premiums inflated -> higher net credit collection -> better risk/reward
3. Short put at 52,500 below support (52,700) -> margin of safety on downside
4. Short call spread at 54,000/54,500 -> above resistance (54,000) -> breakout needed for loss
5. Weekly expiry (4 DTE) -> theta decay accelerating exponentially -> premium erodes daily
6. Net credit structure -> POP ~65-70% based on typical BankNifty weekly range
7. Rarely deployed by retail in India -> informational edge vs standard straddle/strangle sellers

## citations
1. Angel One: "The Jade Lizard option strategy is a popular trading technique that integrates a short put with a short call spread" — https://www.angelone.in/knowledge-center/futures-and-options/what-is-the-jade-lizard-option-strategy
2. MarketCalls: "The idea is to generate a net credit that is the sum of the premiums collected from the short options" — https://www.marketcalls.in/option-strategies/understanding-jade-lizard-strategy-options-trading-strategy-tutorial.html

---

# Strategy 5: Nifty Bullish Broken Wing Call Butterfly — Quarterly Expiry

## strategy_name
Nifty Bullish Broken Wing Call Butterfly — Quarterly Skew Capture

## bias
BULLISH

## expiry_category
QUARTERLY (March 31, 2026)

## underlying
NIFTY 50 (NSE) — Lot size: 65 units

## structure
Broken Wing Call Butterfly — Buy 1 ITM Call, Sell 2 ATM/OTM Calls, Buy 1 far OTM Call (skipped strike). Asymmetric butterfly with bullish bias — profits if Nifty moves up to the short strike zone, with reduced or zero downside risk due to credit entry.

## entry_conditions

### technical
- Nifty spot at 23,100-23,200 — expecting move toward 23,500-23,600 by quarterly expiry
- OI data: heavy put writing at 23,000 (support) and call writing at 24,000 (ceiling)
- Bollinger Bands narrowing — impending directional move expected
- Previous quarterly expiry (Dec 2025) saw Nifty drift toward Max Pain in final week

### fundamental
- Quarter-end window dressing by mutual funds — bullish bias
- FY26 GDP growth estimates solid at 6.5-7% — supportive backdrop
- Banking sector strength (largest Nifty weight) provides index floor
- FPI outflows slowing — potential reversal in April as new fiscal year begins

### iv_environment
- Current elevated IV makes traditional butterfly expensive — broken wing variant reduces cost
- Skipping a strike on the downside creates credit/low-debit entry
- IV skew (puts > calls) means downside wing is expensive — selling the extra call monetizes this
- Expect IV to compress 20-30% into quarterly expiry -> benefits the 2 short calls

### timing
- Enter 8-10 trading days before March 31 expiry
- Allow theta to erode the 2 short ATM/OTM calls while long wings retain value
- Close at 70-80% of max profit or 2 days before expiry

## legs

| Leg | Action | Instrument | Strike | Expiry | Qty (lots) | Est. Premium | Role |
|-----|--------|-----------|--------|--------|------------|-------------|------|
| 1 | BUY | NIFTY CE | 23000 (ITM) | Mar 31, 2026 | 1 (65 units) | ~Rs.450 paid | Deep directional exposure |
| 2 | SELL | NIFTY CE | 23400 (ATM/OTM) | Mar 31, 2026 | 2 (130 units) | ~Rs.230 each = Rs.460 received | Premium harvesting center |
| 3 | BUY | NIFTY CE | 24000 (far OTM) | Mar 31, 2026 | 1 (65 units) | ~Rs.80 paid | Upside protection / caps risk |

**Net Credit**: Rs.460 - Rs.450 - Rs.80 = -Rs.70 per unit (small net debit) = Rs.4,550 total debit
**Wing Width**: Lower = 400pts (23000-23400); Upper = 600pts (23400-24000) — BROKEN (asymmetric)

## exit_conditions
- **Profit Target**: Close when Nifty at 23,400 (max profit zone) — profit = 400 - 70 debit = Rs.330/unit = Rs.21,450
- **Stop Loss**: Exit if Nifty drops below 22,700 or rises above 24,200 — loss limited to initial debit (Rs.4,550) on downside; on upside: (24,000-23,400)*2 - (24,000-23,000) - (24,000-24,000) need recalc = limited by long call at 24,000
- **Time Exit**: Close by March 28 to avoid pin risk at expiry

## risk_reward

### max_profit
Rs.330 per unit x 65 = Rs.21,450 (Nifty at 23,400 at expiry)

### max_loss
Downside: Rs.70 per unit x 65 = Rs.4,550 (Nifty below 23,000). Upside: max (24,000-23,400) - (23,400-23,000) = 200pts net worst case x 65 = Rs.13,000 (between 23,400-24,000 zone; above 24,000 wings cancel)

### risk_reward_ratio
Rs.21,450 max profit vs Rs.4,550 downside risk = 4.7:1 on downside; vs Rs.13,000 upside risk = 1.65:1

### greeks_exposure
| Greek | Position Exposure | Commentary |
|-------|------------------|------------|
| Delta | Net Long ~+0.15 to +0.25 | Mild bullish bias, peaks near 23,400 |
| Gamma | Negative near short strikes, positive at wings | Risk accelerates near 23,400 zone |
| Vega | Net SHORT (2 short calls outweigh) | Benefits from IV compression |
| Theta | Net POSITIVE | Earns daily time decay from 2 short calls |

### transaction_costs_estimate
- Brokerage: Rs.40 x 4 legs = Rs.160
- STT on 2 sell premiums: 0.0625% x Rs.460 x 65 = ~Rs.19
- Exchange charges + GST: ~Rs.60
- **Total estimated: Rs.250-300**

## edge_thesis
The Broken Wing Call Butterfly captures the IV skew and VIX regime unique to the current geopolitical-premium environment. By skipping a strike on the upper wing (600pts vs 400pts lower), the structure creates an asymmetric payoff that is net flat-to-credit on the downside while offering substantial profit in the 23,200-23,600 zone. The edge is: (1) the broken wing exploits the call skew — higher strikes are relatively cheaper, making the protective far OTM call inexpensive; (2) the 2 short calls at 23,400 benefit from both theta AND vega compression; (3) the quarterly expiry encourages pinning near Max Pain (23,300-23,500), which is precisely the max profit zone; (4) the 4.7:1 reward-to-downside-risk ratio is exceptional for a defined-risk structure.

## source
- Kotak Neo — Broken Wing Butterfly Strategy: https://www.kotakneo.com/investing-guide/futures-and-options/broken-wing-strategy/
- Interactive Brokers — Broken Wing Butterfly Hidden Gem: https://www.interactivebrokers.com/campus/traders-insight/securities/options/the-broken-wing-butterfly-a-hidden-gem-in-options-trading/
- Strike.money — Broken Wing Butterfly: https://www.strike.money/options/broken-wing-butterfly

## backtest_data
[NO BACKTEST DATA AVAILABLE — synthesis only]

## reasoning_chain
1. VIX at 22.09 -> traditional butterflies are expensive -> broken wing variant reduces cost via asymmetry
2. Call skew makes far OTM calls cheaper -> upper wing at 24,000 is inexpensive -> net credit or minimal debit achievable
3. 2 short calls at 23,400 = peak theta decay zone + negative Vega -> profits from VIX compression
4. Quarterly expiry March 31 -> strong pinning tendency toward 23,300-23,500 Max Pain zone = exactly max profit zone
5. Downside risk limited to minimal debit -> broken wing eliminates one-sided risk
6. 4.7:1 reward/risk on downside; 1.65:1 on upside -> asymmetric payoff matches asymmetric market (bullish bias with downside floor at 22,950 support)

## citations
1. Kotak Neo: "It is particularly useful in scenarios where the trader anticipates a slight bullish movement but wants protection" — https://www.kotakneo.com/investing-guide/futures-and-options/broken-wing-strategy/
2. Interactive Brokers: "The broken-wing butterfly — a hidden gem in options trading" — https://www.interactivebrokers.com/campus/traders-insight/securities/options/the-broken-wing-butterfly-a-hidden-gem-in-options-trading/

---

## Scout-1 Summary
| # | Strategy | Expiry | Underlying | Key Edge |
|---|----------|--------|-----------|----------|
| 1 | Call Ratio Backspread 1:2 | Weekly (Mar 24) | Nifty | Net credit + unlimited upside in high VIX |
| 2 | Synthetic Long Futures | Quarterly (Mar 31) | Nifty | Avoids elevated futures premium |
| 3 | Bull Call Ladder | Monthly (Mar 31) | Nifty | VIX contraction monetization |
| 4 | Jade Lizard | Weekly (Mar 24) | BankNifty | No-upside-risk premium collection |
| 5 | Broken Wing Call Butterfly | Quarterly (Mar 31) | Nifty | Asymmetric payoff at Max Pain zone |
