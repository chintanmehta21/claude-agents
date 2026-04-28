// hook_log.js — append-only, size-rotated log of hook fires for diagnostics.
// Used by the doctor subcommand and helpful for debugging hook behavior.
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB rotation threshold

function logPath() {
  return path.join(os.homedir(), '.mem-vault', 'hook-fires.log');
}

function append(event, info = {}) {
  try {
    const p = logPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    // Rotate if over threshold.
    try {
      const st = fs.statSync(p);
      if (st.size > MAX_BYTES) {
        try { fs.renameSync(p, p + '.1'); } catch {}
      }
    } catch {}
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      event,
      pid: process.pid,
      ...info,
    }) + '\n';
    fs.appendFileSync(p, line, 'utf8');
  } catch {
    // Never fail callers on log write errors.
  }
}

function tail(n = 5) {
  const p = logPath();
  if (!fs.existsSync(p)) return [];
  try {
    const txt = fs.readFileSync(p, 'utf8');
    const lines = txt.trim().split(/\r?\n/);
    return lines.slice(-n).map((l) => {
      try { return JSON.parse(l); } catch { return { raw: l }; }
    });
  } catch { return []; }
}

module.exports = { append, tail, logPath };
