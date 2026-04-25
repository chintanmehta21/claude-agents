---
description: Launch the local mem-vault web dashboard (http://localhost:37777).
argument-hint: "[status|stop|restart|foreground] [--port 37777] [--no-open]"
allowed-tools: Bash
---

# /dashboard

Control the mem-vault web dashboard — a local-only browser UI backed by the per-project SQLite vaults (read-only). The dashboard normally runs as a **24x7 background daemon** that auto-starts the first time any platform (Claude Code, CC CLI, Codex MCP) touches the plugin and survives across sessions and client restarts.

`$ARGUMENTS` is forwarded as flags / subcommand.

## Run

```bash
node "${CLAUDE_PLUGIN_ROOT}/server/index.js" dashboard $ARGUMENTS
```

Subcommands:

- `dashboard` (no args) — ensure the background daemon is running, print the URL.
- `dashboard status` — show PID, port, uptime, log path.
- `dashboard stop` — terminate the daemon (SIGTERM).
- `dashboard restart` — stop + ensure-running.
- `dashboard foreground [--port N] [--no-open]` — run the server in the current terminal (debugging only; Ctrl+C exits).

## Output

Tell the user:

- The URL: `http://localhost:37777/` (or whichever port was used).
- That the dashboard is a background daemon and will keep running across sessions.
- It is local-only — refuses non-loopback connections.
- To stop it: `/mem-vault:dashboard stop`.
