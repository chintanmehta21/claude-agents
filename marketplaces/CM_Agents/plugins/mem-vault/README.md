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

Each project gets its **own** `.mem-vault/` directory at the project root.
This is created automatically the first time the plugin fires (a SessionStart
hook, a PostToolUse hook, an MCP tool call from Codex, or any CLI command):

```
<your-project>/.mem-vault/
├── vault.db           SQLite + FTS5 + symbol cache (private — git-ignored)
├── vault.db-wal       WAL journal (private — git-ignored)
├── vault.db-shm       Shared memory (private — git-ignored)
├── meta.json          Project metadata (private — git-ignored)
├── README.md          Human-readable mirror (safe to commit)
├── recent.md          Last N observations as markdown (regenerates often)
└── .gitignore         Excludes the DB by default
```

### Resolution order for the project's vault directory

1. If `MEM_VAULT_DATA_DIR` is set → `<MEM_VAULT_DATA_DIR>/projects/<slug>/`
   (test mode; never auto-creates a project-local dir).
2. Else if `<cwd>/.mem-vault/` exists → use it (one project = one directory).
3. Else if a global vault exists at `~/.mem-vault/projects/<slug>/vault.db` →
   use it (preserves pre-existing setups).
4. Else → create `<cwd>/.mem-vault/` and use it.

### Migration from the legacy global location

If you have an existing global vault at `~/.mem-vault/projects/<slug>/`, the
**first** ensure call after upgrading copies `vault.db`, `vault.db-wal`,
`vault.db-shm`, `meta.json`, and `cache/` into the new project-local dir.
The original is left untouched (so you can roll back).  A one-line stderr
notice prints the byte count.

### Recommended project `.gitignore`

```
# mem-vault per-project store
.mem-vault/vault.db
.mem-vault/vault.db-wal
.mem-vault/vault.db-shm
.mem-vault/meta.json
.mem-vault/cache/
.mem-vault/recent.md
```

(The plugin auto-writes a `.mem-vault/.gitignore` with these rules on first
creation, so this is only needed if you want them in your top-level ignore.)

### Legacy global layout (still supported)

If `auto_create_project_vault: false` in `.claude/mem-vault.local.md` (or no
local `.mem-vault/` exists yet on a system that already had one), data lives at:

```
%USERPROFILE%\.mem-vault\
└── projects\
    └── <project-slug>\        (slug = <basename>-<sha1[:12]> of normalized CWD)
        ├── vault.db
        └── meta.json
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

Per-project: copy `mem-vault.local.md.example` (in the plugin root) to `.claude/mem-vault.local.md` in your project. See [Per-project settings](#per-project-settings) below for the full schema.

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

## Per-project settings

mem-vault reads optional per-project configuration from
`<project-root>/.claude/mem-vault.local.md` — YAML frontmatter plus an
optional free-form markdown body for human notes (the body is ignored by
the plugin). Copy `mem-vault.local.md.example` from the plugin root to
that path and edit.

### Schema

```yaml
---
enabled: true                  # master kill switch
capture_enabled: true          # PostToolUse hook on/off
capture_filter_extra: []       # extra regex patterns of read-only Bash to skip
capture_max_body_chars: 4000   # truncate long observation bodies
session_index_enabled: true    # SessionStart hook on/off
session_index_limit: 12        # how many recent items to surface
consolidate_on_session_end: false
dashboard_port: 37777
dashboard_host: 127.0.0.1
dashboard_open_browser: true
log_verbosity: info            # silent | info | debug
---
```

### Defaults

| Field                          | Default       | Consumed by                          |
|--------------------------------|---------------|--------------------------------------|
| `enabled`                      | `true`        | all hooks, MCP server, CLI search/timeline |
| `capture_enabled`              | `true`        | `server/capture.js`                  |
| `capture_filter_extra`         | `[]`          | `server/capture.js` (Bash filter)    |
| `capture_max_body_chars`       | `4000`        | `server/capture.js` (body truncate)  |
| `session_index_enabled`        | `true`        | `hooks/sessionstart-index.js`        |
| `session_index_limit`          | `12`          | `hooks/sessionstart-index.js`        |
| `consolidate_on_session_end`   | `false`       | `hooks/sessionend-consolidate.js`    |
| `dashboard_port`               | `37777`       | `dashboard/server.js#resolvePort`    |
| `dashboard_host`               | `127.0.0.1`   | `dashboard/server.js#resolveHost`    |
| `dashboard_open_browser`       | `true`        | `server/cli.js` (dashboard subcmd)   |
| `log_verbosity`                | `info`        | `server/settings.js` (warnings)      |

### How to enable

1. Copy `mem-vault.local.md.example` (plugin root) to
   `<your-project>/.claude/mem-vault.local.md`.
2. Edit the values you care about.
3. Add `.claude/mem-vault.local.md` to your **project's** `.gitignore`
   (the plugin's own `.gitignore` already covers `.claude/*.local.md`,
   but consumer projects need their own line).

### Restart semantics

Most settings take effect on the **next hook fire** or the **next CLI
invocation** — the loader re-reads the file each time, so toggling
`capture_enabled` or changing `session_index_limit` is picked up
immediately by subsequent events. A few settings are read **once at
process start** and require restarting the relevant component:

| Change to…                          | Requires…                                  |
|------------------------------------|--------------------------------------------|
| `enabled`, `capture_*`             | nothing — re-read each hook fire           |
| `session_index_*`                  | nothing — re-read each SessionStart        |
| `consolidate_on_session_end`       | nothing — re-read each SessionEnd          |
| `dashboard_port`, `dashboard_host` | restart the dashboard server               |
| `dashboard_open_browser`           | nothing — re-read on next `dashboard` cmd  |
| MCP `enabled` toggle               | restart Claude Code / Codex (MCP loads once) |

Adding/removing the `mem-vault.local.md` file itself never requires
re-installing the plugin, but Claude Code must be restarted to recognise
hooks being newly enabled or disabled at the harness level.

---

## License

MIT
