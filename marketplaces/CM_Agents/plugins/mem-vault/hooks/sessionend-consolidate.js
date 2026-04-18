#!/usr/bin/env node
// sessionend-consolidate.js — close the session, run lightweight consolidation.
'use strict';

const path = require('path');

(async () => {
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
    process.env.MEM_VAULT_ROOT = process.env.MEM_VAULT_ROOT || pluginRoot;

    const raw = await readStdin();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch {}
    const cwd = payload.cwd || process.cwd();

    let db;
    try {
      db = require(path.join(pluginRoot, 'server', 'db.js'));
    } catch { return exit0(); }

    const d = db.open(cwd);
    const sid = db.currentSession(d, payload.source || 'claude-code');
    if (sid) db.endSession(d, sid);

    // Lightweight consolidation: drop duplicate bash/edit observations with identical titles
    // captured within the same second.
    d.exec(`
      DELETE FROM observations WHERE rowid IN (
        SELECT MIN(rowid) FROM observations
        GROUP BY title, type, substr(ts, 1, 19)
        HAVING COUNT(*) > 1
      );
    `);
    exit0();
  } catch (err) {
    console.error('[mem-vault] sessionend hook error: ' + (err.message || err));
    exit0();
  }
})();

function exit0() { process.exit(0); }

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
