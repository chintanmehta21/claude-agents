# Design: Points-Based Research, Multi-Regime Strategies, Executor-Ready Output & Context Compression

**Date:** 2026-03-26
**Version:** 2.0
**Status:** Approved

## Overview

Three interconnected changes to the trading-research-agent plugin:

1. **Points-based calculations** — All P&L, payoff, targets, stops in pts (not ₹). Margin/costs stay in ₹. Philosophy shift: strategies evaluated by structural edge, not rupee outcomes.
2. **Multi-regime mandate** — Every strategy must include a Regime Performance Matrix showing behavior across trend×volatility combos. Find strategies that work across multiple market conditions, not just the current one.
3. **Executor-ready output** — New `executor_params` field with machine-readable data for an algo-trading executor. Enhanced entry/exit conditions with rationale.
4. **Context-compression hook** — 4-tier threshold system replacing existing context-window-monitor.sh. Emergency session handoff at ≤10% with auto-scheduling.

## Change 1: Points-Based Philosophy & Multi-Regime Mandate

### Philosophy Injection

Every agent (lead, ScoutLeader, scout, orchestrator, verifier) gets a **Trading Philosophy** section inserted after its role description, before task instructions. This ensures all agents internalize the mindset before doing any work.

**Philosophy block (core, adapted per agent):**

```
TRADING PHILOSOPHY — READ BEFORE ANY RESEARCH

This system researches options strategies in POINTS (pts), not rupees. Points are
universal — they work across lot sizes, capital bases, and market regimes. A strategy
that makes 50 pts works whether you trade 1 lot or 100.

Why pts: When you think in pts, you evaluate strategies by structural edge — not by
how much money they make at today's prices. A 50-pt Iron Condor edge is the same edge
whether Nifty is at 18000 or 25000.

Convention:
- P&L, breakeven, targets, stops, theta: ALL in pts
- Margin, brokerage, STT, transaction costs: in ₹ (broker-specific)
- ROM calculation: (max_profit_pts × lot_size × point_value) / margin_₹

MULTI-REGIME MANDATE: Do NOT find strategies that "work right now." Find strategies
with a structural edge across multiple market regimes. Every strategy MUST include a
Regime Performance Matrix. A strategy that only works in one regime is fragile.
```

### Points Convention Table

| Field | Old (₹) | New (pts) | Notes |
|-------|---------|-----------|-------|
| Max Profit | ₹X per lot | X pts | Universal across lot sizes |
| Max Loss | ₹X per lot | X pts | |
| Breakeven | Price level | ATM ± X pts | Relative to entry ATM |
| Profit Target | ₹X or % | X pts or % of max-profit-pts | |
| Stop Loss | ₹X or breach | X pts from entry | |
| Theta Profile | ₹X/day/lot | X pts/day | Per lot |
| Greeks effects | Per lot in ₹ | Per lot in pts | Delta, Gamma P&L in pts |
| Margin Required | ₹X | ₹X (unchanged) | Broker-specific |
| Transaction Costs | ₹X per lot | ₹X per lot (unchanged) | |
| ROM | ₹ / ₹ | (pts × lot_size × point_value) / ₹ margin | Hybrid |

### Regime Performance Matrix (New Required Field)

```json
"regime_performance_matrix": {
  "trending_up": {
    "low_vol":     { "expected_pts": "+40 to +60", "edge_quality": "STRONG",   "evidence": "..." },
    "medium_vol":  { "expected_pts": "+30 to +50", "edge_quality": "MODERATE", "evidence": "..." },
    "high_vol":    { "expected_pts": "+10 to +30", "edge_quality": "WEAK",     "evidence": "..." },
    "extreme_vol": { "expected_pts": "-20 to +10", "edge_quality": "AVOID",    "evidence": "..." }
  },
  "trending_down": { "...same structure..." },
  "range_bound":   { "...same structure..." },
  "regime_versatility_score": "X/12",
  "best_regime":  "Range-bound + Medium-Vol",
  "worst_regime": "Trending + Extreme-Vol"
}
```

**Edge quality values:** STRONG, MODERATE, WEAK, AVOID
**Regime versatility score:** Count of regime combos with MODERATE+ edge (max 12)

### Impact on Verifier Rubric

- **Dimension 7 (IV Regime Alignment)** expands to **Regime Versatility**: Score based on regime_versatility_score instead of just current IV alignment.
  - 0-3: Score 0-2 (only works in 1 regime)
  - 4-6: Score 3-5 (moderate versatility)
  - 7-9: Score 6-8 (good versatility)
  - 10-12: Score 9-10 (works everywhere)

### Impact on Tie-Breaking Cascade

Add **Regime Versatility Score** as position 2 in the 7-level cascade (after Lowest Max Drawdown, before Highest ROM). More versatile strategies break ties over single-regime specialists.

## Change 2: Executor-Ready Output

### New `executor_params` Schema Field

```json
"executor_params": {
  "data_requirements": {
    "timeframe_used": "15-min candles, last 20 trading sessions",
    "lookback_period": "20 sessions (~1 month)",
    "data_interval": "15min",
    "indicators_used": [
      { "name": "RSI", "params": { "period": 14, "source": "close" } },
      { "name": "VWAP", "params": { "anchor": "session" } }
    ],
    "underlying": "NIFTY",
    "exchange": "NSE"
  },
  "strike_selection": {
    "method": "ATM-relative",
    "atm_reference": "Spot price rounded to nearest strike interval",
    "leg_offsets": [
      { "leg": 1, "type": "CE", "action": "BUY", "offset": "ATM+0", "delta_target": null },
      { "leg": 2, "type": "CE", "action": "SELL", "offset": "ATM+200", "delta_target": 0.30 }
    ],
    "strike_interval": 50,
    "strike_selection_timing": "At entry signal, use live spot"
  },
  "entry_signal": {
    "primary_trigger": "RSI(14) crosses below 30 on 15-min chart",
    "confirmation": "VWAP bounce within 2 candles of primary trigger",
    "iv_condition": "IV percentile 20-40 (252-day rolling)",
    "oi_condition": "PCR > 1.2 at ATM strike",
    "time_window": "09:30-14:00 IST",
    "order_type": "LIMIT",
    "execution_sequence": ["Buy leg1 at ask", "Sell leg2 at bid within 30s"],
    "max_slippage_pts": 2
  },
  "exit_signal": {
    "profit_target_pts": 50,
    "profit_target_pct": 50,
    "stop_loss_pts": 30,
    "stop_loss_method": "Combined premium exceeds 2x entry cost in pts",
    "time_exit": "T-1 day 14:00 IST",
    "trailing_stop": { "enabled": false, "trail_pts": null },
    "adjustment_triggers": [
      {
        "condition": "Underlying moves 100 pts against position",
        "action": "Roll short leg 100 pts further OTM",
        "cost_pts": 5,
        "rationale": "Extends breakeven by 100 pts, reduces delta exposure"
      }
    ]
  },
  "position_sizing": {
    "recommended_lots": "1-5 based on capital",
    "max_margin_pct": 5,
    "scaling_rule": "Add 1 lot per ₹5L capital above ₹10L base"
  }
}
```

### Enhanced entry_conditions (With Rationale)

```json
"entry_conditions": {
  "technical": [
    {
      "indicator": "RSI",
      "params": { "period": 14, "timeframe": "15min" },
      "condition": "crosses_below",
      "value": 30,
      "rationale": "Oversold condition in mean-reversion setups has 65%+ reversion probability within 3 candles in range-bound markets"
    }
  ],
  "fundamental": [],
  "iv_environment": "LOW",
  "iv_percentile_range": "20-40",
  "timing": "3 DTE for weekly",
  "rationale_summary": "RSI oversold + VWAP bounce gives best risk:reward in the first half of trading session; entry precision avoids false signals from morning gaps"
}
```

### Enhanced exit_conditions (With Rationale + Best Strategy)

```json
"exit_conditions": {
  "profit_target": {
    "value_pts": 50,
    "value_pct": 50,
    "rationale": "Captures 50% of theoretical max — beyond this, gamma risk accelerates and holding costs increase"
  },
  "stop_loss": {
    "value_pts": 30,
    "method": "2x premium paid",
    "rationale": "Limits downside to 2x entry cost; at this level, edge thesis is mathematically invalidated"
  },
  "time_exit": {
    "rule": "T-1 day 14:00 IST",
    "rationale": "Avoids expiry-day gamma explosion, pin risk, and wide bid-ask spreads"
  },
  "adjustment_rules": [
    {
      "condition": "Underlying moves 100 pts against",
      "action": "Roll short leg 100 pts further OTM",
      "cost_pts": 5,
      "rationale": "5 pts cost extends breakeven 100 pts; preserves theta while reducing directional exposure"
    }
  ],
  "best_exit_strategy": "Profit target at 50% of max — captures 80% of available edge with 40% less time exposure vs. holding to expiry"
}
```

### Scout Research Mandate Expansion

Scouts must now additionally research and populate:
1. **Data parameters** — timeframe, interval, lookback used in original strategy analysis
2. **Strike selection specifics** — method (ATM±X, delta, OI), strike interval
3. **Entry signal precision** — exact indicator params, trigger values, execution sequence
4. **Exit signal precision** — exact pts targets, stop methods, adjustment triggers
5. **Entry/exit rationale** — WHY these conditions were chosen vs. alternatives
6. **Regime performance** — evidence of how the strategy performs across regime combos

If any field cannot be determined from source material, tag as `[EXECUTOR_PARAM_MISSING: field_name — requires manual configuration]`.

### Orchestrator Enrichment Addition

Orchestrator adds/validates executor_params during enrichment:
- Cross-references strike selection against current option chain
- Validates indicator params against available data feeds
- Fills in missing execution params where determinable from strategy structure

### Verifier Scoring Impact

- **Dimension 2 (Entry Precision)** now also evaluates executor_params.entry_signal completeness
- **Dimension 3 (Exit Discipline)** now also evaluates executor_params.exit_signal completeness
- **New deduction:** `[EXECUTOR_PARAM_MISSING]` on critical fields (strike_selection, entry_signal, exit_signal): -3 points

## Change 3: Context-Compression Hook

### Architecture

New `context-compression-advisor.js` PostToolUse hook replacing `context-window-monitor.sh`.

### Threshold System

| Level | Remaining % | Action |
|-------|-------------|--------|
| NORMAL | >50% | No action |
| CAUTION | ≤50% | Light compression tips |
| WARNING | ≤25% | Aggressive compression + alert lead |
| CRITICAL | ≤10% | Halt + full state dump + schedule resume |

### Metric Sources (Priority Order)

1. **Statusline bridge file:** `/tmp/claude-ctx-{session_id}.json` (most accurate)
2. **Output file size estimation:** Sum all output files, divide by 4 = approx tokens (fallback)
3. **Tool call counter:** Track agent spawns as proxy for depth (last resort)

### Compression Advice per Threshold

**CAUTION (≤50%):**
```
CONTEXT OPTIMIZATION ACTIVE: {remaining}% context remaining.
Tips for all agents:
- Summarize completed outputs to key findings (name, score, key executor_params)
- Reference files by path — don't re-read processed files
- Use structured tables, not prose paragraphs
- Drop intermediate reasoning chains — keep conclusions
```

**WARNING (≤25%):**
```
CONTEXT WARNING: Only {remaining}% remaining. Compress NOW.
MANDATORY for all agents:
- Write ALL current state to files immediately (don't hold in context)
- Summarize strategies to: name | score | 3-line synopsis | executor_params only
- Subagents: output ONLY final schema, zero reasoning chains
- Reference paths, never quote file content
- Project Lead: prepare session_handoff.md proactively
```

**CRITICAL (≤10%):**
```
CONTEXT CRITICAL: {remaining}% remaining. EMERGENCY HANDOFF INITIATED.
1. STOP all new agent spawning immediately
2. Write session_handoff.md to output directory with:
   - Pipeline stage and completion status per agent
   - ALL strategy data (full schema for each collected strategy)
   - shared_context.json snapshot
   - run_state.json snapshot
   - Remaining work queue
   - All output file paths
3. Update run_state.json status to "SUSPENDED_CONTEXT_LIMIT"
4. Attempt to schedule resume via MCP scheduled-tasks tool
5. If scheduling unavailable, output: "Run /trading-research-agent:run_research_agent to resume"
6. EXIT — no further agent spawning permitted
```

### Session Handoff File

Written to `{output_dir}/session_handoff.md`:

```markdown
# Session Handoff — Emergency Context Limit
## Generated: [ISO timestamp]
## Pipeline Stage: [tier + specific step]
## Reason: Context remaining at {X}%
## Token Reset Expected: [estimated from model context info if available]

### Completed Work
- [x] IV regime fetched → shared_context.json
- [x] Sources researched → shared_context.json
- [x] Bullish scouts: 4/4 → bullish/scouts/*.md
- [x] Bullish confirmation gate: PASSED
- [ ] Bearish scouts: 2/4 → forums.md, tradingview.md pending
...

### Strategy Inventory (Compact)
| # | Name | Bias | Expiry | Score | Regime Score | File |
|---|------|------|--------|-------|-------------|------|
| 1 | ... | BULL | WEEKLY | 85/110 | 8/12 | bullish/verified/weekly.md |
...

### Shared Context Snapshot
{full shared_context.json}

### Run State Snapshot
{full run_state.json}

### Resume Instructions
1. Load this handoff file
2. Read run_state.json for checkpoint
3. Resume from: [stage]
4. Skip completed: [list]
5. Pending: [list with full context needed]
```

### Auto-Scheduling Logic

```javascript
// After writing session_handoff.md at CRITICAL threshold:
// 1. Try MCP scheduled-tasks
//    - Task ID: "trading-research-resume-{date}"
//    - Cron: run in 60 minutes (or after estimated token reset)
//    - Prompt: "Resume trading research from session_handoff.md at {output_dir}"
// 2. If MCP unavailable or fails, output manual instructions
```

### hooks.json Update

Replace existing context-window-monitor.sh entry:

```json
{
  "event": "PostToolUse",
  "matcher": "Agent",
  "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/context-compression-advisor.js\"",
  "timeout": 15
}
```

Remove:
```json
{
  "event": "PreToolUse",
  "matcher": "Agent",
  "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/context-window-monitor.sh\""
}
```

### Debounce Logic

- Minimum 3 tool calls between advisories (avoid spam)
- Severity escalation bypasses debounce (CAUTION→WARNING is always shown)
- Track last warning level in temp file to detect escalation

## Files Modified

### Agent Files (5)
- `agents/lead.md` — Add Trading Philosophy, update output schema, update tie-breaking cascade, add session handoff awareness
- `agents/ScoutLeader.md` — Add Trading Philosophy, update scout assignment to include regime+executor research
- `agents/scout.md` — Add Trading Philosophy, update output format (pts, regime matrix, executor_params, enhanced entry/exit with rationale)
- `agents/orchestrator.md` — Add Trading Philosophy, update enrichment to validate executor_params, pts-based dedup
- `agents/verifier.md` — Add Trading Philosophy, update rubric Dim 7 to Regime Versatility, add executor completeness scoring, pts-based stress tests

### Hook Files (2)
- `hooks/context-compression-advisor.js` — NEW: 4-tier context compression hook
- `hooks/hooks.json` — Replace context-window-monitor.sh entry with new hook

### Other
- `hooks/context-window-monitor.sh` — KEPT but no longer triggered (superseded)
- `rules/OptionsTrading.md` — Add pts convention note in preamble
- `commands/run_research_agent.md` — Update to mention pts-based output and session resume capability

## Non-Goals

- Not changing the 4-tier architecture or agent spawning logic
- Not changing the 11-dimension rubric structure (just updating Dim 7 semantics)
- Not changing scout domains or source assignments
- Not changing file-based communication pattern
- Not removing any existing hooks (except context-window-monitor.sh trigger)
