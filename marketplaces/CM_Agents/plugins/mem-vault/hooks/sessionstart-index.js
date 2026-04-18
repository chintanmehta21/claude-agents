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
    let db, paths;
    try {
      db = require(path.join(pluginRoot, 'server', 'db.js'));
      paths = require(path.join(pluginRoot, 'server', 'paths.js'));
    } catch (e) {
      console.error('[mem-vault] session-start: deps missing, skipping (' + e.message + ')');
      process.exit(0);
    }

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
    const rows = db.recentContext(d, { limit: 12 });

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

    const header = `# [mem-vault] ${paths.projectSlug(cwd)} — recent context (${rows.length} items)\n`;
    const body = rows.map(fmt).join('\n');
    emit(header + '\n' + body + '\n');
  } catch (err) {
    console.error('[mem-vault] sessionstart hook error: ' + (err.message || err));
    process.exit(0); // never block session start
  }
})();

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
