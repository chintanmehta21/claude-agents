// project_mirror.js — keep a human-readable mirror of this project's vault at
// <project>/.mem-vault/.  The authoritative store is still SQLite in
// %USERPROFILE%\.mem-vault\projects\<slug>\vault.db — this folder is purely for
// quick browsing, git diffs, and "what does the LLM remember about this repo?"
// visibility.
//
// Writes:
//   <project>/.mem-vault/README.md   — project summary, slug, vault DB path, counts, how to query
//   <project>/.mem-vault/recent.md   — last N observations as a readable markdown table
//   <project>/.mem-vault/.gitignore  — suggests ignoring recent.md (noisy diffs) or the whole dir
//
// Idempotent: safe to call every SessionStart.  Never writes if refresh is disabled.
'use strict';

const fs = require('fs');
const path = require('path');

const paths = require('./paths');
const db = require('./db');

/** Write/refresh the project-root .mem-vault/ mirror.  Returns a summary. */
function refresh(cwd, opts = {}) {
  const projectRoot = path.resolve(cwd);
  const mirrorDir = path.join(projectRoot, '.mem-vault');

  if (opts.disabled) return { skipped: true, reason: 'disabled' };

  // Never write the mirror inside the vault storage directory itself (e.g. when
  // running `status` from ~/.mem-vault/projects/<slug>/).  Guard against that.
  if (projectRoot.startsWith(paths.vaultRoot())) {
    return { skipped: true, reason: 'inside-vault-root' };
  }

  // Open DB (will create on first touch).
  let d;
  try {
    d = db.open(projectRoot);
  } catch (e) {
    return { skipped: true, reason: 'db-open-failed', error: e.message };
  }

  paths.ensureDir(mirrorDir);

  const slug = paths.projectSlug(projectRoot);
  const dbPath = paths.vaultDbPath(projectRoot);
  const stats = db.stats(d);
  const rows = db.recentContext(d, { limit: Number(opts.limit) || 25 });

  const readme = renderReadme({ slug, projectRoot, dbPath, stats });
  const recent = renderRecent({ slug, rows });
  const gitignore = renderGitignore();

  writeIfChanged(path.join(mirrorDir, 'README.md'), readme);
  writeIfChanged(path.join(mirrorDir, 'recent.md'), recent);
  writeIfChanged(path.join(mirrorDir, '.gitignore'), gitignore);

  return {
    ok: true,
    mirror_dir: mirrorDir,
    slug,
    db_path: dbPath,
    stats,
    recent_count: rows.length,
  };
}

function writeIfChanged(filePath, content) {
  try {
    if (fs.existsSync(filePath)) {
      const prev = fs.readFileSync(filePath, 'utf8');
      if (prev === content) return false;
    }
  } catch {}
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function renderReadme({ slug, projectRoot, dbPath, stats }) {
  return `# mem-vault — ${slug}

> Auto-generated on ${new Date().toISOString()}.  Refreshed every session start.

This folder is a **read-only mirror** of this project's entry in the mem-vault
memory store.  Nothing in this folder is authoritative — the real database is
the SQLite file below.

## Project

| Field | Value |
|---|---|
| Project root | \`${projectRoot}\` |
| Project slug | \`${slug}\` |
| Vault DB | \`${dbPath}\` |
| Observations | ${stats.observations} |
| Chapters | ${stats.chapters} |
| Sessions | ${stats.sessions} |
| Cached symbols | ${stats.symbols} |

## Shared across

- Claude Code (app) — via \`.mcp.json\` in the mem-vault plugin
- Claude Code CLI — same \`.mcp.json\`
- Codex — via \`~/.codex/config.toml\` → \`[mcp_servers.mem-vault]\`

All three clients open the **same** \`vault.db\` for this project because they
resolve the same project slug from the same CWD.

## Quick queries

From this project's root:

\`\`\`bash
# Inside any Claude/Codex session, just ask:
/mem-vault:mem-vault search <term>
/mem-vault:mem-vault recent
/mem-vault:mem-vault status

# Or directly via CLI (from this project root):
node "$CLAUDE_PLUGIN_ROOT/server/index.js" search --q "<term>"
node "$CLAUDE_PLUGIN_ROOT/server/index.js" timeline --limit 25
node "$CLAUDE_PLUGIN_ROOT/server/index.js" mirror   # rebuilds this folder
\`\`\`

## What's in this folder

| File | Purpose |
|---|---|
| \`README.md\` | This file (auto-regenerated). |
| \`recent.md\` | Last 25 observations in human-readable form. |
| \`.gitignore\` | Suggested rules (defaults to ignoring \`recent.md\` which changes often). |

To stop generating this folder, set \`mirror: false\` in
\`.claude/mem-vault.local.md\` or delete the folder (mem-vault will only
re-create it if this feature is enabled).

## Memory types

| Type | Meaning | Auto-pruned? |
|---|---|---|
| \`feature\` | New capability added | never |
| \`bugfix\` | Bug fixed | never |
| \`refactor\` | Structural change | never |
| \`change\` | Edit/write observation | no |
| \`decision\` | Explicit decision recorded | never |
| \`discovery\` | Insight or learning | never |
| \`capture\` | Auto-captured tool call | yes (after 30d via \`consolidate-memory\`) |
| \`note\` | Free-form user note | no |
`;
}

function renderRecent({ slug, rows }) {
  if (!rows.length) {
    return `# ${slug} — recent context\n\n_No observations yet._\n\nRun any edit/write/bash from inside this project and it will be captured.\n`;
  }
  const header = `# ${slug} — recent context (${rows.length})\n\n` +
    `_Auto-regenerated ${new Date().toISOString()}.  See README.md._\n\n` +
    `| Time | Type | Title | Files | ID |\n|------|------|-------|-------|----|\n`;
  const body = rows.map((r) => {
    const files = (r.files || []).slice(0, 2).map(short).join(', ');
    return `| ${r.ts} | \`${r.type}\` | ${escapePipes(r.title)} | ${escapePipes(files)} | \`${r.id}\` |`;
  }).join('\n');
  return header + body + '\n';
}

function renderGitignore() {
  return `# mem-vault project store.
# This folder may now contain the project's vault DB (vault.db) — that is private
# per-developer state and MUST NOT be committed.  README.md is safe to commit so
# teammates see the slug + how memory works.  recent.md regenerates every session.
vault.db
vault.db-wal
vault.db-shm
meta.json
cache/
recent.md

# Uncomment the line below to ignore this whole folder:
# *
`;
}

function short(p) {
  if (!p) return '';
  const parts = String(p).replace(/\\/g, '/').split('/');
  return parts.slice(-2).join('/');
}

function escapePipes(s) { return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' '); }

module.exports = { refresh };
