---
name: Correlation Deduplicator
description: This skill should be used when computing strategy-level similarity scores across scout outputs, detecting duplicate or alias strategies, resolving cross-scout redundancy, or ensuring the final top-3 selection does not contain highly correlated strategies representing the same effective market bet. Trigger phrases include "deduplication", "duplicate strategy", "similar strategies", "correlation check", "redundant strategies", "same market bet", "alias strategy".
version: 1.0.0
---

# Correlation Deduplicator — Strategy Similarity & Deduplication Skill

## Purpose

Computes strategy-level similarity scores across all scout outputs to detect duplicates, aliases (same strategy with different names), and highly correlated strategies that represent the same effective market bet. Prevents the final top-3 from containing redundant selections. Used during Orchestrator enrichment and Lead final synthesis.

## Stakeholder

Used by **Orchestrators** during the consolidation phase (before enrichment) to remove duplicates across scout outputs. Used by the **Project Lead** during final top-3 selection to ensure the winning strategies represent distinct market views. Referenced by **Verifiers** when noting similar strategies in their assessment.

## Instructions

### 1. Deduplication Rubric

Two strategies are considered **duplicates** when ALL three conditions are met:

| Condition | Match Criteria | Example |
|-----------|---------------|---------|
| **Same underlying** | Identical instrument (Nifty = Nifty, BankNifty = BankNifty) | Both target Nifty 50 |
| **Same structure** | Identical option structure (same number of legs, same buy/sell pattern, same option types) | Both are bull call spreads |
| **Same expiry type** | Same expiry category (Weekly, Monthly, or Quarterly) | Both target weekly expiry |

**If all three match → DUPLICATE**

### 2. Alias Detection

Aliases are strategies with different names but identical functional definitions. Common alias patterns:

| Alias Group | Variant Names |
|------------|---------------|
| Bull Call Spread | Long Call Spread, Debit Call Spread, Call Vertical (bullish) |
| Bear Put Spread | Long Put Spread, Debit Put Spread, Put Vertical (bearish) |
| Iron Condor | Short Iron Condor, Range-Bound Condor, Non-Directional Condor |
| Short Straddle | ATM Straddle Write, Sell Straddle, Neutral Premium Collection |
| Short Strangle | OTM Strangle Write, Sell Strangle, Wide Premium Collection |
| Butterfly | Long Butterfly, Call Butterfly, Put Butterfly (all structurally similar with different legs) |
| Jade Lizard | Twisted Sister (in some communities), Modified Short Put |
| Ratio Spread | 1x2 Spread, Ratio Call/Put Spread, Backspread (depending on direction) |

**Alias detection protocol:**
1. Normalize strategy names: lowercase, remove "strategy", "trade", "play"
2. Compare against known alias groups above
3. If names match an alias group, verify by comparing leg structures
4. If leg structures also match → confirmed alias duplicate

### 3. Structural Similarity Scoring

For strategies that don't meet the exact duplicate criteria but may be highly correlated, compute a structural similarity score:

**Scoring dimensions (0-3 each, max 15):**

| Dimension | 0 (Different) | 1 (Similar) | 2 (Very Similar) | 3 (Identical) |
|-----------|---------------|-------------|-------------------|---------------|
| Underlying | Different instruments | Same sector (e.g., both bank stocks) | Same index family (Nifty vs. Nifty Bank) | Same instrument |
| Direction | Opposite bias (Bull vs. Bear) | Same bias, different mechanism | Same bias, similar mechanism | Same bias and structure |
| Leg structure | Different number of legs | Same legs, different types (CE vs PE) | Same legs, same types, different strikes | Identical leg structure |
| Expiry | Different expiry type | Same type, different specific expiry | Same expiry, different DTE window | Same expiry and DTE |
| Entry logic | Completely different triggers | Same indicator family, different values | Same indicator, similar values | Same entry conditions |

**Similarity thresholds:**
- Score 13-15: **HIGH CORRELATION** — same effective market bet (flag for dedup)
- Score 10-12: **MODERATE CORRELATION** — similar but distinct (warn, keep both)
- Score 0-9: **LOW CORRELATION** — sufficiently distinct (no action)

### 4. Deduplication Process

**Phase 1: Exact duplicate removal (Orchestrator)**

1. Load all scout outputs for one bias (e.g., all bullish scout files)
2. Build a strategy index: `{underlying}_{structure}_{expiry_type}` as the key
3. Group strategies with identical keys → these are exact duplicates
4. For each duplicate group, keep the best version using this priority:
   a. **Evidence quality:** Empirical backtest > community anecdote > hypothesis
   b. **Detail level:** More complete entry/exit conditions wins
   c. **Source recency:** More recent source wins
   d. **Source credibility:** Published article > forum post > single comment
5. Log all deduplication decisions with reasoning

**Phase 2: Alias deduplication (Orchestrator)**

1. For all remaining strategies, check against alias groups
2. If two strategies are alias matches AND target the same underlying + expiry: deduplicate
3. Same priority rules as Phase 1

**Phase 3: Correlation check for final selection (Lead)**

1. After Verifiers score strategies, before top-3 selection
2. Compute pairwise structural similarity for the top-5 candidates per category
3. If any pair scores 13+ (HIGH CORRELATION):
   - Keep the one with higher confidence score
   - Replace the other with the next-best non-correlated candidate
   - Log: `[CORRELATION_DEDUP: "[Strategy A]" and "[Strategy B]" represent the same effective market bet (similarity: X/15). Keeping [A] (score: Y), replacing [B] with [C]]`

### 5. Cross-Scout Redundancy Patterns

Common redundancy patterns to watch for:

| Pattern | Example | Resolution |
|---------|---------|------------|
| **Source echo** | WebSearch scout finds a blog post that quotes a Reddit thread the Reddit scout also found | Trace to original source; keep the version closest to the original |
| **Strategy family** | Scout-1 finds a bull call spread on Nifty; Scout-3 finds a "modified bull call spread" on Nifty with one additional leg | These are DISTINCT if the modification changes the risk profile; keep both |
| **Timeframe variant** | Same strategy but one targets weekly, other targets monthly | These are DISTINCT — different expiry categories by definition |
| **Width variant** | Same spread on same instrument but different strike widths | These are SIMILAR — keep the one with better risk-reward documentation |
| **Naming confusion** | "Nifty Call Butterfly" vs. "Nifty Long Butterfly" | Check leg structures — if identical, it's an alias duplicate |

### 6. Output Format

Document deduplication results in the enriched output:

```markdown
#### Deduplication Report
- **Strategies ingested:** [count]
- **Exact duplicates removed:** [count]
  - [Strategy A] (Reddit) ≡ [Strategy B] (Forum) → Kept A (better evidence)
- **Alias duplicates removed:** [count]
  - "Nifty Weekly Straddle" ≡ "ATM Straddle Write Nifty" → Kept former (more detailed)
- **High-correlation pairs (kept both, flagged):** [count]
  - [Strategy C] ↔ [Strategy D] (similarity: 11/15) — distinct enough to keep
- **Strategies after dedup:** [count]
```

### 7. Edge Cases

| Scenario | Resolution |
|----------|------------|
| Strategy found by 3+ scouts | Take the version with most detail; note multi-source validation as positive signal |
| Strategy names identical but structures differ | These are NOT duplicates — different strategies with misleading names. Keep both. |
| Two strategies on same underlying but opposite bias | By definition not duplicates (one bullish, one bearish). Keep both. |
| Strategy on Nifty vs. same strategy on BankNifty | NOT duplicates — different underlyings. Keep both. |
| Exact same strategy but one has [STALE] flag | Keep the non-stale version if both have comparable detail |

## Changelog

`[Built from scratch — v1.0]`
