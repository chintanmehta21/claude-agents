---
name: mem-vault
description: Use when the user wants to query, inspect, or manage the mem-vault memory store for the current project — searching past observations, listing recent work, marking a chapter, saving a note, or checking vault status. Triggers on phrases like "mem-vault search", "what do we remember about X", "save this to memory", "vault status", "recent context", "timeline of changes".
allowed-tools: Bash, Read
argument-hint: "[action] [query...]"
---

# mem-vault skill

Manage the per-project persistent memory vault from inside any Claude Code session (app, CLI, or Codex).  Invokes the `mem-vault` CLI shipped with this plugin.  All memory is stored in `%USERPROFILE%\.mem-vault\projects\<slug>\vault.db`, keyed by the project's CWD so **all three clients share the same memory** for the same project folder.

## When to use

Invoke this skill when the user asks any of:

- "search the vault for X" / "what do we remember about X"
- "show recent context" / "timeline of changes"
- "save this as a note" / "remember this decision"
- "mark chapter: X"
- "vault status" / "mem-vault stats"
- "purge this project's memory"
- "list all mem-vault projects"

Prefer this skill for user-initiated queries.  The MCP tools (`search`, `timeline`, `save_observation`, etc.) are better for Claude-initiated lookups during reasoning.

## How to invoke

Run the CLI via Bash.  The plugin exposes it at `${CLAUDE_PLUGIN_ROOT}/server/index.js`:

```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" <command> [--cwd <dir>] [options]
```

Default `--cwd` is the current working directory, which is exactly what we want 99% of the time (same CWD = same vault).

## Command map

| User intent | Command |
|---|---|
| Search memory | `search --q "<query>" [--limit 20] [--type feature]` |
| Show recent | `recent-context --limit 15 --format markdown` |
| Timeline | `timeline --limit 50 [--since 2026-01-01T00:00:00Z] [--type change]` |
| Save note | `save --title "<t>" --body "<body>" --type <t> --tags tag1,tag2` |
| Mark chapter | `mark-chapter --title "<t>" --summary "<s>"` |
| Status | `status` |
| List projects | `projects` |
| Purge project | `purge --yes` |
| Outline a file | `outline --file <path>` |

## Action recipes

### Search
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" search --q "$ARGUMENTS" --limit 20
```
Pipe the JSON result back to the user as a compact table (columns: ts, type, title, files).  If results are empty, say so and suggest a broader query.

### Recent context (markdown)
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" recent-context --limit 15 --format markdown
```
Show the markdown verbatim.

### Save a note
Before running, confirm the proposed title/body/type with the user.  Then:
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" save \
  --title "<title>" \
  --body  "<body>" \
  --type  <feature|bugfix|refactor|change|discovery|decision|note> \
  --tags  "tag1,tag2"
```

### Status
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" status
```
Report: project slug, vault path, counts of observations/chapters/sessions/symbols.

### Purge (destructive)
Require the user to say "yes, wipe this project's memory" before running:
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" purge --yes
```

## Arguments from the user

The skill receives free-form arguments in `$ARGUMENTS`.  Typical patterns:

- `/mem-vault search auth token rotation` → run `search --q "auth token rotation"`
- `/mem-vault recent` → run `recent-context --format markdown`
- `/mem-vault save "fixed FTS5 escaping" --type bugfix` → run `save ...`
- `/mem-vault status` → run `status`

If `$ARGUMENTS` is empty, show the help:
```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" help
```

## Output conventions

- For `search` / `timeline` / `recent-context`: render the JSON result as a readable table for the user, not raw JSON, unless they asked for JSON.
- For `save` / `mark-chapter`: confirm with the returned `id`.
- For `status`: render as a short summary.
- Always mention the project slug so the user knows which vault they just touched.

## Troubleshooting

- `better-sqlite3` missing → `npm install --prefix "${CLAUDE_PLUGIN_ROOT}"` then retry.
- WASM grammar missing → `node "${CLAUDE_PLUGIN_ROOT}/scripts/bootstrap-grammars.js"`.
- Same project shows different memory in CC vs Codex → the CWD normalization differs; run `status` in both and compare `project_slug`.  If different, the clients launched from different paths.
