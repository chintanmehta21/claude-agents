---
description: Run the full Indian options trading strategy research pipeline. Spawns the Project Lead to orchestrate four-tier multi-agent research, filtering, validation, and ranking of bullish and bearish options strategies.
argument-hint: "[--output-dir=<path>] [--mode=full|bullish_only|bearish_only] [--expiry=all|weekly|monthly|quarterly] [--max-respawns=N] [--iv-filter=true|false] [--dedup=true|false] [--dry-run=true|false]"
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent", "WebSearch", "WebFetch", "TodoWrite"]
---

## Purpose

This command initializes and executes the full Indian options trading strategy research pipeline. It sets up the workspace, loads the architecture context, parses configuration flags, and triggers the Project Lead agent to orchestrate the four-tier hierarchy: ScoutLeader → Scouts → Orchestrator → Verifiers → Final Synthesis.

## Stakeholder

This command is invoked directly by the user. It is the entry point for the entire pipeline.

## Instructions

### 1. Parse Configuration Flags

Parse the following flags from the command arguments. Use defaults where not specified.

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--output-dir` | Directory path | `<cwd>/research_agent_ops/output_DDMM` | Base directory for all pipeline output. If not specified, creates `research_agent_ops/output_DDMM/` in the current working directory (DDMM = today's date, e.g., `output_2003` for March 20). |
| `--mode` | `full`, `bullish_only`, `bearish_only` | `full` | Which directional biases to research |
| `--expiry` | `all`, `weekly`, `monthly`, `quarterly` | `all` | Which expiry categories to target |
| `--max-respawns` | Integer (1-5) | `2` | Maximum scout respawn attempts before marking exhausted |
| `--iv-filter` | `true`, `false` | `true` | Whether to filter strategies by current IV regime compatibility |
| `--dedup` | `true`, `false` | `true` | Whether to run cross-scout deduplication |
| `--dry-run` | `true`, `false` | `false` | Validate configuration and report plan without executing |

If no arguments are provided, run with all defaults (full mode, all expiries, output in current working directory).

### 2. Pre-Flight Validation

Before spending tokens on the pipeline:

1. **Verify plugin structure exists:**
   - Check that `agents/lead.md` exists and is readable
   - Check that `agents/ScoutLeader.md`, `agents/scout.md`, `agents/orchestrator.md`, `agents/verifier.md` exist
   - Check that `rules/OptionsTrading.md` exists
   - Check that `README.md` exists
   - If any critical file is missing, report the error and abort

2. **Resolve output directory:**
   - If `--output-dir` is provided, use that path as the base output directory
   - If not provided, determine the current working directory (use `pwd`) and set the output path to `<cwd>/research_agent_ops/output_DDMM/` where DDMM is today's date (e.g., `output_2003` for March 20)
   - **IMPORTANT:** Never create output inside the plugin directory itself
   - If the resolved directory already exists, append a sequential suffix (`_2`, `_3`, etc.)
   - Create the full directory tree as defined in `agents/lead.md` Section 1

3. **Load architecture context:**
   - Read `AGENT_FLOW.dot` to understand the pipeline flow
   - Read `README.md` for the Strategy Output Schema and Constraint Matrix

4. **Report configuration:**
   ```
   Trading Research Pipeline — Configuration
   ═══════════════════════════════════════════
   Mode: [mode]
   Expiry Filter: [expiry]
   Max Respawns: [max-respawns]
   IV Filter: [iv-filter]
   Deduplication: [dedup]
   Dry Run: [dry-run]

   Pipeline Files: ✓ All present
   Output Directory: <resolved_output_path>/
   ```

5. **If `--dry-run=true`:** Report the above configuration and exit without spawning any agents. Show what WOULD happen:
   ```
   Dry Run Summary:
   - Would spawn 2 ScoutLeaders (Bullish + Bearish)
   - Each would spawn 4 Scouts (8 total)
   - Would create 8 scout output files (5 strategies each = 40 strategies)
   - After dedup and enrichment: ~30 strategies estimated
   - Would spawn 6 Verifiers (3 per bias × 2 biases)
   - Final output: Top 3 per category per bias (up to 18 strategies)
   ```

### 3. Initialize TodoWrite Tracking

Create a comprehensive todo list to track pipeline progress:

```
[ ] Pre-flight validation
[ ] Workspace initialization
[ ] IV environment pre-check
[ ] Source research
[ ] Spawn Bullish ScoutLeader
[ ] Spawn Bearish ScoutLeader (if mode != bullish_only)
[ ] Confirmation Gate — validate all scout outputs
[ ] Spawn Bullish Orchestrator
[ ] Spawn Bearish Orchestrator (if mode != bullish_only)
[ ] Verifier tier completion
[ ] Final synthesis — top 3 selection
[ ] Generate final report
```

### 4. Launch Project Lead

Spawn the **Project Lead** agent using the Agent tool:

1. Read the full text of `agents/lead.md`
2. Construct the Lead's context package:
   - Parsed configuration flags
   - Run directory path
   - Current timestamp
   - Architecture reference (AGENT_FLOW.dot content)
   - Strategy Output Schema (from README.md)
   - Rules baseline (from rules/OptionsTrading.md)
3. Spawn the Lead as a subagent with the full prompt and context
4. The Lead takes over from here — it manages all subsequent agent spawning, monitoring, and synthesis

### 5. Post-Completion

After the Lead reports completion:

1. Read the final report from `run_state.json`
2. List all generated output files in the `final/` directory
3. Present a summary to the user:
   ```
   Pipeline Complete
   ═════════════════
   Run ID: output_DDMM
   Output: <resolved_output_path>/
   Duration: [time]

   Results:
   ┌─────────────┬───────────┬────────────┬─────────────┐
   │ Category    │ Bullish   │ Bearish    │ Total       │
   ├─────────────┼───────────┼────────────┼─────────────┤
   │ Weekly      │ 3 strats  │ 3 strats   │ 6           │
   │ Monthly     │ 3 strats  │ 3 strats   │ 6           │
   │ Quarterly   │ 3 strats  │ 3 strats   │ 6           │
   ├─────────────┼───────────┼────────────┼─────────────┤
   │ Total       │ 9         │ 9          │ 18          │
   └─────────────┴───────────┴────────────┴─────────────┘

   Output files:
   - <output_path>/final/top3_bullish_weekly.md
   - <output_path>/final/top3_bullish_monthly.md
   - <output_path>/final/top3_bullish_quarterly.md
   - <output_path>/final/top3_bearish_weekly.md
   - <output_path>/final/top3_bearish_monthly.md
   - <output_path>/final/top3_bearish_quarterly.md

   Warnings: [count]
   Audit gaps: [count]

   View detailed results: Read the files in <output_path>/final/
   ```

4. If the pipeline encountered errors, list them with resolution status
5. If any strategies have `[VERIFY]` flags, recommend manual follow-up

## Changelog

`[Built from scratch — v1.0]`
