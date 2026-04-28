#!/usr/bin/env node
// pretooluse-hint.js — surface relevant prior memory before Grep/Read/Glob/Bash
// runs so the agent has a chance to short-circuit on already-known answers.
//
// HINT only: never blocks the tool call (no `decision` field set).
// Hard 1s timeout. Soft-fails on every error.
'use strict';

const path = require('path');

(async () => {
  const start = Date.now();
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
    process.env.MEM_VAULT_ROOT = process.env.MEM_VAULT_ROOT || pluginRoot;

    const raw = await readStdin();
    if (!raw) return exit0();
    let payload;
    try { payload = JSON.parse(raw); } catch { return exit0(); }

    const cwd = payload.cwd || process.cwd();
    const toolName = payload.tool_name || '';
    const toolInput = payload.tool_input || {};

    let prefetch, settingsMod, paths, hookLog;
    try {
      prefetch = require(path.join(pluginRoot, 'server', 'prefetch.js'));
      settingsMod = require(path.join(pluginRoot, 'server', 'settings.js'));
      paths = require(path.join(pluginRoot, 'server', 'paths.js'));
      hookLog = require(path.join(pluginRoot, 'server', 'hook_log.js'));
    } catch (e) {
      return exit0();
    }

    const settings = settingsMod.loadSettings(cwd);
    if (settings.enabled === false) return exit0();
    if (settings.pretool_hint === false) return exit0();
    try { paths.ensureProjectVault(cwd, { settings }); } catch {}

    const query = prefetch.extractQueryFromToolInput(toolName, toolInput);
    if (!query) return exit0();

    const limit = Number(settings.prefetch_max_results) || 5;

    const work = (async () =>
      prefetch.runPrefetch({ cwd, query, limit, recent: false, settings }))();
    const timed = await Promise.race([
      work,
      new Promise((resolve) => setTimeout(() => resolve(null), 1000)),
    ]);

    if (!timed || !timed.results || timed.results.length === 0) {
      try { hookLog.append('PreToolUse', { cwd, tool: toolName, query, hits: 0, ms: Date.now() - start }); } catch {}
      return exit0();
    }

    const hint = prefetch.formatHint({
      results: timed.results,
      query: timed.query,
      mode: 'tool',
    });
    if (!hint) return exit0();

    try {
      hookLog.append('PreToolUse', {
        cwd, tool: toolName, query: timed.query, hits: timed.results.length, ms: Date.now() - start,
      });
    } catch {}

    // additionalContext is a HINT, not a gate — `decision` is omitted on
    // purpose so the tool call still proceeds.
    const out = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: hint,
      },
    };
    process.stdout.write(JSON.stringify(out));
    return exit0();
  } catch (err) {
    process.stderr.write('[mem-vault] pretooluse hook error: ' + (err && err.message || err) + '\n');
    return exit0();
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
    setTimeout(() => resolve(data), 800);
  });
}
