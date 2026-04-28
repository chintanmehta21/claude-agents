#!/usr/bin/env node
// userpromptsubmit-prefetch.js — auto-search the project vault for the user's
// prompt and inject any matching prior observations as additionalContext so
// the agent sees them BEFORE deciding to Grep/Read.
//
// Soft-fails: never blocks the prompt. Hard 1.5s timeout.
'use strict';

const path = require('path');

(async () => {
  const start = Date.now();
  try {
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
    process.env.MEM_VAULT_ROOT = process.env.MEM_VAULT_ROOT || pluginRoot;

    const raw = await readStdin();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch {}
    const cwd = payload.cwd || process.cwd();
    const prompt = payload.prompt || '';

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
    if (settings.prefetch_on_user_prompt === false) return exit0();
    try { paths.ensureProjectVault(cwd, { settings }); } catch {}

    const limit = Number(settings.prefetch_max_results) || 5;

    const work = (async () => prefetch.runPrefetch({ cwd, prompt, limit, recent: true, settings }))();
    const timed = await Promise.race([
      work,
      new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);

    if (!timed) {
      try { hookLog.append('UserPromptSubmit', { cwd, ms: Date.now() - start, timeout: true }); } catch {}
      return exit0();
    }

    const hint = prefetch.formatHint({
      results: timed.results,
      recent: timed.recent,
      query: timed.query,
      mode: 'prompt',
    });

    try {
      hookLog.append('UserPromptSubmit', {
        cwd,
        query: timed.query,
        hits: timed.results.length,
        recent: timed.recent.length,
        ms: Date.now() - start,
      });
    } catch {}

    if (!hint) return exit0();

    const out = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: hint,
      },
    };
    process.stdout.write(JSON.stringify(out));
    return exit0();
  } catch (err) {
    process.stderr.write('[mem-vault] userpromptsubmit hook error: ' + (err && err.message || err) + '\n');
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
    setTimeout(() => resolve(data), 1200);
  });
}
