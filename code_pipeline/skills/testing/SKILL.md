---
name: testing
description: This skill should be used when the code-building pipeline needs to verify execution changes. It reads artifacts from the execution phase, spawns theory-tester and practical-tester subagents in parallel, writes all reports to artifacts, and produces a unified quality assessment. All I/O flows through .code-build/artifacts/agent_{id}/testing/.
version: 2.0.0
---

# Testing - Dual-Track Verification

Orchestrate comprehensive testing by spawning theory and practical subagents in parallel. All inputs come from artifacts, all outputs go to artifacts.

## Input

Read the testing handoff from the artifacts folder:
```
.code-build/artifacts/agent_{agent_id}/testing/handoff.json
```

Extract from handoff:
- `changelog_dir`: Path to execution changelogs in artifacts
- `plan_file`: Path to the plan in artifacts
- `execution_review`: Path to lead's execution review
- `architecture`: Path to architecture discovery
- `available_tools`: Path to tool manifest for this stage
- `execution_mode`: loop or single
- `iteration`: Current iteration number
- `is_last_iteration`: Whether this is the final loop iteration
- `artifacts_root`: Base path for all artifact operations

Also read (ALL from artifacts):
- `{artifacts_root}/execution/execution-report.md` - What was built
- `{artifacts_root}/execution/lead-review.md` - Lead's execution concerns
- `{artifacts_root}/execution/changelog_*.txt` - Detailed changes
- `{artifacts_root}/testing/available-tools.json` - Tools you MUST use
- `{artifacts_root}/discovery/architecture.json` - Project type

## Process

### Step 1: Prepare Test Context

1. Read all execution artifacts listed above
2. Get git diff summary (base vs HEAD)
3. Determine project category from architecture.json
4. Read the lead's execution review for areas of concern
5. Note the available tools for this stage

### Step 2: Spawn Parallel Testers

Launch BOTH testers simultaneously using the Agent tool with two parallel calls:

**Theory Tester (Agent: `theory-tester`)**
```
Task: Perform code review on execution phase changes.
Agent ID: {agent_id}
Artifacts root: {artifacts_root}
Changelog: {artifacts_root}/execution/changelog_*.txt
Plan: {artifacts_root}/planning/plan.md
Execution review concerns: {artifacts_root}/execution/lead-review.md
Base commit: [SHA before execution]
Head commit: [current HEAD]
Available tools: {artifacts_root}/testing/available-tools.json

OUTPUT: Write your report to {artifacts_root}/testing/theory-report.md
You MUST use the tools listed in available-tools.json, especially superpowers:requesting-code-review.
```

**Practical Tester (Agent: `practical-tester`)**
```
Task: Verify execution changes functionally.
Agent ID: {agent_id}
Artifacts root: {artifacts_root}
Project category: [from architecture.json]
Architecture: {artifacts_root}/discovery/architecture.json
Changelog: {artifacts_root}/execution/changelog_*.txt
Execution mode: [loop|single]
Is last iteration: [true|false]
Available tools: {artifacts_root}/testing/available-tools.json

OUTPUT: Write your report to {artifacts_root}/testing/practical-report.md
You MUST use the tools listed in available-tools.json.
```

**CRITICAL**: These MUST run in parallel. Use two Agent tool calls in the same message.

### Step 3: Collect Results

Wait for both testers to complete. Read their reports:
- `{artifacts_root}/testing/theory-report.md`
- `{artifacts_root}/testing/practical-report.md`

### Step 4: Log Verification

Based on project type, check deployment/runtime logs using available tools:

**Vercel-deployed**: `vercel:status` for deployment status
**Render-deployed**: Check Render MCP logs
**Supabase-backed**: Check database errors, migration status
**Local-only**: Check test runner output, dev server logs

### Step 5: UI Improvement Analysis (Conditional)

**ONLY runs when ALL of these are true:**
- Project is `web-frontend` or `web-fullstack`
- AND (execution mode is `single` OR `is_last_iteration` is true)

If conditions met:
1. Analyze practical-tester's screenshots
2. Use Shadcn UI MCP: `list_components`, `get_component`, `get_component_demo`
3. Generate improvement suggestions
4. For `single`: Ask user if they want improvements applied
5. For last loop iteration: Include in final report

If conditions NOT met: Skip entirely.

### Step 6: Unified Test Report

**Write to**: `{artifacts_root}/testing/unified-report.md`

```markdown
# Pipeline Test Report - Iteration {N}
## Date: [timestamp]
## Mode: [loop|single]
## Agent ID: {agent_id}

---

## Theory Test Results (Code Review)
**Status**: [PASS|PASS WITH WARNINGS|FAIL]
- Critical Issues: [count]
- Important Issues: [count]
- Minor Issues: [count]

### Critical Issues
[From theory-report.md]

### Important Issues
[From theory-report.md]

---

## Practical Test Results (Functional Verification)
**Status**: [PASS|PASS WITH WARNINGS|FAIL]
**Project Type**: [detected type]
**Verification Method**: [screenshots|endpoints|CLI|tests]

### Checks Performed
[From practical-report.md]

### Issues Found
[From practical-report.md]

---

## Deployment/Log Verification
**Status**: [PASS|FAIL|N/A]
[Log check results]

---

## UI Improvement Suggestions (if applicable)
[Shadcn UI recommendations]

---

## Combined Assessment

| Category | Status | Details |
|----------|--------|---------|
| Code Quality | [status] | [summary] |
| Functional | [status] | [summary] |
| Deployment | [status] | [summary] |
| **Overall** | **[status]** | **[summary]** |

## Issues to Address
### Must Fix (blocks completion criteria)
[List]

### Should Fix (improves quality)
[List]

### Nice to Have
[List]

## Recommendations for Next Iteration (loop mode)
[Specific actionable items]
```

### Step 7: Signal Completion

The unified report is the primary output. The lead skill reads it for its review step.

## Output

All outputs written to `{artifacts_root}/testing/`:
- `theory-report.md` - Written by theory-tester agent
- `practical-report.md` - Written by practical-tester agent
- `unified-report.md` - Written by this skill (combined report)

## Critical Rules
- ALWAYS spawn theory-tester and practical-tester IN PARALLEL
- ALWAYS read and use tools from `available-tools.json`
- ALWAYS read execution/lead-review.md for areas of concern
- Write ALL outputs to the artifacts folder
- The Shadcn UI improvement subagent ONLY runs in single mode or last loop iteration
- NEVER skip log verification
- The unified report is the single source of truth for the lead's iteration decision