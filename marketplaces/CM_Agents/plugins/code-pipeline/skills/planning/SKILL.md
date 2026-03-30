---
name: planning
description: This skill should be used when the code-building pipeline needs to create a comprehensive implementation plan. It reads its handoff from the artifacts folder, invokes superpowers:brainstorming for requirements exploration, manages plan persistence to artifacts, and performs quality checks. All inputs/outputs flow through .code-build/artifacts/agent_{id}/planning/.
version: 2.0.0
---

# Planning - Plan Creation & Improvement

Create comprehensive implementation plans by orchestrating the superpowers brainstorming and planning skills. All inputs come from and outputs go to the artifacts folder.

## Input

Read the planning handoff from the artifacts folder. The lead skill provides the path:
```
.code-build/artifacts/agent_{agent_id}/planning/handoff.json
```

Extract from handoff:
- `task_description`: What the user wants to build
- `architecture`: Path to architecture discovery JSON
- `available_tools`: Path to tool manifest for this stage
- `execution_mode`: loop or single
- `iteration`: Current iteration number
- `previous_findings`: Issues from previous iteration (loop mode)
- `artifacts_root`: Base path for all artifact operations

Also read:
- `{artifacts_root}/planning/available-tools.json` - tools you MUST use
- `{artifacts_root}/discovery/architecture.json` - codebase architecture

## Process

### Step 1: Context Preparation

**If iteration 1 (first run):**
- Prepare the full task description with architecture context
- No previous findings to incorporate

**If iteration N > 1 (loop continuation):**
- Read loop handoff from `{artifacts_root}/loop/loop-handoff-iter-{N-1}.json`
- Incorporate `unmet_criteria`, `theory_issues`, `practical_issues`, and `recommended_focus`
- The plan for this iteration must specifically target unresolved issues
- Do NOT re-plan already completed and passing features

### Step 2: Invoke Brainstorming

Read `available-tools.json` and use EVERY assigned skill/MCP listed.

Use the Skill tool to invoke `superpowers:brainstorming`.

Provide context:
- Task description (or refined focus for loop iterations)
- Architecture summary (tech stack, conventions, key files)
- Available tools that can be used during execution
- Constraints from previous iterations

The brainstorming skill will:
1. Explore project context
2. Ask clarifying questions (one at a time)
3. Propose 2-3 approaches with trade-offs
4. Present a design for approval
5. Write a design spec document
6. Invoke writing-plans automatically

**IMPORTANT**: Do NOT interrupt the brainstorming flow. Let it complete its full process.

### Step 3: Plan Capture & Persistence

After brainstorming and plan writing complete:
1. Locate the plan file - use Glob to find the latest in `docs/superpowers/plans/`
2. Read the plan content
3. **Write a copy to**: `{artifacts_root}/planning/plan.md`
   - This is the canonical location all subsequent stages will read from
4. Record the original path for reference

### Step 4: Plan Quality Check

Analyze the plan for quality:

1. **Completeness**: Every requirement → at least one plan task
2. **Specificity**: All tasks have exact file paths, not vague references
3. **No placeholders**: No "TBD", "TODO", "implement later"
4. **Feasibility**: Referenced libraries match the architecture
5. **Independence analysis**: Identify parallel task groups

### Step 5: Write Plan Metadata

**Write to**: `{artifacts_root}/planning/plan-metadata.json`
```json
{
  "plan_file": "{artifacts_root}/planning/plan.md",
  "original_plan_path": "docs/superpowers/plans/YYYY-MM-DD-feature.md",
  "created_at": "<ISO timestamp>",
  "iteration": N,
  "task_count": X,
  "parallel_groups": [["task1", "task2"], ["task3"]],
  "estimated_complexity": "low|medium|high",
  "quality_check": "PASS|PASS_WITH_WARNINGS|NEEDS_IMPROVEMENT",
  "quality_issues": []
}
```

### Step 6: Plan Improvement (if needed)

If quality check reveals issues:
1. Present issues to the user
2. If user wants revision: re-invoke brainstorming with specific issues
3. If user accepts as-is: note issues in metadata for testing to watch

## Output

All outputs are written to `{artifacts_root}/planning/`:
- `plan.md` - The implementation plan
- `plan-metadata.json` - Quality check and metadata
- These are read by the lead skill for its review step

## Critical Rules
- ALWAYS invoke `superpowers:brainstorming` - do NOT create plans from scratch
- ALWAYS read and use tools from `available-tools.json`
- Write ALL outputs to the artifacts folder - no other locations
- The plan.md in artifacts is the canonical copy that execution will read
- For loop iterations > 1, scope the plan to unresolved issues only
- If brainstorming asks questions, relay to user - do not answer on their behalf