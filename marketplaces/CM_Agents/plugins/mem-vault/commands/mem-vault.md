---
description: Query, inspect, or manage the per-project mem-vault memory store.
argument-hint: "<action> [query...]  e.g. search auth rotation | recent | status | save \"title\" | timeline | projects | purge --yes"
allowed-tools: Bash
---

# /mem-vault

Drive the mem-vault CLI directly from a slash command. Same vault is shared across Claude Code, Claude Code CLI, and Codex when launched from the same project root.

`$ARGUMENTS` is the free-form action and arguments the user typed.

## Dispatch

Parse `$ARGUMENTS`. The first word is the action; the rest is its query / options.

| First word | Run |
|---|---|
| `search` (or empty + a free query) | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" search --q "<rest>" --limit 20` |
| `recent` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" recent-context --limit 15 --format markdown` |
| `timeline` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" timeline --limit 50` |
| `status` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" status` |
| `projects` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" projects` |
| `save` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" save --title "<title>" [--body "<b>"] [--type <t>]` (confirm with user first) |
| `mark-chapter` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" mark-chapter --title "<t>"` |
| `purge` | Refuse unless user added `--yes`, then run `purge --yes` (destructive) |
| `outline` | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" outline --file <path>` |
| `help`, empty | `node "${CLAUDE_PLUGIN_ROOT}/server/index.js" help` |

If `$ARGUMENTS` starts with a quote or looks like a search query (no recognized verb), default to `search --q "$ARGUMENTS"`.

## Output

- Render `search` / `timeline` / `recent-context` JSON as a compact markdown table (columns: ts, type, title, files).
- For `save` / `mark-chapter`: report the returned `id`.
- For `status`: short summary including `project_slug` so the user knows which vault was hit.
- Always mention the project slug.

## Notes

- The MCP tools (`mcp__plugin_mem-vault_mem-vault__*`) are functionally equivalent and preferred for autonomous lookups during reasoning. This slash command is for explicit user-driven inspection.
- The MCP server name is **`mem-vault`** (hyphen) in both Claude Code and Codex. When using `ReadMcpResourceTool`, pass `server: "mem-vault"`.
