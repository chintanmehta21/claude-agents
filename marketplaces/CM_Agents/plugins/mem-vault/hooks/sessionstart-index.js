#!/usr/bin/env node
// sessionstart-index.js — emit a compact "recent context" block via additionalContext.
// Must never fail the session.  Soft-fails to stderr on any error.
'use strict';

const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
    process.env.MEM_VAULT_ROOT = process.env.MEM_VAULT_ROOT || pluginRoot;

    // Read hook payload (JSON) from stdin if provided.
    const raw = await readStdin();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch {}

    const cwd = payload.cwd || process.cwd();

    // Load modules lazily; if deps aren't installed yet, exit silently.
    let db, paths, settingsMod;
    try {
      db = require(path.join(pluginRoot, 'server', 'db.js'));
      paths = require(path.join(pluginRoot, 'server', 'paths.js'));
      settingsMod = require(path.join(pluginRoot, 'server', 'settings.js'));
    } catch (e) {
      console.error('[mem-vault] session-start: deps missing, skipping (' + e.message + ')');
      process.exit(0);
    }

    const settings = settingsMod.loadSettings(cwd);
    if (settings.enabled === false || settings.session_index_enabled === false) {
      // Honor the kill switch — don't even open the DB.
      process.exit(0);
    }
    // Resolve / lazily create the per-project .mem-vault/ dir.  Idempotent.
    try { paths.ensureProjectVault(cwd, { settings }); } catch (e) {
      console.error('[mem-vault] ensureProjectVault failed: ' + (e.message || e));
    }
    // Fire-and-forget: ensure the 24x7 dashboard daemon is up.
    try {
      const dd = require(path.join(pluginRoot, 'server', 'dashboard_daemon.js'));
      dd.ensureDashboardRunningAsync({ cwd });
    } catch (_) { /* never block session start */ }
    const sessionLimit = Number(settings.session_index_limit) || 12;

    const vaultDb = paths.vaultDbPath(cwd);
    if (!fs.existsSync(vaultDb)) {
      // Cold start: no memory yet.  Still create a session and emit a header.
      const d = db.open(cwd);
      db.startSession(d, { client: payload.source || 'claude-code', cwd });
      emit(`# [mem-vault] ${paths.projectSlug(cwd)} — new project, no memory yet.\n`);
      return;
    }

    const d = db.open(cwd);
    db.startSession(d, { client: payload.source || 'claude-code', cwd });
    const rows = highSignalRecent(db, d, { limit: sessionLimit });

    // Refresh the project-root .mem-vault/ mirror (README + recent.md).  Best-effort.
    try {
      const mirror = require(path.join(pluginRoot, 'server', 'project_mirror.js'));
      mirror.refresh(cwd);
    } catch (e) {
      console.error('[mem-vault] mirror skipped: ' + (e.message || e));
    }

    if (!rows.length) {
      emit(`# [mem-vault] ${paths.projectSlug(cwd)} — vault ready, no observations yet.\n`);
      return;
    }

    const header =
      `# [mem-vault] ${paths.projectSlug(cwd)} — recent context (${rows.length} items)\n` +
      `\n## DEFAULT TOOL ORDER (NON-NEGOTIABLE)\n` +
      `For any question about THIS codebase — what something does, where a function lives, why a decision was made, what changed recently, how a file is structured — use mem-vault tools FIRST. Grep/Read/Glob are FALLBACKS, used only after mem-vault returns insufficient results.\n\n` +
      `1. **\`mcp__plugin_mem-vault_mem-vault__search\`** ← default for "where/why/what/how" questions. Searches all prior decisions, bugfixes, features, captures, and edits across this project's history.\n` +
      `2. **\`mcp__plugin_mem-vault_mem-vault__smart_search\`** ← default for finding a function/class/method/symbol by name. Uses tree-sitter, language-aware. Replaces Grep for symbol lookups.\n` +
      `3. **\`mcp__plugin_mem-vault_mem-vault__smart_outline\`** ← default before opening an unfamiliar source file. Returns the file's structural map (functions/classes/exports). Replaces a blind Read.\n` +
      `4. **\`mcp__plugin_mem-vault_mem-vault__smart_unfold\`** ← drill into a specific symbol from an outline.\n` +
      `5. **\`mcp__plugin_mem-vault_mem-vault__recall_for_query\`** ← bulk recall around a free-form query (decisions + recent context together).\n` +
      `6. **\`mcp__plugin_mem-vault_mem-vault__timeline\`** ← "what changed recently" / "what did we do this week".\n\n` +
      `Use Grep / Read / Glob ONLY when: (a) mem-vault tools returned empty or stale, OR (b) you need raw file content the smart tools didn't surface. Mention which mem-vault tool you tried first when falling back.\n\n` +
      `The ${rows.length} items below are HIGH-SIGNAL prior decisions and recent activity:\n`;
    const body = rows.map(fmt).join('\n');
    const guidance = `

## How to use mem-vault (IMPORTANT)

You have persistent project memory via the \`mem-vault\` MCP server. **Use it proactively** — don't wait for the user to ask.

**Server name is \`mem-vault\` (with a hyphen) in BOTH Claude Code and Codex.** If you call \`ReadMcpResourceTool\` or \`ListMcpResourcesTool\`, pass \`server: "mem-vault"\` — never \`mem_vault\`. Resource URIs are \`mem-vault://recent\`, \`mem-vault://status\`, \`mem-vault://timeline\`.

**Default tool order is documented at the top of this context. Recap of WHEN to use each mem-vault tool:**
- \`search\` — questions about prior work / history ("what does X do", "why did we", "have we changed", "status of")
- \`smart_search\` — find a symbol (function/class/method) by name; replaces Grep for symbol lookups
- \`smart_outline\` — file's structural map (functions/classes/exports); use BEFORE Read on unfamiliar files
- \`smart_unfold\` — drill into a specific symbol from an outline
- \`recall_for_query\` — bulk recall around a free-form query
- \`timeline\` — recent activity / "what changed today"

Grep/Read/Glob are FALLBACKS, used only when mem-vault returns insufficient results.

**When you finish a logical task, call:**
- \`mcp__plugin_mem-vault_mem-vault__save_observation\` — record the decision/fix/feature so future sessions (CC, CLI, Codex) remember it. Use type=\`decision\` for choices, \`bugfix\` for fixes, \`feature\` for new capability, \`discovery\` for insights.
- \`mcp__plugin_mem-vault_mem-vault__mark_chapter\` — mark logical boundaries in long sessions.

Treat mem-vault as your first line of context retrieval, not a last resort.
`;
    emit(header + '\n' + body + '\n' + guidance);
  } catch (err) {
    console.error('[mem-vault] sessionstart hook error: ' + (err.message || err));
    process.exit(0); // never block session start
  }
})();

/**
 * Pull high-signal observations: top (limit-4) from
 * decision|bugfix|feature|discovery|refactor in the last 14 days, then top 4
 * most-recent of any type. De-duped, ordered most-recent first.
 */
function highSignalRecent(db, d, { limit = 12 } = {}) {
  const HIGH = ['decision', 'bugfix', 'feature', 'discovery', 'refactor'];
  const RECENT_TAIL = Math.min(4, Math.max(1, Math.floor(limit / 3)));
  const HIGH_LIMIT = Math.max(1, limit - RECENT_TAIL);
  const sinceISO = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const seen = new Set();
  const merged = [];

  for (const t of HIGH) {
    let rows = [];
    try { rows = db.timeline(d, { limit: HIGH_LIMIT, since: sinceISO, type: t }); } catch {}
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }
  }
  // Most-recent any-type tail.
  let tail = [];
  try { tail = db.recentContext(d, { limit: RECENT_TAIL * 3 }); } catch {}
  for (const r of tail) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  // Sort by timestamp desc, slice to limit.
  merged.sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')));
  return merged.slice(0, limit);
}

function fmt(r) {
  const files = (r.files && r.files.length) ? ` [${r.files.slice(0, 2).join(', ')}]` : '';
  return `- \`${r.type}\` ${r.title}${files}  _(${r.ts})_  id=${r.id}`;
}

function emit(text) {
  // Claude Code SessionStart hook can emit additionalContext via JSON on stdout.
  const out = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: text,
    },
  };
  process.stdout.write(JSON.stringify(out));
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
    setTimeout(() => resolve(data), 2000);
  });
}
