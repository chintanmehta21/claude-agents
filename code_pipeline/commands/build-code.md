---
description: Launch the code-building pipeline. Use [loop] for iterative execution with completion criteria, or [single] for a one-time run.
argument-hint: "[loop|single] <task description>"
---

You are the entry point for the code-building pipeline. Parse the arguments and launch the pipeline.

## Argument Parsing

1. Check `$ARGUMENTS` for execution mode:
   - If starts with `loop` → set mode to `loop`, extract remaining text as the task description
   - If starts with `single` → set mode to `single`, extract remaining text as the task description
   - If neither is specified → you MUST ask the user: "Should this run as a [loop] (iterative until completion criteria met) or [single] (one-time pipeline run)?"

2. If no task description is provided after the mode keyword, ask: "What would you like to build or work on?"

## Pipeline Launch

Once mode and task are established:

1. **Initialize the project workspace:**
   - Check if `.code-build/` directory exists in the current project root
   - If not, create the following structure:
     ```
     .code-build/
     ├── dependencies/
     │   └── dependencies.json
     └── artifacts/
     ```
   - Read `.code-build/dependencies/dependencies.json` if it exists; otherwise create it from the plugin template at `${CLAUDE_PLUGIN_ROOT}/templates/dependencies.json`

2. **Generate a unique agent instance ID:**
   - Format: `YYYYMMDD_HHMMSS` (e.g., `20260329_143022`)
   - Use the current timestamp at invocation time
   - This ID uniquely identifies this pipeline run

3. **Create the agent instance artifact structure:**
   - Create `.code-build/artifacts/agent_{agent_id}/` with all stage subfolders:
     ```
     agent_{agent_id}/
     ├── metadata.json
     ├── discovery/
     ├── planning/
     ├── execution/
     ├── testing/
     └── loop/
     ```
   - Write `metadata.json` with:
     ```json
     {
       "agent_id": "{agent_id}",
       "task_description": "<user's task>",
       "execution_mode": "loop|single",
       "created_at": "<ISO timestamp>",
       "status": "initialized"
     }
     ```

4. **Invoke the lead skill:**
   - Use the Skill tool to invoke `code-pipeline:lead`
   - Pass the execution mode (loop/single), task description, AND agent_id as context
   - The lead skill will orchestrate the full pipeline using the artifacts folder

## Important

- Do NOT attempt to run the pipeline steps yourself
- Your ONLY job is to parse arguments, initialize the workspace, create the agent instance, and hand off to the lead skill
- If the user provides `$ARGUMENTS`, extract mode and task from it
- Always confirm the task description with the user before launching if it seems ambiguous
- The agent_id MUST be passed to the lead skill - all artifact operations depend on it