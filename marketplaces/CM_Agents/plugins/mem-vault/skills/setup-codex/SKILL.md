---
name: setup-codex
description: Use when the user wants to connect mem-vault to Codex, asks "set up mem-vault for Codex", "add mem-vault to codex config", "make memory work in codex", or needs the cross-client memory store wired into ~/.codex/config.toml so the same vault is shared between Claude Code and Codex.
allowed-tools: Bash, Read
---

# setup-codex skill

Wire mem-vault into Codex by writing an `[mcp_servers.mem-vault]` block into `~/.codex/config.toml` that points at this plugin's server entrypoint.  After running, Codex sessions in the same project folder see the same vault as Claude Code and CC CLI.

## When to use

Trigger when the user asks:
- "set up mem-vault for codex"
- "make memory work in codex"
- "add mem-vault to codex config"
- "why doesn't codex see my memory"

## Steps

1. Explain what will be changed: "I will add/replace the `[mcp_servers.mem-vault]` block in `~/.codex/config.toml` pointing at `${CLAUDE_PLUGIN_ROOT}/server/index.js`.  Nothing else is touched."
2. Confirm with the user.
3. Run:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/server/index.js" setup-codex
   ```
4. Parse the returned `{ ok, path, action }` JSON.  Tell the user:
   - `action === "added"` → "Added mem-vault to Codex config at <path>.  Restart Codex to load."
   - `action === "replaced"` → "Updated existing mem-vault entry at <path>.  Restart Codex."
5. Show the resulting block for transparency:
   ```bash
   cat ~/.codex/config.toml
   ```
   (trim to the `[mcp_servers.mem-vault]` section).

## Verifying

After Codex restarts, run in Codex:
```
/mcp
```
and look for `mem-vault` in the server list.  Then call `stats` from Codex — if the `project_slug` matches the one Claude Code reports, they're sharing the same vault.

## Per-project vault directory (auto)

On any tool call, mem-vault auto-creates `<project>/.mem-vault/` if absent,
using the project root detected from your current working directory (or from
any file path passed to the tool).  This matches the directory Claude Code
would use for the same project — so CC and Codex share one vault per project.

Detection walks UP from the relevant directory looking for any of:
`.mem-vault/`, `.git/`, `package.json`, `Cargo.toml`, `pyproject.toml`,
`go.mod`, `pom.xml`, `AGENTS.md`, `CLAUDE.md`.  It stops at your homedir or
the filesystem root.  If none match, it falls back to the literal cwd.

Per-request resolution order:
1. `MEM_VAULT_CWD` env (if explicitly set)
2. project root walked up from any file path in the tool params
   (`file_path`, `file`, `files[0]`)
3. project root walked up from the MCP server's startup `process.cwd()`
4. raw `process.cwd()` (last resort)

Codex doesn't run hooks, but its first MCP call triggers creation just the
same.  TOML doesn't shell-expand, so we deliberately do **not** set
`MEM_VAULT_CWD` or `cwd` in the config block — the walk-up detection covers
the case where Codex spawns the MCP child from a non-project directory.

If a global vault already exists at `~/.mem-vault/projects/<slug>/`, the very
first ensure call in that project copies its `vault.db`, `vault.db-wal`,
`vault.db-shm`, `meta.json`, and `cache/` into the new local `.mem-vault/` so
no history is lost.

## Troubleshooting

- **Codex doesn't find node** → set `command = "<full-path-to-node.exe>"` in the TOML block.
- **Different project_slug on different clients** → clients launched from different CWDs.  Launch all three from the project root.
- **Codex can't reach SQLite** → ensure `%USERPROFILE%\.mem-vault\` is writable, or that the project's `.mem-vault/` is.
