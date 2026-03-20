# Indian Options Trading Strategy Research Pipeline

## Purpose

This plugin implements a production-grade, four-tier hierarchical multi-agent pipeline that autonomously mines, filters, validates, and ranks high-probability bullish and bearish options trading strategies for the Indian stock market (NSE/BSE derivatives). The system operates across three temporal categories — **Weekly**, **Monthly**, and **Quarterly** expiry cycles — and delivers the **top 3 validated strategies per category per directional bias** (Bullish and Bearish).

The pipeline is designed for deployment inside a Claude Code environment using the Agent tool for subagent orchestration. Every agent file is self-contained and immediately executable as a subagent prompt.

## Stakeholder

This document is the root reference for the entire system. It is owned by the **Project Lead** agent (`agents/lead.md`) and may be consulted by every tier in the pipeline. All agents inherit the behavioral rules, constraint matrix, and failure resolution logic defined here.

## System Architecture

The architecture follows a four-tier hierarchy as defined in `flow.jpg` and `AGENT_FLOW.dot`:

```
┌─────────────────────────────────────────────────────────────┐
│                      PROJECT LEAD                           │
│              (Orchestration & Final Synthesis)               │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│   SCOUTLEADER       │          │   SCOUTLEADER        │
│   (Bullish Bias)    │          │   (Bearish Bias)     │
└──────┬──┬──┬──┬─────┘          └──────┬──┬──┬──┬──────┘
       │  │  │  │                       │  │  │  │
       ▼  ▼  ▼  ▼                      ▼  ▼  ▼  ▼
    4 Scouts per bias              4 Scouts per bias
    (WebSearch, Reddit,            (WebSearch, Reddit,
     Forums, TradingView)           Forums, TradingView)
       │  │  │  │                       │  │  │  │
       ▼  ▼  ▼  ▼                      ▼  ▼  ▼  ▼
    Output files (5 strategies each)
           │                                  │
           ▼                                  ▼
    ┌─── CONFIRMATION GATE (Project Lead) ───┐
           │                                  │
           ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│  BULLISH             │          │  BEARISH             │
│  ORCHESTRATOR        │          │  ORCHESTRATOR        │
└──────┬──┬──┬─────────┘          └──────┬──┬──┬────────┘
       │  │  │                           │  │  │
       ▼  ▼  ▼                          ▼  ▼  ▼
    3 Verifiers                      3 Verifiers
    (per expiry category)            (per expiry category)
       │  │  │                           │  │  │
       ▼  ▼  ▼                          ▼  ▼  ▼
    Output files                     Output files
           │                                  │
           └──────────► PROJECT LEAD ◄────────┘
                    (Top 3 Selection)
```

### Tier Descriptions

| Tier | Agent | Role |
|------|-------|------|
| 1 — Command | Project Lead | Creates workspace, spawns ScoutLeaders and Orchestrators, manages run state, performs final top-3 synthesis |
| 2 — Strategy | ScoutLeader | Spawns 4 domain-specific scouts per directional bias, enforces temporal segmentation, monitors scout health, triggers respawn |
| 3a — Research | Scout | Mines strategies from assigned domain (WebSearch / Reddit / Trading Forums / TradingView-Zerodha), outputs 5 strategies per strict schema |
| 3b — Enrichment | Orchestrator | Receives scout outputs, enriches with historical context and chain dynamics, spawns Verifiers per expiry category |
| 4 — Validation | Verifier | Adversarial red-team critique, pro/con debate, historical scenario mapping, confidence scoring via standardized rubric |

### Data Flow

1. **Project Lead** initializes the run directory and spawns two ScoutLeader instances (Bullish, Bearish)
2. Each **ScoutLeader** spawns 4 Scouts assigned to different research domains, segmented by expiry type (Weekly/Monthly/Quarterly)
3. Each **Scout** outputs exactly 5 strategies to its assigned output file following the Strategy Schema
4. **Project Lead** confirms all scout output files exist and are schema-valid (Confirmation Gate)
5. **Orchestrators** (Bullish, Bearish) receive validated scout outputs, enrich them, and spawn Verifiers
6. Each **Verifier** adversarially critiques strategies and produces confidence-scored output
7. **Project Lead** reads all verified outputs and selects the top 3 strategies per expiry category per bias

## Installation & Setup

### Prerequisites

- [Claude Code](https://claude.com/claude-code) v1.0.33 or later
- Python 3.8+ (for hook scripts: `rule-updater.py`, `file-write-lock.py`, `output-integrity-validator.py`)
- Bash (for hook scripts: `pre-run-environment-check.sh`, `scout-health-monitor.sh`, `context-window-monitor.sh`, `iv-environment-pre-check.sh`)

### Installation

**Option 1: Load directly (for testing/development)**

```bash
# Clone the repository
git clone https://github.com/MyAgents/trading-research-agent.git

# Run Claude Code with the plugin loaded
claude --plugin-dir ./trading-research-agent
```

**Option 2: Install from marketplace (when published)**

```bash
# Inside Claude Code:
/plugin install trading-research-agent
```

### Quick Start

Once the plugin is loaded:

```bash
# Run the full pipeline (all biases, all expiry categories)
/trading-research-agent:run_research_agent

# Run with custom output directory
/trading-research-agent:run_research_agent --output-dir=/path/to/output

# Bullish strategies only, weekly expiry
/trading-research-agent:run_research_agent --mode=bullish_only --expiry=weekly

# Dry run to validate configuration
/trading-research-agent:run_research_agent --dry-run=true
```

Output files are created in your **current working directory** under `research_agent_ops/output_DDMM/` (where DDMM is today's date, e.g., `output_2003` for March 20th). Use `--output-dir` to specify a custom location.

### Verify Installation

After loading the plugin, run:
```bash
/trading-research-agent:run_research_agent --dry-run=true
```

This validates that all agent files, rules, hooks, and skills are accessible without executing the pipeline.

## Directory Structure

### Plugin Structure (installed once)

```
trading_research_agent/
├── .claude-plugin/
│   └── plugin.json                    ← Plugin manifest
├── README.md                          ← This file
├── AGENT_FLOW.dot                     ← Graphviz source for architecture
├── flow.jpg                           ← Visual architecture diagram
│
├── agents/
│   ├── lead.md                        ← Project Lead agent
│   ├── ScoutLeader.md                 ← Scout spawner and monitor
│   ├── scout.md                       ← Research scout template
│   ├── orchestrator.md                ← Enrichment and Verifier spawner
│   └── verifier.md                    ← Adversarial validation agent
│
├── rules/
│   └── OptionsTrading.md              ← Indian market rules (living document)
│
├── commands/
│   └── run_research_agent.md          ← Master execution command
│
├── hooks/
│   ├── hooks.json                     ← Hook event configuration
│   ├── pre-run-environment-check.sh
│   ├── rule-updater.py
│   ├── scout-health-monitor.sh
│   ├── context-window-monitor.sh
│   ├── file-write-lock.py
│   ├── output-integrity-validator.py
│   └── iv-environment-pre-check.sh
│
└── skills/
    ├── bravesearch-mcp/SKILL.md       ← Web search query optimization
    ├── web-fetch-analyzer/SKILL.md    ← Content extraction and SPA handling
    ├── techno-fundamental-parser/SKILL.md ← Strategy classification
    ├── options-chain-fetcher/SKILL.md ← NSE options chain analysis
    ├── iv-regime-classifier/SKILL.md  ← India VIX regime classification
    ├── expiry-calendar-validator/SKILL.md ← Expiry schedule verification
    ├── correlation-deduplicator/SKILL.md ← Strategy deduplication
    ├── optimize-system/SKILL.md       ← Pipeline performance optimization
    └── context-management/SKILL.md    ← Context window & state management
```

### Runtime Output Structure (created per run in working directory)

Output is NEVER created inside the plugin directory. It is always created in the user's **current working directory** (or a user-specified path via `--output-dir`).

```
<working_directory>/
└── research_agent_ops/
    └── output_DDMM/                  ← DDMM = today's date (e.g., output_2003)
        ├── run_state.json            ← Pipeline state, checkpoints, errors
        ├── shared_context.json       ← IV regime, expiry calendar, sources
        ├── bullish/
        │   ├── scouts/               ← Raw scout research output
        │   │   ├── websearch.md      ← 5 strategies from web search
        │   │   ├── reddit.md         ← 5 strategies from Reddit
        │   │   ├── forums.md         ← 5 strategies from trading forums
        │   │   └── tradingview.md    ← 5 strategies from TradingView/Zerodha
        │   ├── enriched/             ← Orchestrator-enriched strategies
        │   │   ├── weekly.md         ← Weekly expiry strategies + historical context
        │   │   ├── monthly.md
        │   │   └── quarterly.md
        │   └── verified/             ← Verifier-scored strategies
        │       ├── weekly.md         ← Confidence-scored weekly strategies
        │       ├── monthly.md
        │       └── quarterly.md
        ├── bearish/
        │   ├── scouts/
        │   │   ├── websearch.md
        │   │   ├── reddit.md
        │   │   ├── forums.md
        │   │   └── tradingview.md
        │   ├── enriched/
        │   │   ├── weekly.md
        │   │   ├── monthly.md
        │   │   └── quarterly.md
        │   └── verified/
        │       ├── weekly.md
        │       ├── monthly.md
        │       └── quarterly.md
        └── final/                    ← Top 3 ranked strategies per category
            ├── top3_bullish_weekly.md
            ├── top3_bullish_monthly.md
            ├── top3_bullish_quarterly.md
            ├── top3_bearish_weekly.md
            ├── top3_bearish_monthly.md
            └── top3_bearish_quarterly.md
```

## Strategy Output Schema

Every strategy produced by any Scout must conform to this schema. Non-conforming output triggers a respawn.

```json
{
  "strategy_name": "string — descriptive, unique name",
  "bias": "BULLISH | BEARISH",
  "expiry_category": "WEEKLY | MONTHLY | QUARTERLY",
  "underlying": "NIFTY | BANKNIFTY | FINNIFTY | SENSEX | STOCK (specify)",
  "structure": "string — e.g., Bull Call Spread, Iron Condor, Ratio Backspread",
  "entry_conditions": {
    "technical": ["list of technical triggers with specific indicator values"],
    "fundamental": ["list of fundamental triggers if applicable"],
    "iv_environment": "LOW | MEDIUM | HIGH | EXTREME — required IV regime",
    "iv_percentile_range": "e.g., 20-40 (rolling 252-day percentile)",
    "timing": "string — e.g., 3 DTE for weekly, 15-20 DTE for monthly"
  },
  "legs": [
    {
      "action": "BUY | SELL",
      "option_type": "CE | PE",
      "strike_selection": "string — e.g., ATM, ATM+200, Delta 0.30",
      "quantity_lots": "integer",
      "expiry": "string — specific expiry reference"
    }
  ],
  "exit_conditions": {
    "profit_target": "string — e.g., 50% of max profit, or absolute ₹ value",
    "stop_loss": "string — e.g., 2x premium paid, or underlying breach level",
    "time_exit": "string — e.g., exit if not triggered by T-1 day",
    "adjustment_rules": ["list of conditions triggering leg adjustments"]
  },
  "risk_reward": {
    "max_profit": "string or number",
    "max_loss": "string or number",
    "breakeven": "string — breakeven point(s)",
    "margin_required": "string — approximate SPAN + exposure margin"
  },
  "edge_thesis": "2-3 sentence explanation of WHY this strategy has an edge — what market inefficiency or behavioral pattern does it exploit",
  "source": {
    "domain": "WEBSEARCH | REDDIT | FORUM | TRADINGVIEW_ZERODHA",
    "url_or_reference": "string — source URL, thread ID, or script name",
    "retrieval_date": "ISO date",
    "staleness_flag": "CURRENT | STALE (if >18 months old)"
  },
  "citations": ["list of source citations or [VERIFY: source needed] tags"],
  "backtest_data": "object with historical performance OR '[NO BACKTEST DATA AVAILABLE — synthesis only]'",
  "reasoning_chain": "string — full reasoning chain documenting why this strategy was selected, how the scout validated it, and what alternatives were considered"
}
```

## Constraint Matrix

| Constraint | Scope | Enforcement |
|------------|-------|-------------|
| Indian market only | All agents | Scouts must discard US-only instruments and translate to Indian equivalents with documented reasoning |
| Zero hallucinated backtest data | All agents | Use `[NO BACKTEST DATA AVAILABLE — synthesis only]` tag; never present synthesis as empirical |
| Source citation required | All factual claims | Every claim about market rules, tax rates, lot sizes, expiry mechanics must cite source or tag `[VERIFY: source needed]` |
| 18-month staleness threshold | All sourced data | Flag `[STALE — verify current applicability]` for data older than 18 months; cannot serve as primary evidence |
| Scout isolation | Scout tier | Scouts must not read each other's output directories; violation triggers full bias-tier restart |
| Minimum 5 strategies per scout | Scout tier | Scouts returning fewer than 5 schema-valid strategies are respawned with altered parameters |
| Standardized confidence rubric | Verifier tier | All Verifiers use the identical rubric from `agents/verifier.md` with version tag `[Rubric v1.0]` |
| Schema compliance | All output files | Every strategy must pass the Strategy Output Schema; validated by `output-integrity-validator.py` |
| File-level locking | Shared output files | `file-write-lock.py` provides mutex locking; 30-second timeout with deadlock detection |
| Context window monitoring | All agents | `context-window-monitor.sh` triggers summarization at 70% capacity threshold |

## Behavioral Rules

These rules are embedded in every agent file where they apply:

1. **Zero hallucination of backtest data** — State `[NO BACKTEST DATA AVAILABLE — synthesis only]` and document the full reasoning chain. Never present synthesized estimates as empirical results.
2. **Source citation requirement** — Every factual claim about market rules, tax rates, lot sizes, or expiry mechanics must include a direct citation or `[VERIFY: source needed]`.
3. **Staleness threshold** — Any sourced data older than 18 months must be flagged `[STALE — verify current applicability]` and cannot serve as primary evidence for a strategy's validity.
4. **Indian market primacy** — Any strategy element referencing US instruments must be translated to an Indian equivalent or discarded. Translation must be explicitly documented with reasoning.
5. **Isolation enforcement** — Scouts must not read each other's output directories until the Orchestrator tier. Cross-contamination detected by the health monitor triggers a full Scout tier restart for the affected directional bias.
6. **Confidence score standardization** — All Verifiers use the identical rubric defined in `agents/verifier.md`. Every score carries a rubric version tag.
7. **Knowledge boundary handling** — When an agent hits a genuine knowledge boundary: (a) attempt one fallback source, (b) if still empty, synthesize an informed hypothesis labelled `[HYPOTHESIS — unverified, LOW CONFIDENCE]` with full reasoning chain, (c) never fabricate data.

## Failure States & Resolution Logic

### Data & Sourcing Failures

| Failure | Responsible Agent | Resolution |
|---------|-------------------|------------|
| BraveSearch quota exhausted | Scout (via `bravesearch-mcp` skill) | Switch to WebFetch skill with direct URL scraping; if both fail, mark domain as `UNAVAILABLE` and proceed with remaining scouts; ScoutLeader logs degraded coverage |
| Pine Script obfuscated | Scout (TradingView domain) | Log `[OBFUSCATED — no recoverable logic]`; skip strategy and attempt next script; if >50% scripts obfuscated, fall back to TradingView idea descriptions |
| Paywalled forum | Scout (Forums domain) | Attempt Google Cache / archived version via WebFetch; if unavailable, log `[PAYWALL — no cached preview]` and skip; replace with alternative forum URL from Lead's source list |
| HTTP 200 with SPA shell, no content | Scout (any web domain) | Trigger `web-fetch-analyzer` skill for headless rendering; if still empty, flag `[SPA_SHELL — no rendered content]` and skip |
| Duplicate strategy across scouts | Orchestrator | `correlation-deduplicator` skill computes similarity; same underlying + same structure + same expiry = duplicate; keep highest-quality version, discard others |
| Two identical strategies with different names | Orchestrator | Alias deduplication: normalize strategy names, compare leg structures; if structurally identical, merge under canonical name |
| Stale data presented as current edge | Verifier | Flag `[STALE — verify current applicability]`; reduce confidence score by 20 points; cannot appear in top-3 if only evidence is stale |

### Market & Instrument Failures

| Failure | Responsible Agent | Resolution |
|---------|-------------------|------------|
| Discontinued/restructured NSE weekly expiry | Scout / Verifier | `expiry-calendar-validator` skill cross-references against live NSE calendar; flag and discard strategies referencing invalid expiry series |
| India VIX anomalous (election/budget/RBI) | Lead / Verifier | `iv-regime-classifier` skill detects extreme regime; strategies designed for low-IV are flagged `[IV_MISMATCH — current regime incompatible]`; Lead deprioritizes in final selection |
| Required strikes have zero OI | Verifier | Flag `[ZERO_OI — liquidity risk]`; confidence score penalty of 15 points; include alternative strike suggestion if available |
| Lot size revision mid-run | Lead | Re-read `rules/OptionsTrading.md` for current lot sizes; flag affected strategies for risk-reward recalculation; `rule-updater.py` merges new lot size |
| Corporate action on underlying | Scout / Verifier | `techno-fundamental-parser` skill flags corporate events; if event has passed, mark strategy as `[CORPORATE_ACTION_EXPIRED]`; if pending, note timeline |
| T+1 physical vs. cash settlement confusion | Verifier | Verify settlement type against NSE circular; physical delivery applies to stock options ITM at expiry; flag incorrect assumptions |

### Agent Behavior Failures

| Failure | Responsible Agent | Resolution |
|---------|-------------------|------------|
| Scout recursive respawn loop | ScoutLeader | Track respawn count per scout; if scout respawned >2 times with same failing parameters, alter search parameters (different keywords, time range, domain); if 3rd respawn also fails, log `[SCOUT_EXHAUSTED]` and proceed with available output |
| Contradictory historical context | Orchestrator | When two sources conflict, present both with citations; flag `[CONFLICTING_SOURCES — manual review needed]`; do not silently choose one |
| Opposing Verifier confidence scores | Lead | If two Verifiers score the same strategy >30 points apart, trigger a third Verifier with combined context; use median of three scores |
| Strategy valid only in wrong IV regime | Lead | Cross-reference strategy's `iv_environment` field against `shared_context.json` current IV regime; deprioritize or exclude from top-3 |
| Write collision on shared file | All agents | `file-write-lock.py` mutex with 30s timeout; on timeout, retry once after 5s; on deadlock detection, force-release oldest lock and log warning |
| Context window overflow | Any agent | `context-window-monitor.sh` triggers summarization sub-call at 70% capacity; agent receives compressed context and continues; original context archived |
| Health monitor marks complete but output empty | ScoutLeader | `output-integrity-validator.py` validates schema before marking complete; empty/malformed files trigger respawn |

### Compliance & Audit Failures

| Failure | Responsible Agent | Resolution |
|---------|-------------------|------------|
| Conflicting `Added by Claude` entries | `rule-updater.py` hook | Log both entries with timestamps; do not overwrite existing rule; append conflicting entry under `## Conflicts — Pending Review` section |
| Rule already exists with different value | `rule-updater.py` hook | Do not overwrite; append new value as `## Pending Update` with source citation; flag for human review |
| Audit trail lost (encoding error / hook crash) | Lead | Log hook failure to `run_state.json`; continue run without rule update; flag `[AUDIT_GAP — hook failure at timestamp]` |
| Agent attempts to disable existing guardrail | `rule-updater.py` hook | Reject the write; log attempted change with full context; alert Lead |

### Output & Synthesis Failures

| Failure | Responsible Agent | Resolution |
|---------|-------------------|------------|
| Fewer than 3 validated strategies survive | Lead | Report available count; do not pad with unvalidated strategies; output as many as passed verification with note `[INSUFFICIENT_STRATEGIES — N of 3 available]` |
| Top-3 contains SEBI-prohibited structure | Lead / Verifier | Cross-reference against `rules/OptionsTrading.md` SEBI restrictions; naked short options for retail accounts are prohibited `[VERIFY: current SEBI F&O retail restrictions]`; exclude and replace with next-best |
| Output contains prior-run strategies | Lead | `pre-run-environment-check.sh` verifies clean output directory; if prior data detected, create fresh directory with new timestamp |
| Two top-3 strategies are highly correlated | Lead | `correlation-deduplicator` skill flags correlated pairs; if same effective market bet (same underlying, same direction, overlapping strikes), keep higher-confidence one and replace other with next-best |

## Configuration Flags

The `commands/run_research_agent.md` command accepts these flags:

| Flag | Values | Default | Description |
|------|--------|---------|-------------|
| `--output-dir` | Directory path | `<cwd>/research_agent_ops/output_DDMM` | Base directory for output (DDMM = today's date) |
| `--mode` | `full`, `bullish_only`, `bearish_only` | `full` | Run both biases or restrict to one |
| `--expiry` | `all`, `weekly`, `monthly`, `quarterly` | `all` | Target specific expiry category |
| `--max-respawns` | integer | `2` | Maximum scout respawn attempts |
| `--iv-filter` | `true`, `false` | `true` | Enable IV regime pre-filtering |
| `--dedup` | `true`, `false` | `true` | Enable cross-scout deduplication |
| `--dry-run` | `true`, `false` | `false` | Validate configuration without executing |

## How to Run

```bash
# Full pipeline — all biases and expiry categories
/trading-research-agent:run_research_agent

# Custom output directory
/trading-research-agent:run_research_agent --output-dir=/home/user/my_research

# Bullish strategies only, weekly expiry
/trading-research-agent:run_research_agent --mode=bullish_only --expiry=weekly

# Dry run to validate configuration
/trading-research-agent:run_research_agent --dry-run=true
```

## Changelog

`[Built from scratch — v1.0]`
- Initial system architecture and full documentation
- Four-tier agent hierarchy: Lead → ScoutLeader → Scout/Orchestrator → Verifier
- Strategy Output Schema v1.0
- Constraint matrix with 10 enforced constraints
- Failure state resolution for 25+ identified scenarios
- 7 hooks, 9 skills, 5 agents, 1 command, 1 rules file

`[v1.1 — Output directory & reusability update]`
- Output directory now created in working directory, not plugin directory
- Added `--output-dir` flag for custom output location
- Default output path: `research_agent_ops/output_DDMM/` in current working directory
- Added `optimize-system` and `context-management` skills (9 skills total)
- Added installation guide and quick start instructions
- Fixed hooks.json to use official `"hooks"` wrapper key format
- Removed non-standard `keywords` field from plugin.json
