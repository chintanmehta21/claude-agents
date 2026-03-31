---
name: lead
description: This skill should be used when orchestrating the full code-building pipeline end-to-end. It handles discovery, pre-stage tool assignment, inter-stage reviews, artifact-based handoffs, loop/single execution modes, and completion criteria management. All inter-subagent communication flows through the .code-build/artifacts/ folder. Invoke when the /build-code command is run.
version: 2.0.0
---

# Lead - Pipeline Orchestrator

This skill is invoked by the `/build-code` command. It orchestrates the complete code-building pipeline from discovery through delivery.

## NAMING DISTINCTION — READ CAREFULLY

- **`/build-code`** = the **command** the user runs to start this pipeline (e.g., `/build-code single Build a dashboard`)
- **`.code-build/`** = the **folder** in the current project root that holds all pipeline data (dependencies + artifacts)

These are two DIFFERENT things. Never confuse them.

## How This Skill Starts

1. The user runs `/build-code [loop|single] <task description>`
2. The `/build-code` command (in `commands/build-code.md`) does three things:
   a. Checks if `.code-build/` folder exists in the current project root
   b. If NOT found → creates it with two subfolders: `dependencies/` and `artifacts/`
   c. If found → skips creation, proceeds directly
3. The command generates a unique `agent_id` and creates `.code-build/artifacts/agent_{agent_id}/` with stage subfolders
4. The command then invokes THIS skill (lead) with the `agent_id`, `execution_mode`, and `task_description`

## Folder Structure Created By the Command

```
{project_root}/
└── .code-build/                          ← Created once per project, reused across runs
    ├── dependencies/
    │   └── dependencies.json             ← MCPs/skills manifest
    └── artifacts/
        └── agent_{agent_id}/             ← Created fresh per /build-code invocation
            ├── metadata.json
            ├── discovery/
            ├── planning/
            ├── execution/
            ├── testing/
            └── loop/
```

Multiple `/build-code` runs in the same project each get their own `agent_{id}/` folder inside the shared `.code-build/artifacts/` directory. The `dependencies/` folder is shared across all runs.

---

## ALL Artifact Paths Use This Base

```
ARTIFACTS = .code-build/artifacts/agent_{agent_id}
```

All communication between stages flows EXCLUSIVELY through files in this folder.

---

## Phase 0: Initialization

### Accept Agent Instance
1. Receive `agent_id`, `execution_mode`, and `task_description` from the `/build-code` command
2. Verify `.code-build/` exists in the project root (the command should have created it)
3. Verify the artifact folder exists at `.code-build/artifacts/agent_{agent_id}/`
4. Verify all stage subfolders exist: `discovery/`, `planning/`, `execution/`, `testing/`, `loop/`
5. Read `metadata.json` from the artifact folder to confirm initialization

### Dependencies Check
1. Read `.code-build/dependencies/dependencies.json`
2. For each dependency, check availability:
   - Skills: check if the skill name appears in the available skills list
   - MCPs: check if tool prefix responds (e.g., `mcp__Shadcn_UI__*`)
   - Agents: check if agent is available from installed plugins
3. Mark each dependency's `status` field as `available` or `missing`
4. Write updated status back to `dependencies.json`
5. If critical (required=true) dependencies are missing, inform the user and attempt installation

### Execution Mode Resolution
- `loop` → Iterative execution with completion criteria
- `single` → One-time pipeline run
- Not specified → Ask: "Should this run as a **loop** or **single**?"

### Completion Criteria (Loop Mode Only)
1. Ask the user: "What are the completion criteria for this loop?"
2. Store in `.code-build/artifacts/agent_{agent_id}/loop/iteration-state.json`:
```json
{
  "mode": "loop",
  "agent_id": "{agent_id}",
  "completion_criteria": ["<user-defined criteria>"],
  "max_iterations": 10,
  "current_iteration": 0,
  "iterations": []
}
```

### Task Classification

Classify the task into one or more categories. This classification drives ALL downstream tool assignments.

1. Analyze the `task_description` and architecture discovery results
2. Assign **task tags** — one or more of:
   - `frontend` — UI components, pages, layouts, styling, client-side logic
   - `database` — Schema changes, migrations, queries, ORM work
   - `backend` — API endpoints, server logic, middleware
   - `hosting-vercel` — Project deployed on Vercel
   - `hosting-render` — Project deployed on Render
   - `database-supabase` — Supabase is the backend database
3. Write classification to `.code-build/artifacts/agent_{agent_id}/discovery/task-classification.json`:
```json
{
  "tags": ["frontend", "database-supabase", "hosting-vercel"],
  "detected_from": "task_description + architecture.json",
  "mandatory_tools": {
    "frontend": {
      "skills": ["ui-ux-pro-max"],
      "mcps": ["playwright", "shadcn-ui", "claude-preview"]
    },
    "database-supabase": {
      "skills": [],
      "mcps": ["supabase"]
    },
    "hosting-vercel": {
      "skills": [],
      "mcps": ["vercel"]
    },
    "hosting-render": {
      "skills": [],
      "mcps": ["render"]
    }
  }
}
```

### Mandatory Tool Provisioning (PREREQUISITE — Runs Before Any Subagent)

**This is a hard gate.** No subagent may be spawned until all mandatory tools for the detected task tags are verified as available.

1. For each tag in `task-classification.json`, collect all mandatory tools
2. For each mandatory tool, verify availability:
   - **Skills**: Check if the skill name appears in the available skills list in your context
   - **MCPs**: Attempt to call a list/info tool with the MCP prefix (e.g., `mcp__Shadcn_UI__list_components`). If the call succeeds, mark `available`. If it errors with "unknown tool", mark `missing`.
3. **Install missing tools before proceeding:**
   - **`playwright` MCP**: Search MCP registry with `mcp__mcp-registry__search_mcp_registry` keywords `["playwright", "browser", "testing"]`, then install via `suggest_connectors`
   - **`supabase` MCP**: Search MCP registry with keywords `["supabase", "database", "postgres"]`, then install
   - **`vercel` MCP**: Should be available via the vercel plugin. If missing, inform user to install `vercel@claude-plugins-official` plugin
   - **`render` MCP**: Search MCP registry with keywords `["render", "deployment", "hosting"]`, then install
   - **`shadcn-ui` MCP**: Should be builtin. If missing, inform user
   - **`claude-preview` MCP**: Should be builtin. If missing, inform user
   - **`ui-ux-pro-max` skill**: Should be available from installed plugins. If missing, inform user to install the plugin that provides it
4. After installation attempts, re-verify each tool
5. Update `.code-build/dependencies/dependencies.json` with current status
6. **If any mandatory MCP is still missing after install attempts**: Warn the user and ask whether to proceed without it or abort. Do NOT silently skip.
7. Write provisioning report to `.code-build/artifacts/agent_{agent_id}/discovery/provisioning-report.json`:
```json
{
  "verified_tools": {
    "skills": ["ui-ux-pro-max"],
    "mcps": ["playwright", "supabase", "vercel", "shadcn-ui"]
  },
  "missing_tools": [],
  "install_attempts": [
    {"tool": "playwright", "method": "mcp-registry", "result": "installed"}
  ],
  "ready": true
}
```

**Only after `ready: true` may the pipeline proceed to Phase 1.**

---

## Phase 1: Discovery

### 1A: Architecture Scout
Spawn the `architecture-scout` subagent:
- Provide the current project directory as context
- The scout returns a structured architectural JSON summary
- **Write output to**: `.code-build/artifacts/agent_{agent_id}/discovery/architecture.json`
- This file persists for all stages to read

### 1B: MCP & Skill Finder
Spawn the `mcp-finder` subagent:
- Provide the architecture summary (read from `discovery/architecture.json`)
- The finder searches for available official MCPs, skills, and agents
- **Write output to**: `.code-build/artifacts/agent_{agent_id}/discovery/tools.json`
- If new tools are recommended, present to user for approval
- If approved, update `.code-build/dependencies/dependencies.json`

### 1C: Install Missing Dependencies
Read the updated `dependencies.json`:
1. For each missing required dependency:
   - `plugin`: Inform user to install via plugin manager
   - `mcp-registry`: Use `mcp__mcp-registry__search_mcp_registry` → `suggest_connectors`
   - `builtin`: Verify tool prefix exists
   - `manual`: Inform user of manual installation steps
2. Report installation results

---

## Phase 2: Planning

### 2A: Pre-Stage Tool Assignment
Before invoking planning, identify and assign relevant tools:

1. Read `discovery/tools.json` and `dependencies.json`
2. Filter for planning-relevant tools:
   - `superpowers:brainstorming` (REQUIRED)
   - `superpowers:writing-plans` (REQUIRED)
   - Any project-specific planning tools from discovery
3. Search for additional official skills: Use `mcp__mcp-registry__search_mcp_registry` with keywords `["planning", "architecture", "design"]`
4. **Prefer ONLY official sources**: `claude-plugins-official`, `anthropic-skills`, verified MCP providers
5. Build and write the tool manifest:
   **Write to**: `.code-build/artifacts/agent_{agent_id}/planning/available-tools.json`
   ```json
   {
     "stage": "planning",
     "assigned_skills": ["superpowers:brainstorming", "superpowers:writing-plans"],
     "assigned_mcps": [],
     "instructions": "You MUST invoke superpowers:brainstorming first. Let it complete its full flow. It will invoke writing-plans automatically."
   }
   ```

### 2B: Write Planning Handoff
Write the handoff document that the planning skill will read:
**Write to**: `.code-build/artifacts/agent_{agent_id}/planning/handoff.json`
```json
{
  "phase": "planning",
  "agent_id": "{agent_id}",
  "task_description": "<user's task>",
  "architecture": "<read from discovery/architecture.json>",
  "available_tools": "<read from planning/available-tools.json>",
  "execution_mode": "loop|single",
  "iteration": 1,
  "previous_findings": null,
  "artifacts_root": ".code-build/artifacts/agent_{agent_id}"
}
```

### 2C: Invoke Planning Skill
Use the Skill tool to invoke `code-pipeline:planning` with:
- The `agent_id`
- Reference to the handoff at `planning/handoff.json`
- Explicit instruction: "Read your handoff from `.code-build/artifacts/agent_{agent_id}/planning/handoff.json`. Write all outputs to `.code-build/artifacts/agent_{agent_id}/planning/`. You MUST use the tools listed in `planning/available-tools.json`."

### 2D: Lead Review (Post-Planning)
After planning completes, read ALL artifacts from `planning/`:
1. Read `planning/plan.md` - the implementation plan
2. Read `planning/plan-metadata.json` - quality check results
3. Analyze for:
   - **Architecture**: Are the file paths and patterns consistent with the codebase?
   - **Performance**: Could any planned approach be optimized (e.g., batch operations, caching)?
   - **Completeness**: Does every requirement from the task map to a plan task?
   - **Parallel opportunities**: Which tasks are independent and can run simultaneously?
4. **Write review to**: `.code-build/artifacts/agent_{agent_id}/planning/lead-review.md`

Format:
```markdown
# Lead Review - Planning Phase

## Summary
[What the planning phase produced]

## Improvement Suggestions
1. [Suggestion 1 - e.g., "Consider using server components for the dashboard page to reduce client bundle"]
2. [Suggestion 2 - e.g., "Tasks 3 and 4 share no dependencies and should run in parallel"]
3. [Suggestion 3]

## Recommendations for Execution
- [Specific guidance the execution phase should follow]
- [Tool assignments for specific tasks]

## Parallel Task Groups
- Group A (independent): [Task 1, Task 2]
- Group B (depends on A): [Task 3]
- Group C (independent): [Task 4, Task 5]
```

**IMPORTANT**: Suggestions must be non-radical - better architecture and performance optimizations, NOT complete redesigns. The plan is already approved by the user.

---

## Phase 3: Execution

### 3A: Pre-Stage Tool Assignment

**Read inputs:**
1. Read `discovery/architecture.json` for project type
2. Read `discovery/task-classification.json` for task tags and mandatory tools
3. Read `discovery/provisioning-report.json` for verified tool availability
4. Read `planning/plan.md` and `planning/lead-review.md` for task details

**Assign tools by task tag (MANDATORY — not optional):**

| Task Tag | Required Skills | Required MCPs | Usage |
|----------|----------------|---------------|-------|
| `frontend` | `ui-ux-pro-max` | `shadcn-ui` (`mcp__Shadcn_UI__`), `playwright` (screenshots), `claude-preview` (`mcp__Claude_Preview__`) | `ui-ux-pro-max` MUST be invoked for any UI design decisions. Shadcn UI MUST be checked for components before building custom ones. Playwright for screenshot verification during dev. |
| `database-supabase` | — | `supabase` | ALL database queries, schema changes, migrations, and RLS policies MUST go through the Supabase MCP. |
| `hosting-vercel` | — | `vercel` (`mcp__plugin_vercel_vercel__`) | Deployment verification, environment variable checks, and log inspection. |
| `hosting-render` | — | `render` | Deployment verification and log inspection. |
| `backend` | — | `context7` (`mcp__21f01ab2`) | Library documentation lookups for any backend framework/library questions. |

**Always assigned (all task types):**
- `superpowers:subagent-driven-development` (REQUIRED)
- `superpowers:test-driven-development` (REQUIRED)
- `context7` MCP for documentation lookups (REQUIRED)

**Pre-spawn verification gate:**
Before writing the tool manifest, re-verify each assigned MCP is still responding. If any mandatory MCP from the task classification is unreachable:
1. Attempt reinstall
2. If still unreachable, warn user and ask whether to proceed or abort
3. Do NOT spawn subagents with missing mandatory tools

**Write to**: `.code-build/artifacts/agent_{agent_id}/execution/available-tools.json`
```json
{
  "stage": "execution",
  "task_tags": ["frontend", "database-supabase", "hosting-vercel"],
  "assigned_skills": [
    "superpowers:subagent-driven-development",
    "superpowers:test-driven-development",
    "ui-ux-pro-max"
  ],
  "assigned_mcps": [
    {"name": "shadcn-ui", "tools_prefix": "mcp__Shadcn_UI__", "use_for": "UI component library — MUST check before building custom components", "mandatory_for": ["frontend"]},
    {"name": "playwright", "tools_prefix": "mcp__playwright__", "use_for": "Screenshot verification during UI development", "mandatory_for": ["frontend"]},
    {"name": "claude-preview", "tools_prefix": "mcp__Claude_Preview__", "use_for": "Dev server preview and visual inspection", "mandatory_for": ["frontend"]},
    {"name": "supabase", "tools_prefix": "mcp__supabase__", "use_for": "ALL database operations — queries, schema, migrations, RLS", "mandatory_for": ["database-supabase"]},
    {"name": "vercel", "tools_prefix": "mcp__plugin_vercel_vercel__", "use_for": "Deployment verification, env vars, logs", "mandatory_for": ["hosting-vercel"]},
    {"name": "render", "tools_prefix": "mcp__render__", "use_for": "Deployment verification, logs", "mandatory_for": ["hosting-render"]},
    {"name": "context7", "tools_prefix": "mcp__21f01ab2", "use_for": "Library documentation lookups", "mandatory_for": ["all"]}
  ],
  "per_task_assignments": {
    "Task 1: Create Dashboard UI": ["shadcn-ui", "playwright", "ui-ux-pro-max"],
    "Task 2: Add database schema": ["supabase"],
    "Task 3: Deploy and verify": ["vercel"]
  },
  "instructions": "You MUST use the assigned MCPs for each task. For UI work: invoke ui-ux-pro-max skill for design decisions, check shadcn-ui for components FIRST, take Playwright screenshots to verify. For database work with Supabase: ALL operations go through the Supabase MCP. For deployment: use the hosting MCP for verification. For any library questions: use context7. Skipping a mandatory tool is a pipeline violation."
}
```

### 3B: Write Execution Handoff
**Write to**: `.code-build/artifacts/agent_{agent_id}/execution/handoff.json`
```json
{
  "phase": "execution",
  "agent_id": "{agent_id}",
  "plan_file": ".code-build/artifacts/agent_{agent_id}/planning/plan.md",
  "lead_review": ".code-build/artifacts/agent_{agent_id}/planning/lead-review.md",
  "architecture": ".code-build/artifacts/agent_{agent_id}/discovery/architecture.json",
  "available_tools": ".code-build/artifacts/agent_{agent_id}/execution/available-tools.json",
  "execution_mode": "loop|single",
  "iteration": 1,
  "artifacts_root": ".code-build/artifacts/agent_{agent_id}"
}
```

### 3C: Invoke Execution Skill
Invoke `code-pipeline:execution` with:
- The `agent_id`
- Explicit instruction: "Read your handoff from `execution/handoff.json`. Read the plan from `planning/plan.md`. Read the lead review from `planning/lead-review.md` and incorporate its suggestions. Write all outputs to `execution/`. You MUST use the tools listed in `execution/available-tools.json`."

### 3D: Lead Review (Post-Execution)
After execution completes, read ALL artifacts from `execution/`:
1. Read `execution/execution-report.md` - what was done
2. Read `execution/changelog_*.txt` - file changes
3. Analyze the actual code changes (use `git diff`):
   - **Architecture**: Do the changes follow the codebase patterns?
   - **Performance**: Any N+1 queries, unnecessary re-renders, missing indexes?
   - **Quality**: Proper error handling, edge cases covered?
   - **Test coverage**: All new code has tests?
4. **Write review to**: `.code-build/artifacts/agent_{agent_id}/execution/lead-review.md`

Format:
```markdown
# Lead Review - Execution Phase

## Summary
[What was built, how many tasks completed]

## Code Quality Observations
1. [Observation 1]
2. [Observation 2]

## Performance Suggestions
1. [Suggestion 1 - e.g., "Add database index on user_id column for the new query"]
2. [Suggestion 2]

## Recommendations for Testing
- [What testing should focus on based on execution results]
- [Specific areas of concern]
- [Edge cases to verify]
```

---

## Phase 4: Testing

### 4A: Pre-Stage Tool Assignment

**Read inputs:**
1. Read `discovery/architecture.json` for project category
2. Read `discovery/task-classification.json` for task tags
3. Read `discovery/provisioning-report.json` for verified tool availability

**Assign testing tools by task tag (MANDATORY):**

| Task Tag | Required MCPs for Testing | Usage |
|----------|--------------------------|-------|
| `frontend` | `playwright` (screenshots + E2E), `claude-preview` (visual inspection), `shadcn-ui` (UI improvement suggestions on last iteration) | Playwright MUST take screenshots of all new/changed UI. Claude Preview for dev server inspection. Shadcn UI only on single mode or last loop iteration. |
| `database-supabase` | `supabase` | Verify migrations applied, check for DB errors, validate RLS policies, inspect query performance. |
| `hosting-vercel` | `vercel` (`mcp__plugin_vercel_vercel__`) | Check deployment status, build logs, runtime logs, environment variables. |
| `hosting-render` | `render` | Check deployment status and runtime logs. |
| `backend` | — | curl-based endpoint testing, test runner output. |

**Always assigned (all task types):**
- `superpowers:requesting-code-review` (REQUIRED — theory testing)
- GitHub MCP (REQUIRED — PR/code context)

**Pre-spawn verification gate:**
Re-verify each testing MCP is reachable before spawning theory-tester and practical-tester. If any mandatory MCP for the detected tags is missing, attempt reinstall. Do NOT spawn testers with missing mandatory tools without user acknowledgment.

**Write to**: `.code-build/artifacts/agent_{agent_id}/testing/available-tools.json`
```json
{
  "stage": "testing",
  "task_tags": ["frontend", "database-supabase", "hosting-vercel"],
  "assigned_skills": ["superpowers:requesting-code-review"],
  "assigned_mcps": [
    {"name": "playwright", "tools_prefix": "mcp__playwright__", "use_for": "Screenshot all new/changed UI pages, run E2E tests", "mandatory_for": ["frontend"]},
    {"name": "claude-preview", "tools_prefix": "mcp__Claude_Preview__", "use_for": "Dev server visual inspection", "mandatory_for": ["frontend"]},
    {"name": "shadcn-ui", "tools_prefix": "mcp__Shadcn_UI__", "use_for": "UI improvement suggestions (last iteration/single mode only)", "mandatory_for": ["frontend"], "condition": "single_or_last_iteration"},
    {"name": "supabase", "tools_prefix": "mcp__supabase__", "use_for": "Verify migrations, check DB errors, validate RLS, query perf", "mandatory_for": ["database-supabase"]},
    {"name": "vercel", "tools_prefix": "mcp__plugin_vercel_vercel__", "use_for": "Deployment status, build logs, runtime logs", "mandatory_for": ["hosting-vercel"]},
    {"name": "render", "tools_prefix": "mcp__render__", "use_for": "Deployment status, runtime logs", "mandatory_for": ["hosting-render"]},
    {"name": "github", "tools_prefix": "mcp__github__", "use_for": "PR context, code search, version control", "mandatory_for": ["all"]}
  ],
  "agents": ["code-reviewer"],
  "instructions": "For frontend: Playwright MUST screenshot all new/changed pages. For Supabase: verify migrations and check for DB errors. For Vercel/Render: check deployment and runtime logs. Theory-tester MUST use superpowers:requesting-code-review. Skipping a mandatory tool is a pipeline violation."
}
```

### 4B: Write Testing Handoff
**Write to**: `.code-build/artifacts/agent_{agent_id}/testing/handoff.json`
```json
{
  "phase": "testing",
  "agent_id": "{agent_id}",
  "changelog_dir": ".code-build/artifacts/agent_{agent_id}/execution/",
  "plan_file": ".code-build/artifacts/agent_{agent_id}/planning/plan.md",
  "execution_review": ".code-build/artifacts/agent_{agent_id}/execution/lead-review.md",
  "architecture": ".code-build/artifacts/agent_{agent_id}/discovery/architecture.json",
  "available_tools": ".code-build/artifacts/agent_{agent_id}/testing/available-tools.json",
  "execution_mode": "loop|single",
  "iteration": 1,
  "is_last_iteration": false,
  "artifacts_root": ".code-build/artifacts/agent_{agent_id}"
}
```

### 4C: Invoke Testing Skill
Invoke `code-pipeline:testing` with:
- The `agent_id`
- Explicit instruction: "Read your handoff from `testing/handoff.json`. Read the execution review from `execution/lead-review.md` for areas of concern. Write theory report to `testing/theory-report.md`. Write practical report to `testing/practical-report.md`. Write unified report to `testing/unified-report.md`. You MUST use the tools listed in `testing/available-tools.json`."

### 4D: Lead Review (Post-Testing)
After testing completes, read ALL test artifacts:
1. Read `testing/unified-report.md` - combined results
2. Read `testing/theory-report.md` - code review findings
3. Read `testing/practical-report.md` - functional verification
4. Analyze overall quality:
   - Are all critical issues flagged?
   - Do practical results align with theory results?
   - Are there patterns in the issues found?
5. **Write review to**: `.code-build/artifacts/agent_{agent_id}/testing/lead-review.md`

Format:
```markdown
# Lead Review - Testing Phase

## Summary
[Overall test results]

## Critical Findings
[Issues that must be addressed]

## Patterns Observed
[Recurring issues or themes]

## Final Assessment
- Code Quality: [PASS/FAIL]
- Functional: [PASS/FAIL]
- Overall: [PASS/FAIL]

## Next Steps
[For single mode: user action items]
[For loop mode: focus areas for next iteration]
```

---

## Phase 5: Iteration Decision

### Update Metadata
Update `.code-build/artifacts/agent_{agent_id}/metadata.json`:
```json
{
  "agent_id": "{agent_id}",
  "task_description": "<task>",
  "execution_mode": "loop|single",
  "created_at": "<timestamp>",
  "status": "iteration_1_complete",
  "iterations_completed": 1
}
```

### Single Mode
1. Present the testing lead-review to the user
2. Summarize: what was built, what passed, what needs attention
3. Update metadata status to `completed`
4. Pipeline ends

### Loop Mode
1. Read `loop/iteration-state.json`
2. Evaluate completion criteria against test results:
   - Read `testing/unified-report.md` for status
   - Check each criterion
3. Update iteration state:
   ```json
   {
     "current_iteration": N,
     "iterations": [
       {
         "iteration": N,
         "started_at": "<ISO>",
         "completed_at": "<ISO>",
         "theory_status": "PASS|FAIL",
         "practical_status": "PASS|FAIL",
         "criteria_met": ["<met>"],
         "criteria_unmet": ["<unmet>"]
       }
     ]
   }
   ```
4. **If ALL criteria met**:
   - Announce: "Completion criteria met after [N] iterations"
   - Update metadata status to `completed`
   - Pipeline ends
5. **If criteria NOT met**:
   - Write loop handoff: `.code-build/artifacts/agent_{agent_id}/loop/loop-handoff-iter-{N}.json`
     ```json
     {
       "iteration_completed": N,
       "next_iteration": N+1,
       "unmet_criteria": ["<list>"],
       "theory_issues": ["<from theory-report.md>"],
       "practical_issues": ["<from practical-report.md>"],
       "lead_observations": ["<from all lead-review.md files>"],
       "recommended_focus": "<what next iteration should prioritize>"
     }
     ```
   - Go back to Phase 2 (Planning) with iteration incremented
   - Architecture scout does NOT re-run unless structure changed significantly

### Ralph-Loop Alternative
Mention at the loop decision point: "You can also switch to `/ralph-loop` for simpler recurring execution if you prefer."

### Safety Limits
- Maximum 10 iterations (configurable)
- If no progress for 2 consecutive iterations, stop and ask user
- Each iteration must show progress toward at least one criterion

---

## Artifact Communication Rules

1. **ALL inter-stage data flows through artifacts** - no direct parameter passing of large data
2. **Each stage reads its handoff.json** to know what to do and where to find inputs
3. **Each stage writes its outputs** to its own subfolder under `artifacts/agent_{agent_id}/`
4. **Lead reads ALL outputs** after each stage and writes a `lead-review.md`
5. **The next stage reads the previous lead-review.md** to incorporate improvements
6. **Tool manifests (`available-tools.json`)** are written before each stage and read by the stage
7. **File paths in handoffs are always relative** to the project root (e.g., `.code-build/artifacts/agent_20260329_143022/planning/plan.md`)