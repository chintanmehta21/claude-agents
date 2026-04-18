---
name: consolidate-memory
description: Use when the user asks to clean up, compact, deduplicate, or prune the mem-vault memory store. Triggers on "consolidate memory", "clean up the vault", "prune stale observations", "dedupe memory", "compact the vault".
allowed-tools: Bash
argument-hint: "[--dry-run] [--older-than <days>]"
---

# consolidate-memory skill

Periodically cleans up the per-project vault: removes exact-duplicate observations, drops very old low-value `capture` entries, and rebuilds the FTS5 index.

## When to use

- User asks to clean up / compact / dedupe memory
- After a long captured session with many `Bash` observations
- Before backing up or sharing the vault file

## Steps

1. Show current stats:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/server/index.js" status
   ```
2. Confirm with user: "This will delete duplicate observations and captured Bash entries older than N days.  Continue?"
3. Perform consolidation via a small inline sqlite3 pipeline.  Because the plugin exposes SQLite directly, use a Node one-liner that loads `better-sqlite3` and runs:

```bash
node -e "
const db = require('better-sqlite3')(require('path').join(require('os').homedir(), '.mem-vault/projects/' + process.argv[1] + '/vault.db'));
const cutoff = new Date(Date.now() - (Number(process.argv[2]||30)*86400000)).toISOString();
const dup = db.prepare(\"DELETE FROM observations WHERE rowid NOT IN (SELECT MIN(rowid) FROM observations GROUP BY title, type, substr(ts,1,19))\").run();
const old = db.prepare(\"DELETE FROM observations WHERE type='capture' AND ts < ?\").run(cutoff);
db.exec(\"INSERT INTO observations_fts(observations_fts) VALUES('rebuild')\");
db.exec('VACUUM');
console.log(JSON.stringify({ duplicates_removed: dup.changes, old_captures_removed: old.changes }));
" "$SLUG" "$DAYS"
```

Replace `$SLUG` with the value returned by `status.project_slug`, and `$DAYS` with the `--older-than` argument (default 30).

4. Show the new stats and report what was removed.

## Safety

- Never deletes `feature`, `bugfix`, `decision`, or `discovery` observations based on age — those are high-value and permanent.
- Only `capture` (auto-captured tool calls) is age-pruned.
- `--dry-run` flag: report what *would* be removed without running the DELETEs.

## Default schedule

Call this skill roughly once a week per active project.  It's safe to run often — idempotent and cheap.
