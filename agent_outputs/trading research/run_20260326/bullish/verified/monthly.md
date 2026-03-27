# Bullish Verified: Monthly Expiry
**Verifier:** bullish-monthly-verifier | **Rubric:** v2.1

## Scoring Summary

| Rank | Strategy | Score | Key Strengths | Key Weaknesses |
|------|----------|-------|--------------|----------------|
| 1 | M6: Iron Butterfly BNF | 88/110 | Highest theta (6-12 pts/day), 4:1 R:R, HIGH VIX fit, 8/12 versatility | Gamma risk near expiry, needs active management |
| 2 | M3: BWB Call Nifty | 86/110 | Credit entry, 8/12 versatility, range-bound profit, no downside risk | Limited profit zone, complex 4-leg |
| 3 | M4: Bull Put Spread Nifty | 84/110 | Near-zero max loss (credit ≈ spread), 75%+ win rate, simple | Limited upside, single direction |
| 4 | M1: Call Ratio Backspread | 82/110 | Unlimited upside, positive gamma/vega, convexity | Negative theta, needs large move |
| 5 | M2: Diagonal Call Nifty | 80/110 | Theta engine, 7/12 versatility, rolling income | Complex management, needs trend |
| 6 | M8: Calendar Call BNF | 79/110 | 9/12 versatility, theta capture | Needs re-centering, complex |
| 7 | M5: Butterfly BNF | 77/110 | 4:1 R:R, low cost | Needs exact pin, narrow profit zone |
| 8 | M7: Bull Call Ladder | 72/110 | Near-zero cost | Unlimited upside risk if unhedged |

## Greeks Stress Test — Top 3

### M6: Iron Butterfly BNF
- BNF +300: +200 pts (profit zone) | BNF -300: +200 pts | BNF ±500: -100 pts (wing breach)
- VIX crush -5: +100 pts (massive IV benefit) | VIX spike +5: -50 pts
- **PASS**: Greeks profile favorable in 8/12 regimes

### M3: BWB Call Nifty
- Nifty +200: +160 pts (max profit zone) | Nifty -200: +30 pts (credit retained)
- Nifty +600: -50 pts (beyond upper wing) | VIX crush: +40 pts
- **PASS**: No downside risk, credit entry protects

### M4: Bull Put Spread Nifty
- Nifty +200: +340 pts (max profit) | Nifty flat: +280 pts
- Nifty -300: +100 pts (still above sold strike) | Nifty -600: -60 pts max loss
- **PASS**: Excellent risk definition

## SEBI Compliance: ALL PASS
All strategies use European cash-settled index options with proper margin, lot sizes, and no naked selling.

## Failure Mode Summary
- M6: Pin risk at expiry, gamma explosion in last 3 days → mitigated by 3 DTE exit
- M3: Exact pin unlikely → mitigated by 50-60% profit target
- M4: Flash crash below 22800 → mitigated by defined spread width
