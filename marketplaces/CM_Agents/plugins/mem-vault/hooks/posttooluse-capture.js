#!/usr/bin/env node
// posttooluse-capture.js — persist interesting tool calls as observations.
// Soft-fails: never blocks the tool call.
'use strict';

const path = require('path');

(async () => {
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
    process.env.MEM_VAULT_ROOT = process.env.MEM_VAULT_ROOT || pluginRoot;

    const raw = await readStdin();
    if (!raw) return exit0();
    let payload;
    try { payload = JSON.parse(raw); } catch { return exit0(); }

    const cwd = payload.cwd || process.cwd();

    let capture, db, paths, settingsMod;
    try {
      capture = require(path.join(pluginRoot, 'server', 'capture.js'));
      db = require(path.join(pluginRoot, 'server', 'db.js'));
      paths = require(path.join(pluginRoot, 'server', 'paths.js'));
      settingsMod = require(path.join(pluginRoot, 'server', 'settings.js'));
    } catch (e) {
      return exit0();
    }

    const settings = settingsMod.loadSettings(cwd);
    if (settings.enabled === false) return exit0();
    try { paths.ensureProjectVault(cwd, { settings }); } catch {}

    const obs = capture.fromToolUse(payload, { settings });
    if (!obs) return exit0();

    const d = db.open(cwd);
    const sid = db.currentSession(d, 'claude-code') || db.startSession(d, { client: 'claude-code', cwd });
    db.saveObservation(d, { ...obs, session_id: sid });
    exit0();
  } catch (err) {
    console.error('[mem-vault] posttooluse hook error: ' + (err.message || err));
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
    setTimeout(() => resolve(data), 1500);
  });
}
