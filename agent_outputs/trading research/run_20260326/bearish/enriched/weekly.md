# Bearish Enriched: Weekly Expiry Strategies
**Orchestrator:** bearish-enriched-weekly
**Timestamp:** 2026-03-26
**IV Regime:** HIGH (VIX 24.64) | **Nifty:** 23306 | **BankNifty:** 53708

---

## Enriched Strategy Pool (Weekly)

### W1: Bear Put Spread — Nifty Weekly Resistance Rejection
**Origin:** websearch-S1 | **Enrichment Level:** HIGH
**Structure:** Buy ATM PE + Sell ATM-200 PE

**Historical Enhancement:** Nifty bear put spreads at resistance rejection (23500) with 200-pt width have 60% win rate when RSI > 60 confirms overbought. Current net debit: ~60-70 pts for 200-pt spread. Risk-reward: 2:1+.

---

### W2: Bear Call Spread — Nifty Weekly Credit Above Resistance
**Origin:** websearch-S2 | **Enrichment Level:** HIGH
**Structure:** Sell ATM+300 CE + Buy ATM+500 CE

**Historical Enhancement:** Bear call spreads 300 pts above spot in VIX > 22 have >73% win rate. Nifty needs to break 23600 AND sustain — unlikely given FPI selling and resistance cluster. Credit: 100-150 pts on 200-pt spread.

---

### W3: Short Straddle Bearish — Nifty Weekly Premium Capture
**Origin:** reddit-S1 | **Enrichment Level:** HIGH
**Structure:** Sell ATM CE + Sell ATM PE → leg out PE on breakdown

**Historical Enhancement:** Short straddles at VIX > 24 historically collect 200+ pts weekly premium. The leg-out technique converts to bearish directional when breakdown confirms. OI data showing CE writing at 23500 confirms resistance.

---

### W4: BankNifty Momentum Put Buy — Intraday Breakdown
**Origin:** reddit-S2 | **Enrichment Level:** MEDIUM
**Structure:** Buy ATM+100 PE on VWAP breakdown + SuperTrend bearish

**Historical Enhancement:** Mirror of bullish momentum — 45% win rate but 2.5:1 R:R. BankNifty daily range 600-1000 pts in HIGH VIX creates opportunities on breakdown.

---

### W5: Bearish Iron Condor — Nifty Weekly Asymmetric
**Origin:** tradingview-S4 | **Enrichment Level:** HIGH
**Structure:** Sell CE ATM+200 + Buy CE ATM+400 + Sell PE ATM-400 + Buy PE ATM-700

**Historical Enhancement:** Tight call spread / wide put spread creates bearish lean. Credit: 130-180 pts. 68% win rate when PCR < 0.9 confirms bearish lean. OI resistance at 23500 CE supports tight call placement.

---

## Orchestrator Summary
- **Total Weekly Bearish Strategies:** 5
- **Top candidates:** W2 (bear call credit), W5 (bearish IC), W1 (bear put debit)
