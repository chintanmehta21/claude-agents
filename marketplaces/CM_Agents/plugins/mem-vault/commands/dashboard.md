---
description: Launch the local mem-vault web dashboard (http://localhost:37777).
argument-hint: "[--port 37777] [--no-open]"
allowed-tools: Bash
---

# /dashboard

Start the mem-vault web dashboard — a local-only browser UI for searching observations, browsing the timeline, and inspecting per-project stats. The server listens on `127.0.0.1:37777` (override with `--port` or env `MEM_VAULT_DASHBOARD_PORT`) and reads the SQLite vaults read-only.

`$ARGUMENTS` is forwarded as flags.

## Run

Spawn the dashboard in the background so the slash command returns immediately, then report the URL:

```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" dashboard $ARGUMENTS
```

If the user passed `--no-open`, do not auto-open a browser. Otherwise the server best-effort opens the default browser via `start` on Windows.

## Output

After starting, tell the user:

- The URL: `http://localhost:37777/` (or whichever port was used)
- The slash command to stop it (Ctrl+C in the terminal that hosts the server, or kill the node process)
- Reminder: dashboard is local-only — refuses non-loopback connections.
