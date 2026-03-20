---
name: Context Manager
description: This skill should be used when managing context window capacity across long-running pipeline executions, preserving critical state between agent tiers, saving and restoring pipeline checkpoints, optimizing context handoff between agents, or handling context overflow scenarios. Trigger phrases include "save context", "restore context", "context overflow", "context handoff", "pipeline checkpoint", "state preservation", "context budget", "memory management", "long-running session".
version: 1.0.0
---

# Context Manager — Pipeline State & Context Engineering Skill

## Purpose

Manages context window capacity, state preservation, and inter-agent context handoff across the four-tier trading research pipeline. Ensures that long-running pipeline executions maintain coherent state, that critical data survives tier transitions, and that context overflow is handled gracefully without losing essential information. Provides checkpoint/restore patterns for pipeline resilience.

## Stakeholder

Used by the **Project Lead** for pipeline-wide state management and checkpoint creation. Referenced by **ScoutLeaders** when managing scout context allocation, **Orchestrators** when handling context-heavy enrichment data, and **Verifiers** when context budgets are tight during multi-strategy analysis.

## Instructions

### 1. Context Inventory — What Lives Where

The pipeline maintains state across multiple files and in-memory context. Understanding what goes where is critical:

| State Element | Storage Location | Lifecycle | Access Pattern |
|--------------|-----------------|-----------|----------------|
| **Run configuration** | `run_state.json` | Full run | Read by all; written by Lead |
| **IV regime, expiry calendar** | `shared_context.json` | Full run | Read by all; written by Lead at start |
| **Source list** | `shared_context.json` | Full run | Written by Lead; read by ScoutLeaders/Scouts |
| **Scout raw output** | `{bias}/scouts/{domain}.md` | Post-scouting | Written by Scout; read by Orchestrator |
| **Enriched strategies** | `{bias}/enriched/{expiry}.md` | Post-enrichment | Written by Orchestrator; read by Verifier |
| **Verified strategies** | `{bias}/verified/{expiry}.md` | Post-verification | Written by Verifier; read by Lead |
| **Final selections** | `final/top3_{bias}_{expiry}.md` | Post-synthesis | Written by Lead; read by user |
| **Indian market rules** | `rules/OptionsTrading.md` | Persistent | Read by Orchestrators, Verifiers, Lead |
| **Agent instructions** | `agents/*.md` | Persistent | Read by spawning agent; passed to subagent |

### 2. Context Window Budget Protocol

#### Capacity Estimation

Estimate context window usage before loading data:

```
Token estimate = file_size_bytes / 4
200K context window ≈ 800K characters ≈ 200K tokens
```

**Budget allocation per agent tier:**

| Tier | Agent | Recommended Max Context Load | Rationale |
|------|-------|------------------------------|-----------|
| 1 | Project Lead | 60% of window | Needs to hold run state, summary of all outputs, rules |
| 2 | ScoutLeader | 40% of window | Manages scout assignments, monitors 4 outputs |
| 3a | Scout | 35% of window | Needs web content, strategy templates, source data |
| 3b | Orchestrator | 55% of window | Loads all 4 scout outputs + enrichment data |
| 4 | Verifier | 45% of window | Loads enriched strategies + rubric + rules |

#### Threshold Actions

| Usage Level | Action |
|------------|--------|
| **< 50%** | Normal operation — continue loading data as needed |
| **50-70%** | Caution — avoid loading full files; use selective reads with line offsets |
| **70-85%** | Warning — trigger progressive summarization of loaded context |
| **> 85%** | Critical — write current work to file; summarize aggressively; reload only essentials |

### 3. Context Saving — Pipeline Checkpoints

#### When to Create Checkpoints

Create a checkpoint at each major pipeline transition:

1. **Post-initialization:** After Lead creates workspace and populates shared_context.json
2. **Post-scouting:** After all scouts complete and Confirmation Gate passes
3. **Post-enrichment:** After Orchestrator completes enrichment for a bias
4. **Post-verification:** After all Verifiers complete for a bias
5. **Pre-synthesis:** Before Lead begins final top-3 selection

#### Checkpoint Data Structure

Save checkpoint state to `run_state.json`:

```json
{
  "checkpoints": [
    {
      "stage": "POST_SCOUTING",
      "timestamp": "2026-03-20T15:30:00+05:30",
      "completed_agents": ["bullish_scoutleader", "bearish_scoutleader"],
      "output_files_created": [
        "bullish/scouts/websearch.md",
        "bullish/scouts/reddit.md",
        "bullish/scouts/forums.md",
        "bullish/scouts/tradingview.md",
        "bearish/scouts/websearch.md",
        "bearish/scouts/reddit.md",
        "bearish/scouts/forums.md",
        "bearish/scouts/tradingview.md"
      ],
      "strategies_count": {
        "bullish": 20,
        "bearish": 19
      },
      "iv_regime_at_checkpoint": "MEDIUM",
      "errors": [],
      "warnings": ["bearish_forums_scout respawned once"]
    }
  ]
}
```

### 4. Context Restoration — Pipeline Recovery

#### Recovery Scenarios

| Scenario | Recovery Protocol |
|----------|-------------------|
| **Session timeout mid-scouting** | Read `run_state.json` for last checkpoint; identify which scouts completed; respawn only incomplete scouts |
| **Context window overflow** | Save current progress to files; create a fresh agent with summarized context; continue from last written output |
| **Agent crash during enrichment** | Read enriched files already written; identify which strategies still need enrichment; continue from last complete strategy |
| **Lead loses state after Confirmation Gate** | Re-read all scout output files; reconstruct the consolidated strategy inventory; proceed to orchestration |

#### Restoration Steps

1. **Read `run_state.json`** — Determine the last successful checkpoint
2. **Validate output files** — Check that all files listed in the checkpoint exist and are non-empty
3. **Load minimal context** — Only load what's needed for the CURRENT stage, not the entire history
4. **Resume from checkpoint** — Spawn the appropriate agents for the next stage

### 5. Inter-Agent Context Handoff Patterns

#### Pattern 1: File-Based Handoff (Default)

```
Agent A writes output to file → Agent B reads output from file
```

**Advantages:** Clean separation, auditable, survives context window resets
**Disadvantages:** Requires file I/O, potential lock contention

**Use for:** Scout → Orchestrator, Orchestrator → Verifier, Verifier → Lead

#### Pattern 2: Parameter Passing

```
Parent agent passes context as prompt parameter to child agent
```

**Advantages:** No file I/O, immediate availability
**Disadvantages:** Consumes parent's context window, data lost if parent crashes

**Use for:** Lead → ScoutLeader (configuration), ScoutLeader → Scout (assignment)

#### Pattern 3: Shared Context File

```
All agents read from shared_context.json
Lead writes; all others read-only
```

**Advantages:** Single source of truth, consistent across agents
**Disadvantages:** All agents load it, consuming context budget

**Use for:** IV regime, expiry calendar, source list — data that ALL agents need

### 6. Context Prioritization Rules

When context budget is limited, prioritize information in this order:

1. **Current task instructions** (agent's own instructions — non-negotiable)
2. **Active strategy data** (the strategies currently being processed)
3. **Scoring rubric** (for Verifiers — defines output quality)
4. **Indian market rules** (for compliance checking)
5. **IV regime and expiry calendar** (for relevance filtering)
6. **Historical context and enrichment data** (for depth of analysis)
7. **Source validation and citation data** (for audit trail)
8. **Performance metrics and run state** (for monitoring)

If context is critically constrained, items 6-8 can be summarized or deferred to file-based lookup.

### 7. Long-Running Session Management

#### Session Continuity

For pipeline runs that exceed a single session's context window:

1. **Pre-emptive summarization:** At 60% context usage, summarize completed work
2. **Incremental file writing:** Write completed analysis to files immediately, don't accumulate in memory
3. **Session handoff protocol:**
   - Write a `session_handoff.md` file with:
     - Current pipeline stage
     - Summary of completed work
     - List of remaining tasks
     - Key data points (IV regime, top candidates so far)
     - File paths for all intermediate outputs
   - New session reads `session_handoff.md` to restore context

#### Memory Management Best Practices

| Practice | Implementation |
|----------|---------------|
| **Load lazily** | Don't read all scout files at once; load as needed for each strategy |
| **Write eagerly** | After verifying a strategy, write the result immediately; don't hold all verifications in memory |
| **Summarize aggressively** | Once a strategy is verified, replace the full enrichment data with a summary in working memory |
| **Reference, don't embed** | Instead of embedding full file contents, use file paths and load on-demand |
| **Clear completed data** | After writing a checkpoint, mental note that pre-checkpoint data is in files, not needed in context |

### 8. Error Recovery Patterns

| Error | Recovery |
|-------|----------|
| **File write failed** | Retry with `file-write-lock.py`; if lock timeout, force-release and retry; if disk error, log and continue with in-memory state |
| **shared_context.json corrupted** | Re-fetch IV data and expiry calendar from web; reconstruct shared_context.json |
| **Scout output file missing** | Check if scout completed; if yes, it may be a path error — search for the file; if no, respawn scout |
| **run_state.json stale** | Rebuild from directory listing — check which output files exist to determine pipeline stage |
| **Context window hard limit hit** | Emergency: write ALL current state to files; create new agent with minimal context (just instructions + file paths); continue |

## Changelog

`[Built from scratch — v1.0]`
