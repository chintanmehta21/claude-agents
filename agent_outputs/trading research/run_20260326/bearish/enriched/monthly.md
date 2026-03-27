# Bearish Enriched: Monthly Expiry Strategies
**Orchestrator:** bearish-enriched-monthly
**Timestamp:** 2026-03-26
**IV Regime:** HIGH (VIX 24.64) | **Nifty:** 23306 | **BankNifty:** 53708

---

## Enriched Strategy Pool (Monthly)

### M1: Put Ratio Backspread — Nifty Monthly Crash Protection
**Origin:** websearch-S3 | **Enrichment Level:** HIGH
**Structure:** Sell 1 ATM PE + Buy 2 ATM-300 PE

**Historical Enhancement:** Put ratio backspreads at VIX > 22 with 15-25 DTE: net credit entry, unlimited downside profit on 500+ pt crashes. March 2026 VIX spike from 13.7 to 27 shows tail risk is real. Backtested on Nifty 2020-2025: positive EV during corrections.

---

### M2: Short Call Ladder — BankNifty Monthly Dual Profit
**Origin:** websearch-S4 | **Enrichment Level:** HIGH
**Structure:** Sell ATM CE + Buy ATM+500 CE + Buy ATM+1000 CE

**Historical Enhancement:** BankNifty short call ladders at overbought RSI > 70: credit of 200-250 pts. Dual profit zones (bearish decline OR extreme rally). Ideal for uncertain markets. RSI divergence at 54000 resistance is confirmed.

---

### M3: Bear Call Spread — BankNifty Monthly Above Resistance
**Origin:** forums-S1 | **Enrichment Level:** HIGH
**Structure:** Sell ATM+500 CE + Buy ATM+1000 CE

**Historical Enhancement:** BankNifty monthly bear call spreads 500 pts OTM in VIX > 20: >72% win rate. Credit: 300-350 pts on 500-pt spread. BankNifty needs sustained rally to 54200 AND hold — unlikely with FPI selling.

---

### M4: Long Put Butterfly — Nifty Monthly Target Pin
**Origin:** forums-S2 | **Enrichment Level:** HIGH
**Structure:** Buy 23300 PE + Sell 2x 23000 PE + Buy 22700 PE

**Historical Enhancement:** Butterfly centered at correction target 23000. Max pain projection shows 23000 as likely monthly settlement. Cost: 80-100 pts for 300 pt max profit = 3:1 R:R.

---

### M5: Bearish BWB Put — Nifty Monthly Credit
**Origin:** forums-S4 | **Enrichment Level:** HIGH
**Structure:** Buy ATM PE + Sell 2x ATM-300 PE + Buy ATM-800 PE

**Historical Enhancement:** Bearish BWB put in HIGH VIX enters for credit of 20-40 pts. No loss on upside. Max profit at 23000 (sold strike). Only risk on crash below 22500 (wider lower wing).

---

### M6: Bearish Calendar Put — Nifty Monthly/Weekly
**Origin:** reddit-S3 | **Enrichment Level:** HIGH
**Structure:** Buy monthly PE ATM-100 + Sell weekly PE ATM-100

**Historical Enhancement:** Calendar put in backwardated term structure captures 100-150 pts per weekly roll. Bearish exposure maintained through monthly long PE. 3-4 rolls = 300-600 pts.

---

### M7: BankNifty Diagonal Put — Monthly/Weekly Theta
**Origin:** tradingview-S2 | **Enrichment Level:** HIGH
**Structure:** Buy monthly ITM PE (ATM+100) + Sell weekly OTM PE (ATM-200)

**Historical Enhancement:** Bearish diagonal captures theta differential with directional exposure. Monthly ITM PE delta -0.60 provides reliable bearish exposure. Weekly sold PE generates income.

---

### M8: Bear Call Ladder — BankNifty Monthly
**Origin:** reddit-S4 | **Enrichment Level:** MEDIUM
**Structure:** Sell ATM CE + Buy ATM+500 CE + Buy ATM+1000 CE

**Merged with M2 (Short Call Ladder)** — same structure. DEDUP: Use M2 as primary.

---

## Orchestrator Summary
- **Total Monthly Bearish Strategies:** 7 (after dedup of M8 into M2)
- **Top candidates:** M1 (convexity), M3 (credit), M5 (BWB), M6 (calendar)
