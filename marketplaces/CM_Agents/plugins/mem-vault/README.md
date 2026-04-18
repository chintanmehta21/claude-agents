# mem-vault

> Windows-native, cross-client persistent memory for Claude Code, Claude Code CLI, and Codex.
> Per-project SQLite store + WASM tree-sitter code intelligence.  No C toolchain required.

`mem-vault` is a ground-up rebuild of `claude-mem`-style persistent memory designed to work reliably on Windows and to share a single vault across **Claude Code (desktop app)**, **Claude Code CLI**, and **Codex** for the same project.

---

## Why this exists

`claude-mem`'s `smart_*` tools compile tree-sitter grammars on-the-fly with `tree-sitter-cli`, which needs a working C compiler (`cc`/`cl.exe`) reachable from the MCP child process.  On Windows this chronically fails because:

- No system-wide `cc`/`cl.exe` in the default PATH.
- MCP stdio children inherit a pruned environment.
- Patching `process.env` at runtime doesn't propagate to grand-children.

**mem-vault's fix:** ship **pre-built WASM grammars** via the `tree-sitter-wasms` npm package and parse with `web-tree-sitter`.  No compiler.  No PATH surgery.  No platform drift.

---

## What you get

### MCP tools (available in CC, CC CLI, Codex)
| Tool | Purpose |
|------|---------|
| `search` | Full-text (FTS5) search across all captured observations |
| `timeline` | Reverse-chronological listing, with type / date filters |
| `get_observations` | Fetch full records by ID |
| `save_observation` | Persist a decision / fix / discovery for future sessions |
| `mark_chapter` | Mark a logical chapter boundary |
| `smart_outline` | Structural outline of a file (functions, classes, types) |
| `smart_search` | Search cached symbols by name across the project |
| `smart_unfold` | Return the source of a specific symbol |
| `recent_context` | Compact recent-memory index |
| `stats` | Counts + paths for the project vault |

### Hooks
- `SessionStart` → injects a compact recent-context index, creates a session row.
- `PostToolUse` → auto-captures Edit/Write/Bash/Task invocations as observations.
- `SessionEnd` → closes session, runs lightweight dedupe.

### Skills (user-invoked slash commands)
- `/mem-vault:mem-vault` — query / save / stats / purge
- `/mem-vault:setup-codex` — one-time Codex wiring
- `/mem-vault:consolidate-memory` — periodic vault cleanup

### Agent
- `memory-consolidator` — autonomous dedupe + compaction with dry-run safety

---

## Install

Inside your marketplace (`CM_Agents`), the plugin lives at
`plugins/mem-vault/`.  Install its Node dependencies (one-time):

```powershell
cd "C:\Users\<you>\Documents\Claude_Code\MyAgents\marketplaces\CM_Agents\plugins\mem-vault"
npm install
```

This triggers `postinstall`, which copies WASM grammars into `server/grammars/`.
If it doesn't run automatically, run it manually:

```powershell
node scripts/bootstrap-grammars.js
```

Verify with:

```powershell
node server/index.js status
node server/index.js outline --file server/db.js
```

---

## Cross-client wiring

### Claude Code (app) + Claude Code CLI

Enabled automatically via `.mcp.json` in this plugin once the plugin is installed from the marketplace.  The MCP server appears as `mem-vault`; the hooks are registered from `hooks/hooks.json`.  Nothing extra to configure.

### Codex

Run the setup skill or CLI once:

```powershell
node server/index.js setup-codex
```

This writes (or replaces) an `[mcp_servers.mem-vault]` block in `~/.codex/config.toml` pointing at the same `server/index.js`.  Restart Codex; `/mcp` should list `mem-vault`.

> The vault DB is keyed by CWD — as long as you launch all three clients from the same project root, they share memory automatically.

---

## Storage layout

```
%USERPROFILE%\.mem-vault\
├── projects\
│   └── <project-slug>\        (slug = <basename>-<sha1[:12]> of normalized CWD)
│       ├── vault.db           SQLite + FTS5 + symbol cache
│       └── meta.json
└── config.json                (global defaults; optional)
```

One SQLite file per project.  WAL mode = concurrent reads + one writer, which handles all three clients safely.

---

## Schema (v1)

```sql
sessions     (id, client, cwd, started_at, ended_at)
chapters     (id, session_id, title, summary, started_at)
observations (id, chapter_id, session_id, ts, type, title, body, files, tags, tokens_work, tokens_read)
observations_fts  -- FTS5 virtual table mirroring observations
symbols      (file, mtime, lang, name, kind, start_line, end_line, signature, parent)
kv           (k, v)
```

---

## CLI cheat sheet

```bash
# Memory
node server/index.js status
node server/index.js search --q "auth token"
node server/index.js timeline --limit 25
node server/index.js save --title "..." --body "..." --type decision --tags a,b
node server/index.js recent-context --format markdown
node server/index.js mark-chapter --title "Refactor X"
node server/index.js purge --yes

# Session
node server/index.js start-session --client cli
node server/index.js end-session

# Code intel (WASM tree-sitter)
node server/index.js outline --file src/foo.ts

# Cross-client
node server/index.js setup-codex
node server/index.js projects
```

---

## Configuration

Per-project: copy `mem-vault.local.md.example` (in the plugin root) to `.claude/mem-vault.local.md` in your project.

Env vars:

| Var | Default | Purpose |
|---|---|---|
| `MEM_VAULT_ROOT` | plugin dir | Override plugin root (rarely needed) |
| `MEM_VAULT_DATA_DIR` | `%USERPROFILE%\.mem-vault` | Override vault storage location |
| `MEM_VAULT_CLIENT` | auto-detected | Force client name for session rows |
| `MEM_VAULT_CWD` | `process.cwd()` | Override CWD for slug resolution |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `better-sqlite3` missing | `npm install --prefix <plugin-dir>` |
| WASM grammar not found | `node scripts/bootstrap-grammars.js` |
| Different slug across clients | Ensure all clients are launched from the same CWD |
| Codex doesn't see `mem-vault` | Restart Codex after `setup-codex`; confirm `~/.codex/config.toml` contains the block |
| Vault locked | Another client holds a write lock; retry in a few seconds (WAL handles it) |

---

## Design decisions

- **SQLite + FTS5**: no external index, fast, file-level portability, WAL supports concurrent clients.
- **WASM tree-sitter (`web-tree-sitter` + `tree-sitter-wasms`)**: zero compilation at query time; works identically on Windows/macOS/Linux.
- **CWD-keyed project slugs**: deterministic across clients; no registration step required for new projects.
- **Hooks use the CLI, not MCP stdio**: hooks are subprocesses and can't speak MCP; the CLI opens SQLite directly (WAL-safe).
- **`capture` type is throwaway; `decision`/`feature`/`bugfix` are permanent**: consolidation is safe by default.

---

## License

MIT
