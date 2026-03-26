# Points-Based Research, Multi-Regime, Executor Output & Context Compression — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the trading-research-agent from rupee-based, single-regime research to points-based, multi-regime, executor-ready output with intelligent context compression.

**Architecture:** Philosophy-first approach — inject a "Trading Philosophy" section into all 5 agents (before their task instructions) to embed pts-based thinking and multi-regime mandate. Update the strategy output schema in scout.md with executor_params, enhanced entry/exit with rationale, and regime performance matrix. Update verifier rubric Dimension 7 from "IV Regime Alignment" to "Regime Versatility." Create a new context-compression-advisor.js hook with 4-tier thresholds replacing context-window-monitor.sh.

**Tech Stack:** Markdown (agent prompts), Node.js (hook), JSON (hooks config)

**Spec:** `docs/superpowers/specs/2026-03-26-pts-regime-executor-compression-design.md`

---

### Task 1: Add Points Convention to Rules Baseline

**Files:**
- Modify: `rules/OptionsTrading.md:1-17`

This is the foundational change — adding the pts convention to the rules file that ALL agents reference.

- [ ] **Step 1: Add pts convention section after the Instructions block**

Insert after line 17 (after the `[STALE]` flag instruction, before the `---` separator on line 18) in `rules/OptionsTrading.md`:

```markdown
### Points (pts) Convention

**All strategy P&L, payoff profiles, breakevens, targets, stops, and theta decay values in this pipeline are expressed in POINTS (pts), not rupees.** Points are universal across lot sizes and capital bases.

| Metric | Unit | Notes |
|--------|------|-------|
| Max Profit / Max Loss | pts | Per lot, in underlying points |
| Breakeven | ATM ± X pts | Relative to entry ATM strike |
| Profit Target / Stop Loss | pts or % of max-profit-pts | |
| Theta Profile | pts/day | Per lot |
| Greeks P&L Impact | pts | Delta, Gamma, Vega effects in pts |
| Margin Required | ₹ | Stays in rupees — broker-specific |
| Transaction Costs (STT, brokerage, exchange charges) | ₹ per lot | Stays in rupees — broker-specific |
| ROM (Return on Margin) | ratio | `(max_profit_pts × lot_size × point_value) / margin_₹` |

**Why pts:** A 50-pt edge on an Iron Condor is the same structural edge whether Nifty is at 18000 or 25000, whether you trade 1 lot or 100. Rupee values are derived at execution time by multiplying pts × lot_size.
```

- [ ] **Step 2: Verify the edit**

Open `rules/OptionsTrading.md` and confirm the new section appears between the Instructions block and Section 1 (Exchange Structure). Confirm no existing content was removed.

- [ ] **Step 3: Commit**

```bash
git add rules/OptionsTrading.md
git commit -m "docs(rules): add points (pts) convention to OptionsTrading baseline"
```

---

### Task 2: Update Scout — Philosophy, Output Schema, Executor Params

**Files:**
- Modify: `agents/scout.md:28-240` (Purpose, Instructions, Output Format sections)

The scout is the primary strategy producer. This is the largest change — adding Trading Philosophy, updating the output format to pts, adding regime_performance_matrix, executor_params, and enhanced entry/exit with rationale.

- [ ] **Step 1: Insert Trading Philosophy section after Purpose block**

Insert after line 35 (after the Stakeholder section ending "...any other scout's output.") and before line 37 ("## Instructions"):

```markdown
## Trading Philosophy — READ BEFORE ANY RESEARCH

**This system researches options strategies in POINTS (pts), not rupees.** Points are universal — they work across lot sizes, capital bases, and market regimes. A strategy that makes 50 pts works whether you trade 1 lot or 100 lots.

**Why pts matters:** When you think in pts, you naturally evaluate strategies by their structural edge — not by how much money they make at today's prices. A 50-pt Iron Condor edge is the same edge whether Nifty is at 18000 or 25000. Express all P&L, breakevens, targets, stops, and theta values in pts. Only margin and transaction costs remain in ₹ (broker-specific).

**Multi-Regime Mandate:** Do NOT find strategies that "work right now." Find strategies that have a **structural edge across multiple market regimes**. Every strategy you output MUST include a **Regime Performance Matrix** showing expected behavior across:
- **Trend:** Trending Up / Trending Down / Range-Bound
- **Volatility:** Low-Vol / Medium-Vol / High-Vol / Extreme-Vol

A strategy that only works in "bullish + low-vol" is fragile. A strategy with proven edge across "bullish + low-vol AND bullish + high-vol AND range-bound + medium-vol" is robust. **Prioritize regime-versatile strategies.**

Evidence for the regime matrix can come from: backtests across different periods, structural analysis of the payoff profile, historical scenario mapping, or reasoned synthesis (labeled `[SYNTHESIZED — based on payoff structure analysis]`). You must populate every cell of the matrix, even if some cells are synthesized.

**Executor-Ready Output:** Your output will feed an algo-trading executor. Every strategy must include machine-readable `executor_params` with exact indicator parameters, trigger values, strike selection logic, and execution sequences. If a parameter cannot be determined from source material, tag it `[EXECUTOR_PARAM_MISSING: field_name — requires manual configuration]`.
```

- [ ] **Step 2: Update the Output Format section (Section 4)**

Replace the Entry Conditions block (lines 179-184) with enhanced version:

```markdown
#### Entry Conditions
- **Technical:**
  - Indicator: [name], Params: [exact params e.g. RSI period=14, timeframe=15min], Condition: [crosses_below/crosses_above/etc], Value: [exact threshold]
  - Rationale: [why this specific indicator and threshold — what edge does it capture]
  - [repeat for each indicator]
- **Fundamental:** [if applicable — specific event, date range, corporate action]
- **IV Environment:** [required IV regime — LOW / MEDIUM / HIGH / EXTREME]
- **IV Percentile Range:** [e.g., 20-40 on rolling 252-day basis]
- **Timing:** [e.g., Enter 3 DTE for weekly, 15-20 DTE for monthly, time window 09:30-14:00 IST]
- **Rationale Summary:** [1-2 sentences: why these SPECIFIC entry conditions were chosen over alternatives, and what combined edge they provide]
```

- [ ] **Step 3: Update Exit Conditions block (lines 192-196)**

Replace with enhanced version:

```markdown
#### Exit Conditions
- **Profit Target:** [X pts or Y% of max-profit-pts]
  - Rationale: [why this target — e.g., "captures 50% of max, avoids gamma risk acceleration near expiry"]
- **Stop Loss:** [X pts from entry or specific condition]
  - Rationale: [why this stop — e.g., "beyond this point, edge thesis is invalidated"]
- **Time Exit:** [specific rule — e.g., "T-1 day 14:00 IST"]
  - Rationale: [why this timing — e.g., "avoids expiry-day pin risk and wide spreads"]
- **Adjustment Rules:**
  - Condition: [e.g., "underlying moves 100 pts against position"]
  - Action: [e.g., "roll short leg 100 pts further OTM"]
  - Cost: [X pts]
  - Rationale: [e.g., "extends breakeven by 100 pts, reduces delta exposure, preserves theta"]
- **Best Exit Strategy:** [1-2 sentences recommending the optimal exit approach and why]
```

- [ ] **Step 4: Update Risk-Reward Profile block (lines 198-210) to pts**

Replace with pts-based version:

```markdown
#### Risk-Reward Profile
- **Max Profit:** [X pts per lot]
- **Max Loss:** [X pts per lot]
- **Breakeven:** [ATM ± X pts]
- **Margin Required:** [₹X approximate SPAN + exposure — stays in ₹]
- **The Greeks Exposure:**
  - **Net Delta:** [e.g., +0.35 per lot (directionally long)]
  - **Delta Bias:** [e.g., Net Long Delta — profits from upward moves]
  - **Gamma Risk:** [e.g., Negative Gamma — position delta moves against you. High gamma risk within 2 DTE.]
  - **Vega Exposure:** [e.g., Short Vega — each 1% IV increase costs ~X pts per lot]
  - **Theta Profile:** [e.g., Positive Theta of X pts/day per lot]
  - **Theta/Gamma Dynamic:** [e.g., Positive Theta but high negative Gamma near expiry]
  - **Rho Sensitivity:** [e.g., Negligible for weekly. For quarterly: X pts per 25bps RBI rate change]
```

- [ ] **Step 5: Add Regime Performance Matrix block after Edge Thesis (after line 213)**

Insert new section after the Edge Thesis block:

```markdown
#### Regime Performance Matrix
| Regime | Low-Vol | Medium-Vol | High-Vol | Extreme-Vol |
|--------|---------|------------|----------|-------------|
| **Trending Up** | expected: ±X pts, edge: STRONG/MODERATE/WEAK/AVOID | ... | ... | ... |
| **Trending Down** | ... | ... | ... | ... |
| **Range-Bound** | ... | ... | ... | ... |

- **Regime Versatility Score:** X/12 (count of cells with MODERATE or STRONG edge)
- **Best Regime:** [e.g., "Range-bound + Medium-Vol"]
- **Worst Regime:** [e.g., "Trending Down + Extreme-Vol"]
- **Evidence Basis:** [e.g., "Payoff structure analysis + 2 historical scenarios" or "Backtest across 52 weekly expiries covering multiple regimes"]
```

- [ ] **Step 6: Add Executor Params block after Regime Performance Matrix**

Insert new section:

```markdown
#### Executor Parameters (Machine-Readable)
```json
{
  "data_requirements": {
    "timeframe_used": "[e.g., 15-min candles, last 20 trading sessions]",
    "lookback_period": "[e.g., 20 sessions (~1 month)]",
    "data_interval": "[15min | 5min | 1min | day]",
    "indicators_used": [
      { "name": "[indicator]", "params": { "period": 14, "source": "close" } }
    ],
    "underlying": "[NIFTY | BANKNIFTY | FINNIFTY | SENSEX | STOCK]",
    "exchange": "[NSE | BSE]"
  },
  "strike_selection": {
    "method": "[ATM-relative | delta-based | OI-based]",
    "atm_reference": "[e.g., Spot price rounded to nearest strike interval]",
    "leg_offsets": [
      { "leg": 1, "type": "[CE|PE]", "action": "[BUY|SELL]", "offset": "[ATM+0]", "delta_target": null }
    ],
    "strike_interval": "[e.g., 50]",
    "strike_selection_timing": "[e.g., At entry signal, use live spot]"
  },
  "entry_signal": {
    "primary_trigger": "[exact trigger description]",
    "confirmation": "[confirmation signal if any]",
    "iv_condition": "[IV percentile range]",
    "oi_condition": "[OI/PCR condition if any]",
    "time_window": "[e.g., 09:30-14:00 IST]",
    "order_type": "[LIMIT | MARKET]",
    "execution_sequence": ["[e.g., Buy leg1 at ask, Sell leg2 at bid within 30s]"],
    "max_slippage_pts": "[number]"
  },
  "exit_signal": {
    "profit_target_pts": "[number]",
    "profit_target_pct": "[percentage of max profit]",
    "stop_loss_pts": "[number]",
    "stop_loss_method": "[description]",
    "time_exit": "[e.g., T-1 day 14:00 IST]",
    "trailing_stop": { "enabled": "[true|false]", "trail_pts": "[number or null]" },
    "adjustment_triggers": [
      { "condition": "[trigger]", "action": "[response]", "cost_pts": "[number]" }
    ]
  },
  "position_sizing": {
    "recommended_lots": "[range based on capital]",
    "max_margin_pct": "[percentage of capital]",
    "scaling_rule": "[scaling logic]"
  }
}
```
If any field cannot be determined from source material, use: `"[EXECUTOR_PARAM_MISSING: field_name — requires manual configuration]"`
```

- [ ] **Step 7: Add Additional Data Points section — update existing block (around lines 220-240)**

After the existing Backtest Data / Reasoning Chain / Citations sections, add:

```markdown
#### Additional Data Points
- **Volatility Surface Context:**
  - Current IV vs. historical IV (252-day): [X% vs Y%, Z percentile]
  - IV Skew: [put IV vs call IV at same delta distance]
  - Term Structure: [contango/backwardation across expiries]
- **Liquidity Snapshot:**
  - Bid-Ask Spread: [typical spread in pts for target strikes]
  - Typical OI: [open interest at target strikes]
  - Daily Volume: [average daily volume]
  - Execution Window: [optimal time for entry/exit]
- **Tax & Transaction Cost Impact:**
  - All-in cost per lot: ₹[X] (brokerage + STT + exchange + GST)
  - Cost as % of max profit (pts): [X%]
  - Net edge after costs: [original edge pts - cost-equivalent pts = net edge pts]
```

- [ ] **Step 8: Verify the complete scout.md**

Read `agents/scout.md` end-to-end. Confirm:
- Trading Philosophy section appears before Instructions
- All P&L references use pts (not ₹) except margin/costs
- Regime Performance Matrix is a required field
- Executor Parameters block is present with full JSON template
- Entry/exit conditions have rationale fields
- No existing content was accidentally deleted

- [ ] **Step 9: Commit**

```bash
git add agents/scout.md
git commit -m "feat(scout): add pts philosophy, regime matrix, executor params, enhanced entry/exit"
```

---

### Task 3: Update ScoutLeader — Philosophy + Regime Mandate for Scout Spawning

**Files:**
- Modify: `agents/ScoutLeader.md:28-30` (after Purpose, before Instructions)

- [ ] **Step 1: Insert Trading Philosophy after Stakeholder section**

The ScoutLeader's purpose ends around line 30. Insert after the Purpose block and before `## Instructions`:

```markdown
## Trading Philosophy — BRIEF TO ALL SCOUTS

**Before spawning any scout, ensure this philosophy is embedded in every scout's context:**

1. **Points, not rupees:** All strategy P&L, breakevens, targets, stops, and theta values must be in points (pts). Only margin and transaction costs stay in ₹. This ensures strategies are evaluated by structural edge, not absolute rupee amounts that vary with lot size and capital.

2. **Multi-regime strategies:** Scouts must find strategies that work across multiple market regimes (trend × volatility combinations), not just strategies that "work right now." Every strategy must include a Regime Performance Matrix. Reject strategies with evidence from only a single market condition.

3. **Executor-ready precision:** Every strategy must include machine-readable `executor_params` — exact indicator parameters, trigger values, strike selection logic, and execution sequences. The output feeds an algo-trading system.

4. **Cross-expiry robustness:** Prioritize strategies that have shown edge across multiple expiry cycles, not just a single instance. A strategy that worked once on a specific weekly expiry is anecdotal; a strategy that works consistently across 20+ weekly expiries is robust.

**When constructing each scout's prompt, append this philosophy block BEFORE the research instructions.** Scouts that receive this context will naturally produce regime-aware, pts-denominated, executor-ready output.
```

- [ ] **Step 2: Update the Monitoring & Health Checks section**

Find the health check criteria in ScoutLeader.md (the section listing validation checks for scout output). Add these additional checks:

```markdown
- **Regime matrix check**: Output includes a Regime Performance Matrix for each strategy with regime_versatility_score
- **Pts convention check**: P&L values are in pts (not ₹), except margin and transaction costs
- **Executor params check**: Each strategy includes an executor_params JSON block
- **Entry/exit rationale check**: Entry and exit conditions include rationale fields
```

- [ ] **Step 3: Verify and commit**

```bash
git add agents/ScoutLeader.md
git commit -m "feat(scoutleader): add pts philosophy brief, regime mandate, executor checks"
```

---

### Task 4: Update Orchestrator — Philosophy + Executor Enrichment

**Files:**
- Modify: `agents/orchestrator.md:28-30` (after Purpose), and enrichment section

- [ ] **Step 1: Insert Trading Philosophy after Stakeholder section**

Insert before `## Instructions`:

```markdown
## Trading Philosophy — ENRICHMENT LENS

**All enrichment in this tier uses points (pts) for P&L values.** When adding historical context, express P&L reasoning in pts. When enriching risk-reward profiles, use pts. Only margin and transaction costs stay in ₹.

**Regime-Aware Enrichment:** When enriching strategies with historical context and scenario mapping:
- Validate and expand the scout's Regime Performance Matrix with historical evidence
- Cross-reference historical scenarios against specific regime conditions (what was the trend? what was the vol level?)
- Flag strategies whose regime matrix claims are unsupported by historical evidence: `[REGIME_CLAIM_UNVERIFIED: <cell> — no historical evidence found]`

**Executor Params Validation:** During enrichment:
- Cross-reference strike selection parameters against current option chain data
- Validate indicator parameters against available data feeds
- Fill in missing executor_params where determinable from strategy structure (label as `[ORCHESTRATOR_ENRICHED]`)
- Flag executor params that conflict with current market conditions: `[EXECUTOR_PARAM_STALE: <field> — current market differs]`
```

- [ ] **Step 2: Update the Pre-Verifier Completeness Checklist**

Find the existing checklist in orchestrator.md (Section 7: Agent Alignment & Data Forwarding Responsibility). Add these items:

```markdown
- ✓ Regime Performance Matrix present and populated (all 12 cells)
- ✓ Executor params present (or Orchestrator-enriched with label)
- ✓ Entry/exit conditions include rationale fields
- ✓ All P&L values in pts (not ₹), margin/costs in ₹
- ✓ Best exit strategy recommendation included
```

- [ ] **Step 3: Update Deduplication section — pts-based comparison**

In the deduplication section, update the merge logic to note that when merging strategies, P&L comparisons should be in pts for apples-to-apples comparison:

```markdown
- Risk-reward: Compare in pts (not ₹) — keep the structurally better profile regardless of assumed lot size
- Regime matrix: Merge by taking the better-evidenced cell for each regime combo
- Executor params: Keep the more specific/detailed version
```

- [ ] **Step 4: Verify and commit**

```bash
git add agents/orchestrator.md
git commit -m "feat(orchestrator): add pts philosophy, regime enrichment, executor validation"
```

---

### Task 5: Update Verifier — Philosophy, Rubric Dim 7, Pts Stress Tests

**Files:**
- Modify: `agents/verifier.md:28-30` (after Purpose), rubric section, stress test section

- [ ] **Step 1: Insert Trading Philosophy after Stakeholder section**

Insert before `## Instructions`:

```markdown
## Trading Philosophy — VERIFICATION LENS

**All verification stress tests and P&L analysis use points (pts).** When stress-testing Delta scenarios, express impact in pts per lot. When evaluating risk-reward, compare in pts. Only margin and costs stay in ₹.

**Regime Verification:** You must verify the scout's Regime Performance Matrix:
- Does the strategy's payoff structure support the claimed regime performance?
- A bull call spread claiming "STRONG" edge in "trending down + high vol" is suspect
- Cross-reference regime claims against the Greeks stress test results
- Score Dimension 7 (Regime Versatility) based on the VERIFIED regime matrix, not the scout's claims

**Executor Completeness Check:** Verify that executor_params are sufficient for an algo-trading system:
- Are all entry/exit signals machine-parseable? (exact values, not vague descriptions)
- Are strike selection offsets specific enough to code?
- Missing critical executor params = deduction (see rubric)
```

- [ ] **Step 2: Update Greeks Stress Test table format to pts**

Replace the stress test results table template (around line 104-113) to use pts:

```markdown
#### Greeks Stress Test Results
| Test | Scenario | P&L Impact (pts/lot) | Severity | Survivable? |
|------|----------|---------------------|----------|-------------|
| Delta 1σ up | Nifty +1% (~250 pts) | +/-X pts per lot | LOW/MED/HIGH | Yes/No + adjustment |
| Delta 2σ up | Nifty +3% (~750 pts) | +/-X pts per lot | MED/HIGH | Yes/No + adjustment |
| Delta 3σ up | Nifty +4.5% (~1125 pts) | +/-X pts per lot | HIGH/CRIT | Yes/No + adjustment |
| Delta gap | Nifty +5% overnight (~1250 pts) | +/-X pts per lot | CRITICAL | Yes/No |
| Gamma @ 1 DTE | ATM, 50pt underlying move | Delta shift: +X to +Y | CRITICAL | Only if managed |
| Vega +3pts | IV spike +3 vol points | +/-X pts per lot | MEDIUM | Yes/No |
| Vega crush | Post-event -5 vol points | +/-X pts per lot | LOW/MED | Yes/No |
| Rho +25bps | RBI rate hike (monthly/quarterly only) | +/-X pts per lot | LOW | Yes |
```

- [ ] **Step 3: Update Rubric Dimension 7 from "IV Regime Alignment" to "Regime Versatility"**

Find the rubric table (around line 210-219). Replace Dimension 7:

Old line 218:
```
| 7 | **IV Regime Alignment** | 1x | Strategy requires IV regime opposite to current | Strategy works in current regime but not optimal | Strategy is optimally suited for current IV regime |
```

New:
```
| 7 | **Regime Versatility** | 1x | Works in only 1 regime combo (score 1-2/12) — fragile | Works in 4-6 regime combos (score 4-6/12) — moderate versatility | Works in 8+ regime combos (score 8-12/12) — highly versatile across market conditions |
```

- [ ] **Step 4: Add executor completeness deduction**

Find the deductions section (after the rubric table). Add:

```markdown
- Each critical `[EXECUTOR_PARAM_MISSING]` field (strike_selection, entry_signal, exit_signal): -3 points
- Incomplete regime matrix (>4 cells empty or unsupported): -5 points
```

- [ ] **Step 5: Update tie-breaking cascade reference**

In the verifier output format or behavioral rules, note that the Lead now uses an 8-level tie-breaking cascade (Regime Versatility Score added at position 2).

- [ ] **Step 6: Update score interpretation to reflect regime change**

In the v2.0 changes note and Dimension 11 description, add a note:
```markdown
`[v2.1 — Dimension 7 renamed from "IV Regime Alignment" to "Regime Versatility" — now scores regime_versatility_score (0-12 mapped to 0-10) instead of current-IV-only alignment. Added executor completeness deductions. All P&L in pts. Added regime matrix verification requirement.]`
```

- [ ] **Step 7: Verify and commit**

```bash
git add agents/verifier.md
git commit -m "feat(verifier): pts stress tests, regime versatility dim 7, executor deductions"
```

---

### Task 6: Update Lead — Philosophy, Tie-Breaking, Session Handoff

**Files:**
- Modify: `agents/lead.md:36-45` (after Stakeholder), tie-breaking section, final output section

- [ ] **Step 1: Insert Trading Philosophy after Stakeholder section**

Insert before `## Instructions`:

```markdown
## Trading Philosophy — PIPELINE-WIDE MANDATE

**This entire pipeline operates in POINTS (pts) for all strategy P&L values.** When comparing strategies, evaluating tie-breaks, or writing final output, use pts. Only margin and transaction costs remain in ₹.

**Multi-Regime Research Mandate:** This pipeline finds strategies that work across multiple market regimes, not just the current one. When spawning ScoutLeaders:
- Explicitly instruct them to brief scouts on the regime mandate
- Strategies must include a Regime Performance Matrix
- The Verifier scores Dimension 7 as "Regime Versatility" (not just current IV alignment)

**Executor-Ready Output:** The final output feeds an algo-trading system. Ensure executor_params flow through the entire pipeline:
- Scouts produce initial executor_params
- Orchestrators validate and enrich them
- Verifiers check completeness
- Final output includes complete executor_params for each top-3 strategy

**Context Compression Awareness:** This pipeline uses a context-compression hook. If you receive compression advisories:
- At CAUTION (≤50%): Summarize completed work, reference files by path
- At WARNING (≤25%): Write all state to files, compress aggressively
- At CRITICAL (≤10%): Stop spawning, write session_handoff.md, prepare for resume
```

- [ ] **Step 2: Update the tie-breaking cascade (Section 7, around line 261-273)**

Replace the tie-breaking table with the updated 8-level version:

```markdown
| Priority | Tie-Breaking Criterion | Rationale |
|----------|----------------------|-----------|
| 1st | **Lowest Maximum Drawdown** — Select the strategy with the smaller max loss in pts | Capital preservation is paramount — fewer pts at risk for the same score is superior |
| 2nd | **Highest Regime Versatility Score** — From the Regime Performance Matrix (X/12) | A strategy that works across more market conditions is structurally more robust |
| 3rd | **Highest Return on Margin (ROM)** — `(max_profit_pts × lot_size × point_value) / margin_₹` | Capital efficiency — ties on score but uses less margin frees capital |
| 4th | **Fewest CRITICAL/HIGH Failure Modes** — Count from Verifier's failure mode analysis | Fewer severe failure modes = more robust in unexpected conditions |
| 5th | **Best Liquidity Feasibility Score** — Verifier's Liquidity Feasibility dimension score | Can't execute cleanly = theoretical, not practical |
| 6th | **Highest Source Quality Score** — Verifier's Source Quality dimension score | Better-sourced = more reliable edge thesis |
| 7th | **Most Complete Greeks Documentation** — Prefer more detailed Greeks analysis | Better data = more thorough Verifier stress test |
| 8th | **Recency of Source** — Prefer more recently sourced strategy | More recent = current market microstructure |
```

- [ ] **Step 3: Update final output format (Section 7, step 4, around line 279-283)**

Replace the final file requirements:

```markdown
4. Each final file must include:
   - The full strategy details (all in pts for P&L, ₹ for margin/costs)
   - The Verifier confidence score with rubric version tag `[Rubric v2.1]`
   - The complete Regime Performance Matrix
   - The complete executor_params JSON block
   - Enhanced entry/exit conditions with rationale
   - A Lead commentary section explaining WHY this strategy was selected over others
   - Any caveats, staleness flags, or unverified claims
   - Data used: timeframe, interval, indicators, strike selection method, lookback period
```

- [ ] **Step 4: Add Session Handoff awareness to Failure Handling (Section 10)**

Add to the failure handling table:

```markdown
| Context limit approaching (≤25% remaining) | Begin proactive summarization; write session_handoff.md draft; prioritize completing current tier before context runs out |
| Context limit critical (≤10% remaining) | STOP all new agent spawning; write complete session_handoff.md with full hierarchical state; update run_state.json to SUSPENDED_CONTEXT_LIMIT; attempt MCP schedule for resume; exit |
| Resuming from session handoff | Read session_handoff.md; restore run_state.json; skip completed tiers; resume from recorded stage |
```

- [ ] **Step 5: Update the Pre-Spawn checklist for ScoutLeaders (Section 9)**

Add to the ScoutLeader pre-spawn checklist:

```markdown
- [ ] Trading Philosophy (pts, regime mandate, executor-ready) is included in ScoutLeader prompt
- [ ] Regime Performance Matrix requirement is emphasized
- [ ] Executor params template is referenced
```

- [ ] **Step 6: Update max drawdown tie-break from ₹ to pts**

In the tie-breaking cascade (line 265), change "absolute ₹ or % of margin deployed" to "pts per lot":
Already handled in Step 2 above.

- [ ] **Step 7: Verify and commit**

```bash
git add agents/lead.md
git commit -m "feat(lead): pts philosophy, 8-level tie-breaking, session handoff, executor output"
```

---

### Task 7: Create Context-Compression Hook

**Files:**
- Create: `hooks/context-compression-advisor.js`

- [ ] **Step 1: Create the context-compression-advisor.js file**

```javascript
#!/usr/bin/env node
// ==============================================================================
// context-compression-advisor.js
// ==============================================================================
// Purpose: 4-tier context compression advisor for the trading research pipeline.
//          Monitors context usage and injects actionable compression advice.
//          Replaces context-window-monitor.sh with more granular thresholds,
//          pipeline-specific guidance, and emergency session handoff capability.
//
// Hook Event: PostToolUse (matcher: "Agent")
// Timeout: 15 seconds
//
// Thresholds:
//   NORMAL:  remaining > 50%  → no action
//   CAUTION: remaining ≤ 50%  → light compression tips
//   WARNING: remaining ≤ 25%  → aggressive compression + alert lead
//   CRITICAL: remaining ≤ 10% → halt + state dump + schedule resume
// ==============================================================================

const fs = require('fs');
const os = require('os');
const path = require('path');

// --- Configuration ---
const THRESHOLDS = {
  CAUTION: 50,   // remaining_percentage <= 50%
  WARNING: 25,   // remaining_percentage <= 25%
  CRITICAL: 10   // remaining_percentage <= 10%
};
const DEBOUNCE_MIN_CALLS = 3;
const STALE_SECONDS = 120;
const INPUT_TIMEOUT_MS = 10000;
const MAX_CONTEXT_CHARS = 800000; // ~200K tokens × 4 chars/token

// --- State tracking ---
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || '.';
const STATE_FILE = path.join(os.tmpdir(), 'trading-ctx-compression-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return { lastLevel: 'NORMAL', callsSinceLastWarning: 0 };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8');
  } catch (e) { /* ignore */ }
}

// --- Metrics: Try statusline bridge first, fall back to file size estimation ---
function getContextMetrics() {
  // Method 1: Statusline bridge file (most accurate)
  const sessionId = process.env.CLAUDE_SESSION_ID || '';
  if (sessionId) {
    const bridgePaths = [
      path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`),
      path.join(os.tmpdir(), `claude-context-${sessionId}.json`)
    ];
    for (const bp of bridgePaths) {
      try {
        if (fs.existsSync(bp)) {
          const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
          const age = (Date.now() - (data.timestamp || 0)) / 1000;
          if (age < STALE_SECONDS && typeof data.remaining_percentage === 'number') {
            return {
              source: 'statusline',
              remaining_pct: data.remaining_percentage,
              used_pct: 100 - data.remaining_percentage,
              raw: data
            };
          }
        }
      } catch (e) { /* continue to next method */ }
    }
  }

  // Method 2: File size estimation (fallback)
  const runDir = findLatestRunDir();
  if (runDir) {
    const totalBytes = estimateOutputSize(runDir);
    const usedPct = Math.round((totalBytes / MAX_CONTEXT_CHARS) * 100);
    return {
      source: 'file-estimation',
      remaining_pct: Math.max(0, 100 - usedPct),
      used_pct: Math.min(100, usedPct),
      totalBytes
    };
  }

  return null; // No metrics available
}

function findLatestRunDir() {
  // Check common output locations
  const candidates = [
    path.join(process.cwd(), 'research_agent_ops'),
    path.join(PLUGIN_ROOT, '..', 'research_agent_ops')
  ];

  for (const base of candidates) {
    try {
      if (fs.existsSync(base)) {
        const dirs = fs.readdirSync(base)
          .filter(d => d.startsWith('output_'))
          .map(d => ({ name: d, mtime: fs.statSync(path.join(base, d)).mtimeMs }))
          .sort((a, b) => b.mtime - a.mtime);
        if (dirs.length > 0) {
          return path.join(base, dirs[0].name);
        }
      }
    } catch (e) { /* continue */ }
  }
  return null;
}

function estimateOutputSize(dir) {
  let total = 0;
  try {
    const walk = (d) => {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
          try { total += fs.statSync(fullPath).size; } catch (e) { /* skip */ }
        }
      }
    };
    walk(dir);
  } catch (e) { /* ignore */ }
  return total;
}

// --- Determine severity level ---
function getLevel(remainingPct) {
  if (remainingPct <= THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (remainingPct <= THRESHOLDS.WARNING) return 'WARNING';
  if (remainingPct <= THRESHOLDS.CAUTION) return 'CAUTION';
  return 'NORMAL';
}

// --- Severity ordering for escalation detection ---
const SEVERITY_ORDER = { NORMAL: 0, CAUTION: 1, WARNING: 2, CRITICAL: 3 };

// --- Generate advice per level ---
function generateAdvice(level, remainingPct, metrics) {
  const header = '═'.repeat(60);
  const lines = [];

  if (level === 'CAUTION') {
    lines.push(header);
    lines.push('  CONTEXT OPTIMIZATION — CAUTION');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% (source: ${metrics.source})`);
    lines.push('');
    lines.push('  Optimization tips for all agents:');
    lines.push('  - Summarize completed outputs to key findings (name, score, executor_params)');
    lines.push('  - Reference files by path — don\'t re-read already-processed files');
    lines.push('  - Use structured tables, not prose paragraphs');
    lines.push('  - Drop intermediate reasoning chains — keep conclusions only');
    lines.push('  - When spawning subagents, pass only the RELEVANT section of context');
    lines.push(header);
  }

  if (level === 'WARNING') {
    lines.push(header);
    lines.push('  ⚠ CONTEXT WARNING — COMPRESS AGGRESSIVELY');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% — approaching limit`);
    lines.push('');
    lines.push('  MANDATORY for all agents:');
    lines.push('  1. Write ALL current working state to files immediately');
    lines.push('  2. Summarize strategies to: name | score | 3-line synopsis | executor_params');
    lines.push('  3. Subagents: output ONLY final schema, zero reasoning chains');
    lines.push('  4. Reference file paths, never quote file content inline');
    lines.push('  5. Project Lead: begin drafting session_handoff.md proactively');
    lines.push('  6. Do NOT re-read large files — use summaries from previous reads');
    lines.push('  7. Collapse regime matrix to: versatility_score + best/worst regime only');
    lines.push('');
    lines.push('  KEY INFORMATION TO PRESERVE (never drop these):');
    lines.push('  - Strategy names, confidence scores, regime versatility scores');
    lines.push('  - Executor params (complete JSON blocks)');
    lines.push('  - Critical flags: [VERIFY], [STALE], [COMPLIANCE_RISK], [IV_MISMATCH]');
    lines.push('  - Pipeline stage and completion status per agent');
    lines.push(header);
  }

  if (level === 'CRITICAL') {
    lines.push(header);
    lines.push('  🛑 CONTEXT CRITICAL — EMERGENCY HANDOFF');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% — IMMEDIATE ACTION REQUIRED`);
    lines.push('');
    lines.push('  STOP all new agent spawning immediately.');
    lines.push('');
    lines.push('  EMERGENCY PROTOCOL:');
    lines.push('  1. Write session_handoff.md to output directory with:');
    lines.push('     - Pipeline stage and completion status per agent');
    lines.push('     - ALL strategy data collected (full schema for each)');
    lines.push('     - shared_context.json snapshot');
    lines.push('     - run_state.json snapshot');
    lines.push('     - Remaining work queue (which agents still need to run)');
    lines.push('     - All output file paths');
    lines.push('  2. Update run_state.json: status = "SUSPENDED_CONTEXT_LIMIT"');
    lines.push('  3. Attempt to schedule resume via MCP scheduled-tasks tool:');
    lines.push('     - Task ID: "trading-research-resume"');
    lines.push('     - Schedule: 60 minutes from now');
    lines.push('     - Prompt: "Resume trading research pipeline from session_handoff.md"');
    lines.push('  4. If scheduling unavailable, output to user:');
    lines.push('     "Pipeline suspended at context limit. Resume with:');
    lines.push('      /trading-research-agent:run_research_agent --resume"');
    lines.push('  5. EXIT — no further agent spawning permitted');
    lines.push('');
    lines.push('  DO NOT LOSE THIS INFORMATION:');
    lines.push('  - Every strategy collected so far (name, score, full schema)');
    lines.push('  - Every executor_params block');
    lines.push('  - Every regime performance matrix');
    lines.push('  - Current IV regime and shared context');
    lines.push('  - Which scouts/verifiers completed vs pending');
    lines.push(header);
  }

  return lines.join('\n');
}

// --- Main ---
async function main() {
  // Read stdin with timeout (prevent hanging — refs gsd issues #775, #1162)
  let input = '';
  try {
    const stdinPromise = new Promise((resolve) => {
      const chunks = [];
      process.stdin.on('data', (chunk) => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
      process.stdin.on('error', () => resolve(''));
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(''), INPUT_TIMEOUT_MS));
    input = await Promise.race([stdinPromise, timeoutPromise]);
  } catch (e) {
    input = '';
  }

  // Get context metrics
  const metrics = getContextMetrics();
  if (!metrics) {
    // No metrics available — exit silently
    process.exit(0);
  }

  const remainingPct = metrics.remaining_pct;
  const level = getLevel(remainingPct);

  if (level === 'NORMAL') {
    process.exit(0);
  }

  // Load state for debounce
  const state = loadState();
  state.callsSinceLastWarning++;

  // Check debounce — severity escalation bypasses debounce
  const isEscalation = SEVERITY_ORDER[level] > SEVERITY_ORDER[state.lastLevel];
  if (!isEscalation && state.callsSinceLastWarning < DEBOUNCE_MIN_CALLS) {
    saveState(state);
    process.exit(0);
  }

  // Generate and emit advice
  const advice = generateAdvice(level, remainingPct, metrics);

  const output = {
    hookSpecificOutput: {
      additionalContext: advice
    }
  };

  console.log(JSON.stringify(output));

  // Update state
  state.lastLevel = level;
  state.callsSinceLastWarning = 0;
  saveState(state);

  process.exit(0);
}

main().catch(() => process.exit(0));
```

- [ ] **Step 2: Verify the file was created**

Read `hooks/context-compression-advisor.js` and confirm it's complete (check for the final `main().catch(...)` line).

- [ ] **Step 3: Commit**

```bash
git add hooks/context-compression-advisor.js
git commit -m "feat(hooks): add 4-tier context-compression-advisor with emergency handoff"
```

---

### Task 8: Update hooks.json — Replace context-window-monitor

**Files:**
- Modify: `hooks/hooks.json:26-40` (PreToolUse Agent matcher section)

- [ ] **Step 1: Replace the context-window-monitor.sh entry with new hook**

In `hooks/hooks.json`, find the PreToolUse → Agent matcher block (lines 26-40). Replace the `context-window-monitor.sh` entry with the new JS hook, and MOVE it to PostToolUse:

First, remove from PreToolUse (lines 28-33):
```json
{
  "type": "command",
  "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/context-window-monitor.sh\"",
  "timeout": 10
},
```

Then add to PostToolUse section (after the existing Write|Edit matcher block, add a new Agent matcher):

The final `hooks.json` should look like:

```json
{
  "hooks": {
    "SessionStart": [
    {
      "matcher": "startup",
      "hooks": [
        {
          "type": "command",
          "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/pre-run-environment-check.sh\"",
          "timeout": 15
        }
      ]
    }
  ],
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "python \"${CLAUDE_PLUGIN_ROOT}/hooks/file-write-lock.py\" acquire \"$FILE_PATH\"",
          "timeout": 35
        }
      ]
    },
    {
      "matcher": "Agent",
      "hooks": [
        {
          "type": "command",
          "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/iv-environment-pre-check.sh\"",
          "timeout": 20
        }
      ]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "python \"${CLAUDE_PLUGIN_ROOT}/hooks/file-write-lock.py\" release \"$FILE_PATH\"",
          "timeout": 10
        },
        {
          "type": "command",
          "command": "python \"${CLAUDE_PLUGIN_ROOT}/hooks/rule-updater.py\" \"$FILE_PATH\"",
          "timeout": 15
        },
        {
          "type": "command",
          "command": "python \"${CLAUDE_PLUGIN_ROOT}/hooks/output-integrity-validator.py\" \"$FILE_PATH\"",
          "timeout": 20
        }
      ]
    },
    {
      "matcher": "Agent",
      "hooks": [
        {
          "type": "command",
          "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/context-compression-advisor.js\"",
          "timeout": 15
        }
      ]
    }
  ],
  "SubagentStop": [
    {
      "matcher": ".*",
      "hooks": [
        {
          "type": "command",
          "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/scout-health-monitor.sh\" check",
          "timeout": 15
        }
      ]
    }
  ]
  }
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('VALID JSON')"`
Expected: `VALID JSON`

- [ ] **Step 3: Commit**

```bash
git add hooks/hooks.json
git commit -m "feat(hooks): replace context-window-monitor with context-compression-advisor"
```

---

### Task 9: Update Run Command — Pts Output, Session Resume

**Files:**
- Modify: `commands/run_research_agent.md`

- [ ] **Step 1: Add --resume flag to configuration table (line 29)**

Add after `--dry-run` row:

```markdown
| `--resume` | `true`, `false` | `false` | Resume a previously suspended run from session_handoff.md |
```

- [ ] **Step 2: Update the Report Configuration output (lines 56-68)**

Add to the config report:

```markdown
   Output Format: Points-based (P&L in pts, margin/costs in ₹)
   Regime Matrix: Required (12 regime combos per strategy)
   Executor Params: Required (algo-trading ready)
```

- [ ] **Step 3: Add resume logic after flag parsing (after line 31)**

Add a new section 1b:

```markdown
### 1b. Resume Check

If `--resume=true`:
1. Look for `session_handoff.md` in the most recent output directory
2. If found, read it and extract:
   - Pipeline stage at suspension
   - Completed work
   - Remaining work queue
   - Shared context snapshot
3. Pass all of this to the Project Lead with the resume flag
4. Skip Pre-Flight Validation (already done in original run)
5. The Lead's Resume/Recovery Logic (Section 1b of lead.md) handles the rest
```

- [ ] **Step 4: Update post-completion summary to mention pts format (lines 122-152)**

In the Results table, add a note:

```markdown
   Format: All P&L in pts | Margin/costs in ₹
   Regime Coverage: X/12 avg versatility score
```

- [ ] **Step 5: Verify and commit**

```bash
git add commands/run_research_agent.md
git commit -m "feat(command): add resume flag, pts format notes, regime coverage"
```

---

### Task 10: Update output-integrity-validator.py — Add pts and executor checks

**Files:**
- Modify: `hooks/output-integrity-validator.py`

- [ ] **Step 1: Add regime matrix detection**

In the schema validation section, add a check for `Regime Performance Matrix` or `regime_performance_matrix` in strategy output files:

```python
# Check for regime performance matrix
if 'Regime Performance Matrix' not in content and 'regime_performance_matrix' not in content:
    warnings.append(f"WARN: {filepath} — Missing Regime Performance Matrix")
```

- [ ] **Step 2: Add executor params detection**

```python
# Check for executor parameters
if 'executor_params' not in content and 'Executor Parameters' not in content:
    warnings.append(f"WARN: {filepath} — Missing Executor Parameters block")
```

- [ ] **Step 3: Add pts convention check**

```python
# Check for pts convention (warn if ₹ appears in P&L fields without pts)
import re
rupee_in_pl = re.findall(r'(?:Max Profit|Max Loss|Profit Target|Stop Loss).*?₹\d', content)
if rupee_in_pl:
    warnings.append(f"WARN: {filepath} — P&L values may be in ₹ instead of pts: {rupee_in_pl[:3]}")
```

- [ ] **Step 4: Verify and commit**

```bash
git add hooks/output-integrity-validator.py
git commit -m "feat(validator): add regime matrix, executor params, pts convention checks"
```

---

### Task 11: Update scout-health-monitor.sh — Add New Validation Checks

**Files:**
- Modify: `hooks/scout-health-monitor.sh`

- [ ] **Step 1: Add regime matrix check to scout output validation**

In the validation section that checks for required schema fields, add:

```bash
# Check for Regime Performance Matrix
if ! grep -qi "Regime Performance Matrix\|regime_versatility_score" "$file"; then
    echo "  WARN: Missing Regime Performance Matrix"
    issues=$((issues + 1))
fi
```

- [ ] **Step 2: Add executor params check**

```bash
# Check for Executor Parameters
if ! grep -qi "executor_params\|Executor Parameters" "$file"; then
    echo "  WARN: Missing Executor Parameters"
    issues=$((issues + 1))
fi
```

- [ ] **Step 3: Add pts convention check**

```bash
# Check that P&L uses pts, not ₹
if grep -P "Max Profit.*₹\d|Max Loss.*₹\d" "$file" > /dev/null 2>&1; then
    echo "  WARN: P&L values appear to be in ₹ instead of pts"
    issues=$((issues + 1))
fi
```

- [ ] **Step 4: Verify and commit**

```bash
git add hooks/scout-health-monitor.sh
git commit -m "feat(scout-health): add regime matrix, executor params, pts checks"
```

---

### Task 12: Update pre-run-environment-check.sh — Check new hook file

**Files:**
- Modify: `hooks/pre-run-environment-check.sh`

- [ ] **Step 1: Add context-compression-advisor.js to file existence checks**

Find the section that checks for hook file existence. Add:

```bash
# Check context-compression-advisor.js exists
if [ ! -f "$PLUGIN_ROOT/hooks/context-compression-advisor.js" ]; then
    echo "  FAIL: hooks/context-compression-advisor.js not found"
    fails=$((fails + 1))
else
    echo "  PASS: hooks/context-compression-advisor.js"
fi
```

- [ ] **Step 2: Verify and commit**

```bash
git add hooks/pre-run-environment-check.sh
git commit -m "feat(env-check): add context-compression-advisor.js to validation"
```

---

### Task 13: Final Verification Pass

- [ ] **Step 1: Run the pre-run environment check**

```bash
cd trading_research_agent && bash hooks/pre-run-environment-check.sh
```

Expected: All PASS, no FAIL.

- [ ] **Step 2: Validate hooks.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('VALID')"
```

Expected: `VALID`

- [ ] **Step 3: Validate context-compression-advisor.js has no syntax errors**

```bash
node -c hooks/context-compression-advisor.js
```

Expected: No errors.

- [ ] **Step 4: Spot-check all agent files for consistency**

For each agent file, grep for key terms to verify philosophy was injected:

```bash
grep -l "Trading Philosophy" agents/*.md
```

Expected: All 5 agent files listed.

```bash
grep -l "points (pts)\|POINTS (pts)" agents/*.md
```

Expected: All 5 agent files listed.

```bash
grep -l "Regime" agents/*.md
```

Expected: All 5 agent files listed.

- [ ] **Step 5: Verify no ₹ remains in P&L template sections of scout.md**

```bash
grep -n "₹" agents/scout.md
```

Expected: Only appears in Margin Required, transaction costs, and ROM formula context — NOT in Max Profit, Max Loss, Breakeven, Theta Profile, or Greeks P&L.

- [ ] **Step 6: Final commit — update changelog entries**

Verify each agent file has an updated changelog entry noting the v2.0/v2.1 changes.

```bash
git log --oneline -15
```

Verify all commits are present and well-formed.
