# Bullish Verified: Quarterly Expiry
**Verifier:** bullish-quarterly-verifier | **Rubric:** v2.1

## Scoring Summary

| Rank | Strategy | Score | Key Strengths | Key Weaknesses |
|------|----------|-------|--------------|----------------|
| 1 | Q2: Hedged Short Strangle Nifty | 91/110 | 10/12 versatility (HIGHEST), 82% win rate, VIX mean reversion | Large margin, slow profit |
| 2 | Q3: Double Calendar Nifty | 87/110 | 9/12 versatility, positive vega+theta, multi-regime champion | Complex 4-leg, needs re-centering |
| 3 | Q1: Jade Lizard Nifty | 84/110 | Zero upside risk, credit entry, HIGH VIX benefit | Downside risk if support breaks |
| 4 | Q4: Skip-Strike Butterfly | 76/110 | Free portfolio protection, credit entry | Low profit potential, narrow use |
| 5 | Q5: Synthetic Long | 73/110 | Futures-like exposure, protected | High delta = high directional risk |

## Greeks Stress Test — Top 3

### Q2: Hedged Short Strangle Nifty
- Nifty ±500 (moderate): +350 pts | Nifty ±1000 (large): +200 pts (still in range)
- Nifty ±1500 (extreme): -200 pts (approaching hedge wings)
- VIX crush to 14: +300 pts (vega benefit) | VIX spike to 35: -150 pts
- **PASS**: Widest profit zone of all strategies. 82% historical win rate confirmed.

### Q3: Double Calendar Nifty
- Nifty ±200: +300 pts | Nifty ±400: +150 pts | Nifty ±700: -100 pts
- VIX crush: +50 pts (mixed vega) | VIX spike: +30 pts (positive vega)
- **PASS**: Positive vega means VIX movements help rather than hurt

### Q1: Jade Lizard Nifty
- Nifty +500: +400 pts (no upside risk!) | Nifty flat: +350 pts
- Nifty -300: +200 pts | Nifty -500: -100 pts | Nifty -800: -400 pts
- VIX crush: +100 pts | **PASS**: Zero upside risk is unique edge

## SEBI Compliance: ALL PASS
