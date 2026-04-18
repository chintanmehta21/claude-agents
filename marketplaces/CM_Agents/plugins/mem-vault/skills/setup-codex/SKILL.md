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

## Troubleshooting

- **Codex doesn't find node** → set `command = "<full-path-to-node.exe>"` in the TOML block.
- **Different project_slug on different clients** → clients launched from different CWDs.  Launch all three from the project root.
- **Codex can't reach SQLite** → ensure `%USERPROFILE%\.mem-vault\` is writable.
