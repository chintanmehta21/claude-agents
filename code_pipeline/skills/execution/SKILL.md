---
name: execution
description: This skill should be used when the code-building pipeline is ready to execute an implementation plan. It reads plan and review artifacts, invokes superpowers:subagent-driven-development with TDD, assigns MCPs per task, and writes execution reports and changelogs to the artifacts folder. All I/O flows through .code-build/artifacts/agent_{id}/execution/.
version: 2.0.0
---

# Execution - Plan Implementation

Execute implementation plans using subagent-driven development with test-driven development. All inputs come from artifacts, all outputs go to artifacts.

## Input

Read the execution handoff from the artifacts folder:
```
.code-build/artifacts/agent_{agent_id}/execution/handoff.json
```

Extract from handoff:
- `plan_file`: Path to the plan in artifacts
- `lead_review`: Path to lead's planning review
- `architecture`: Path to architecture discovery
- `available_tools`: Path to tool manifest for this stage
- `execution_mode`: loop or single
- `iteration`: Current iteration number
- `artifacts_root`: Base path for all artifact operations

Also read (ALL from artifacts):
- `{artifacts_root}/planning/plan.md` - The implementation plan
- `{artifacts_root}/planning/lead-review.md` - Lead's improvement suggestions (MUST incorporate)
- `{artifacts_root}/planning/plan-metadata.json` - Parallel groups, task count
- `{artifacts_root}/execution/available-tools.json` - Tools you MUST use
- `{artifacts_root}/discovery/architecture.json` - Codebase architecture

## Process

### Step 1: Plan Ingestion

1. Read the full plan from `{artifacts_root}/planning/plan.md`
2. Read the lead review from `{artifacts_root}/planning/lead-review.md`
3. Parse all tasks with dependencies, files, and steps
4. Apply lead review suggestions:
   - Incorporate parallel task groupings
   - Apply architecture/performance recommendations
   - Note any concerns flagged for special attention

### Step 2: Tool Assignment Per Task

Read `{artifacts_root}/execution/available-tools.json` for assigned tools.

Apply tools to tasks based on content:

**Frontend/UI Tasks:**
- Shadcn UI MCP (`mcp__Shadcn_UI__*`) - MUST use for component work
- Preview tools for visual verification during development

**Backend/API Tasks:**
- Database MCPs for schema/migration work
- API testing tools

**Documentation Lookups:**
- Context7 MCP for library docs - MUST use for any library questions

**All Implementation Tasks:**
- `superpowers:test-driven-development` (MANDATORY for non-trivial tasks)

### Step 3: Invoke Subagent-Driven Development

Use the Skill tool to invoke `superpowers:subagent-driven-development`.

Provide:
- The plan file path: `{artifacts_root}/planning/plan.md`
- The lead review path: `{artifacts_root}/planning/lead-review.md`
- Parallel groups from plan-metadata
- Tool assignments per task
- Explicit instruction: "Each subagent MUST use superpowers:test-driven-development. Use the MCP tools assigned to each task. Do NOT skip available MCPs."

The skill handles:
1. Worktree creation for isolation
2. Fresh subagent per task
3. TDD cycle (RED → GREEN → REFACTOR)
4. Review after each task

### Step 4: Monitor & Track

Track during execution:
- Tasks started vs completed
- Test results per task (RED/GREEN)
- Task failures or blockers
- MCP tools actually used

### Step 5: Generate Changelog

**MANDATORY** - This acts as a hook after every execution.

Generate changelog with filename: `changelog_{DDMMYYYY_HHMM}.txt`
**Write to**: `{artifacts_root}/execution/changelog_{DDMMYYYY_HHMM}.txt`

Content:
```
====================================================
EXECUTION CHANGELOG
Date: DD/MM/YYYY HH:MM
Iteration: N
Mode: loop|single
Agent ID: {agent_id}
====================================================

SUMMARY
-------
[1-2 sentence summary]

TASKS COMPLETED
--------------
1. [Task Name]
   - Files Created: [list]
   - Files Modified: [list]
   - Tests: [PASS/FAIL - count]
   - MCPs Used: [list of MCPs actually used]
   - Key Changes: [brief description]

2. [Task Name]
   ...

TASKS FAILED/SKIPPED
--------------------
[Tasks that failed with reasons]

FILES CHANGED
-------------
[Complete list of all files created/modified/deleted]

TEST RESULTS
-----------
Total: X | Passed: X | Failed: X | Skipped: X

DEPENDENCIES ADDED
-----------------
[New packages/dependencies installed]

LEAD REVIEW ITEMS INCORPORATED
------------------------------
[Which suggestions from planning/lead-review.md were applied]

KNOWN ISSUES
-----------
[Non-blocking issues discovered]

COMMIT HISTORY
-------------
[Git commits made during execution]
====================================================
```

### Step 6: Generate Execution Report

**Write to**: `{artifacts_root}/execution/execution-report.md`

```markdown
# Execution Report - Iteration {N}

## Overview
- Tasks Planned: X
- Tasks Completed: X
- Tasks Failed: X
- Total Tests: X (Passed: X, Failed: X)

## Per-Task Summary
### Task 1: [Name]
- Status: COMPLETED|FAILED|SKIPPED
- Files Changed: [list]
- Test Results: [details]
- MCPs Used: [list]
- Notes: [any observations]

[...repeat for each task...]

## Lead Review Items Applied
[Which items from planning/lead-review.md were incorporated and how]

## Issues for Testing Phase
[Specific areas the testing phase should focus on]

## Git Summary
- Commits: [count]
- Files Changed: [count]
- Insertions: [count]
- Deletions: [count]
```

### Step 7: Post-Execution Verification

Before signaling completion:
1. Run the full test suite to confirm green status
2. Check for uncommitted changes
3. Verify all planned files exist

## Output

All outputs written to `{artifacts_root}/execution/`:
- `changelog_{timestamp}.txt` - Detailed change log
- `execution-report.md` - Structured execution report
- These are read by the lead skill for its review step

## Critical Rules
- ALWAYS invoke `superpowers:subagent-driven-development` - do NOT implement directly
- ALWAYS read and follow tools from `available-tools.json`
- ALWAYS read and incorporate suggestions from `planning/lead-review.md`
- Each subagent MUST use `superpowers:test-driven-development` (non-trivial tasks)
- Changelog is MANDATORY after every execution
- Write ALL outputs to the artifacts folder
- If a task fails, continue with independent tasks - do NOT block everything
- Track which lead review items were applied for accountability