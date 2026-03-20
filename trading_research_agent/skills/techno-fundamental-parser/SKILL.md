---
name: Techno-Fundamental Parser
description: This skill should be used when categorizing strategies by their trigger type (technical vs. fundamental), identifying corporate action dependencies, or flagging strategies whose logic depends on a time-sensitive event. Trigger phrases include "categorize strategy", "technical or fundamental", "corporate action", "earnings event", "rights issue", "event-driven strategy", "event dependency".
version: 1.0.0
---

# Techno-Fundamental Parser — Strategy Classification Skill

## Purpose

Categorizes each discovered strategy by its primary trigger mechanism — purely technical (indicator-based), purely fundamental (event-driven), or techno-fundamental (combination). Flags strategies whose logic depends on a corporate action or event that may have passed, changed, or been priced in. This classification feeds into the Verifier's assessment of a strategy's time-sensitivity and current applicability.

## Stakeholder

Used by **Scout agents** during strategy documentation, **Orchestrators** during enrichment, and **Verifiers** during compliance and relevance checking. The classification output appears in the enriched strategy file.

## Instructions

### 1. Strategy Classification Taxonomy

Classify each strategy into one of three categories:

| Category | Definition | Examples |
|----------|-----------|----------|
| **TECHNICAL** | Entry/exit driven entirely by price action, chart patterns, or indicator values. No fundamental event dependency. | RSI divergence entry, Bollinger Band squeeze, VWAP bounce, moving average crossover |
| **FUNDAMENTAL** | Entry/exit driven by a corporate action, macro event, or scheduled announcement. Technical indicators may refine timing but the edge thesis depends on the event. | Earnings straddle, budget-day iron condor, RBI policy rate play, rights issue volatility trade |
| **TECHNO-FUNDAMENTAL** | Combines a technical setup with a fundamental catalyst. Both elements are required for the strategy to work. | IV crush post-earnings with delta-neutral adjustment, PCR-based entry timed to macro event, OI-based strike selection during corporate action period |

### 2. Event Dependency Detection

For FUNDAMENTAL and TECHNO-FUNDAMENTAL strategies, identify and flag event dependencies:

**Events to detect:**

| Event Type | Detection Keywords | Time Sensitivity |
|------------|-------------------|-----------------|
| Quarterly earnings | "earnings", "results", "quarter", "Q1/Q2/Q3/Q4" | Specific dates — check if passed |
| RBI monetary policy | "RBI", "repo rate", "monetary policy", "MPC" | Bi-monthly schedule `[VERIFY: RBI MPC schedule]` |
| Union Budget | "budget", "Finance Minister", "fiscal" | Annual — late January/early February |
| Elections | "election", "exit poll", "vote count" | Known schedule — verify if upcoming or past |
| Corporate actions | "rights issue", "bonus", "split", "merger", "demerger", "buyback" | Stock-specific — check current status |
| Index rebalancing | "rebalancing", "index reconstitution", "addition", "removal" | Quarterly for Nifty indices |
| F&O ban period | "ban", "MWPL", "market-wide position limit" | Dynamic — check NSE current ban list |
| Dividend | "ex-dividend", "record date", "dividend yield" | Stock-specific dates |

### 3. Staleness Assessment for Events

For each detected event dependency:

1. **Check if the event has passed:**
   - If yes: Flag `[EVENT_EXPIRED: [event description] occurred on [date]]`
   - The strategy may still be valid for FUTURE occurrences of the same event type
   - Note: `"Strategy designed for earnings season — applicable to next earnings cycle"`

2. **Check if the event is upcoming:**
   - If yes: Note `[EVENT_UPCOMING: [event] expected on [date] — strategy currently actionable]`
   - Verify the date is still correct

3. **Check if the event has been structurally changed:**
   - Example: SEBI changes expiry rules → event-based strategies around old expiry structure are invalid
   - Flag: `[EVENT_RESTRUCTURED: [description of change] — strategy may need adaptation]`

### 4. Classification Output Format

For each strategy, append a classification block:

```markdown
#### Strategy Classification
- **Category:** TECHNICAL | FUNDAMENTAL | TECHNO-FUNDAMENTAL
- **Primary Trigger:** [description of the main entry trigger]
- **Event Dependencies:**
  - [Event 1]: [status — ACTIVE | EXPIRED | UPCOMING | RESTRUCTURED]
  - [Event 2]: [status]
- **Time Sensitivity:** HIGH | MEDIUM | LOW
  - HIGH: Strategy depends on a specific upcoming event within 30 days
  - MEDIUM: Strategy works in a recurring event context (e.g., monthly expiry)
  - LOW: Strategy is event-independent, can be deployed anytime
- **Corporate Action Impact:**
  - [If applicable: description of how corporate actions affect the strategy]
  - [If stock-specific: current corporate action calendar status]
```

### 5. Common Misclassification Traps

Avoid these common classification errors:

| Trap | Why It's Wrong | Correct Classification |
|------|---------------|----------------------|
| "Uses RSI, so it's TECHNICAL" | But entry is timed to earnings → TECHNO-FUNDAMENTAL | Check if any event timing is embedded in the entry logic |
| "Mentions earnings, so it's FUNDAMENTAL" | But uses RSI/MACD for entry confirmation → TECHNO-FUNDAMENTAL | Check if technical indicators are mandatory entry conditions |
| "IV crush strategy, so it's TECHNICAL" | IV crush is often POST-EVENT → FUNDAMENTAL | IV crush requires an event to cause the crush |
| "Budget day play, so it's one-time" | Budget is annual → RECURRING FUNDAMENTAL | Classify as reusable for future budget events |

### 6. Indian Market-Specific Events Calendar

Key recurring events for Indian options strategies:

| Event | Frequency | Typical Impact | Strategy Relevance |
|-------|-----------|---------------|-------------------|
| Nifty/BankNifty weekly expiry | Weekly (Thursday) `[VERIFY: current schedule]` | High near-expiry theta, gamma spikes | Weekly strategies |
| Monthly F&O expiry | Last Thursday of month | Rollover effects, OI unwinding | Monthly strategies |
| RBI MPC meeting | Bi-monthly (6 per year) | Rate decisions, forward guidance | Rate-sensitive strategies |
| Union Budget | Annual (Feb 1) | Fiscal policy, sector impacts | Event-driven strategies |
| Quarterly earnings season | Quarterly (Jul-Aug, Oct-Nov, Jan-Feb, Apr-May) | Stock-specific IV expansion | Earnings strategies |
| NSE index rebalancing | Semi-annual (Mar, Sep) | Inclusion/exclusion trades | Index composition strategies |
| Advance tax payment dates | Jun 15, Sep 15, Dec 15, Mar 15 | FII selling pressure | Directional bias strategies |

Source: Various — `[VERIFY: current NSE/BSE/RBI/SEBI event calendars]`

## Changelog

`[Built from scratch — v1.0]`
