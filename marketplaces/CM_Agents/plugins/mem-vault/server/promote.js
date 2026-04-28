// promote.js — heuristics that turn raw `capture`/`change` observations
// into higher-signal `bugfix` / `feature` / `refactor` / `discovery` records.
//
// State is persisted to ~/.mem-vault/.promote-state.json so a session window
// across multiple PostToolUse fires can reason about cause/effect.
//
// Stats counter (for `doctor`) lives in-memory in this process; on a fresh
// hook fire each invocation increments and writes a daily roll-up to the
// state file under `stats.daily.<YYYY-MM-DD>.<type>`.
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const STATE_VERSION = 1;
const RECENT_WINDOW_MS = 30 * 60 * 1000; // 30 min

function statePath() {
  const root = process.env.MEM_VAULT_DATA_DIR
    ? path.resolve(process.env.MEM_VAULT_DATA_DIR)
    : path.join(os.homedir(), '.mem-vault');
  try { fs.mkdirSync(root, { recursive: true }); } catch {}
  return path.join(root, '.promote-state.json');
}

function loadState() {
  const p = statePath();
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const obj = JSON.parse(raw);
    if (obj && obj.version === STATE_VERSION) return obj;
  } catch {}
  return { version: STATE_VERSION, sessions: {}, stats: { daily: {} } };
}

function saveState(s) {
  try { fs.writeFileSync(statePath(), JSON.stringify(s), 'utf8'); } catch {}
}

function pruneOld(state, now) {
  for (const sid of Object.keys(state.sessions || {})) {
    const sess = state.sessions[sid];
    if (!sess || !sess.events) { delete state.sessions[sid]; continue; }
    sess.events = sess.events.filter((e) => now - e.ts < RECENT_WINDOW_MS);
    if (sess.events.length === 0) delete state.sessions[sid];
  }
}

function bumpStats(state, type) {
  const day = new Date().toISOString().slice(0, 10);
  state.stats = state.stats || { daily: {} };
  state.stats.daily = state.stats.daily || {};
  state.stats.daily[day] = state.stats.daily[day] || {};
  state.stats.daily[day][type] = (state.stats.daily[day][type] || 0) + 1;
  // Keep last 7 days only.
  const days = Object.keys(state.stats.daily).sort();
  while (days.length > 7) delete state.stats.daily[days.shift()];
}

function getStatsSummary() {
  const s = loadState();
  return s.stats || { daily: {} };
}

/** Pull the most recent user prompt from the hook log (best-effort). */
function recentUserPrompt() {
  try {
    const hookLog = require('./hook_log');
    const tail = hookLog.tail(10) || [];
    for (let i = tail.length - 1; i >= 0; i--) {
      const e = tail[i];
      if (!e) continue;
      if (e.event === 'UserPromptSubmit' && e.prompt) return String(e.prompt);
      if (e.prompt) return String(e.prompt);
    }
  } catch {}
  return '';
}

const FEATURE_VERBS = /\b(add|implement|build|create|introduce|support|enable)\b/i;
const NOUN_AFTER = /\b(?:add|implement|build|create|introduce|support|enable)\s+(?:a|an|the)?\s*([A-Za-z][\w./-]{2,})/i;

function classifyBashCommand(cmd) {
  const c = String(cmd || '');
  const isTest = /\b(pytest|jest|vitest|mocha|go\s+test|cargo\s+test|npm\s+test|yarn\s+test|pnpm\s+test|node\s+--test)\b/.test(c);
  const isBuild = /\b(npm\s+run\s+build|yarn\s+build|pnpm\s+build|cargo\s+build|go\s+build|make\b)/.test(c);
  return { isTest, isBuild };
}

function detectFailure(output) {
  const s = String(output || '');
  if (!s) return false;
  return /\b(FAIL|FAILED|Error:|Traceback|AssertionError|✗|×|exit code 1|exit code 2)\b/.test(s)
      || /\b\d+\s+failed\b/i.test(s);
}

function detectPass(output) {
  const s = String(output || '');
  if (!s) return false;
  if (detectFailure(s)) return false;
  return /\b(PASS|PASSED|ok|✓|all tests passed|0 failed)\b/i.test(s)
      || /\b\d+\s+passed\b/i.test(s);
}

function detectStackTrace(output) {
  const s = String(output || '');
  return /(Traceback \(most recent call last\)|^\s*at\s+[\w.<>]+\s*\(.+:\d+:\d+\)|Exception in thread|panic:)/m.test(s);
}

/**
 * Promote a Bash capture. Returns { type, body, tags, confidence } or null.
 */
function promoteFromBash(payload, opts = {}) {
  const ti = (payload && (payload.tool_input || payload.input)) || {};
  const tr = (payload && (payload.tool_response || payload.response)) || {};
  const cmd = String(ti.command || '');
  const output = String(tr.stdout || tr.output || '') + '\n' + String(tr.stderr || '');
  if (!cmd) return null;

  const sid = (payload && payload.session_id) || 'default';
  const now = Date.now();
  const state = loadState();
  pruneOld(state, now);
  state.sessions[sid] = state.sessions[sid] || { events: [] };
  const events = state.sessions[sid].events;

  const kind = classifyBashCommand(cmd);
  const failed = detectFailure(output);
  const passed = detectPass(output);
  const trace = detectStackTrace(output);

  // Record this event before deciding so subsequent fires can correlate.
  events.push({
    ts: now,
    kind: kind.isTest ? 'test' : (kind.isBuild ? 'build' : 'bash'),
    failed,
    passed,
    cmd: cmd.slice(0, 200),
  });

  let result = null;

  if (kind.isTest && passed) {
    // Look back for failing test → edit → passing test pattern.
    let sawFail = false, sawEdit = false;
    for (const e of events.slice(0, -1)) {
      if (e.kind === 'test' && e.failed) sawFail = true;
      if (sawFail && e.kind === 'edit') sawEdit = true;
    }
    if (sawFail && sawEdit) {
      result = {
        type: 'bugfix',
        confidence: 0.8,
        body: buildBody({
          why: recentUserPrompt(),
          what: `Test sequence: previously failing → edit → now passing. Command: ${cmd.slice(0, 200)}`,
          searchTags: ['bugfix', 'test-recovery', ...extractEntitiesFromCmd(cmd)],
          output: tailLines(output, 12),
        }),
        tags: ['bash', 'test', 'bugfix', 'auto-promoted'],
      };
    }
  }

  if (!result && trace) {
    result = {
      type: 'discovery',
      confidence: 0.65,
      body: buildBody({
        why: recentUserPrompt(),
        what: `Command produced an error stack trace. Command: ${cmd.slice(0, 200)}`,
        searchTags: ['discovery', 'stack-trace', ...extractEntitiesFromCmd(cmd)],
        output: tailLines(output, 18),
      }),
      tags: ['bash', 'discovery', 'auto-promoted', 'stack-trace'],
    };
  }

  if (!result) {
    // Feature signal: prior prompt has add/implement verb + recent Write of a new file + a test ran.
    const prompt = recentUserPrompt();
    const promptHasFeatureVerb = FEATURE_VERBS.test(prompt);
    const recentWriteNew = events.some((e) => e.kind === 'edit' && e.newFile);
    if (promptHasFeatureVerb && recentWriteNew && kind.isTest) {
      const m = prompt.match(NOUN_AFTER);
      result = {
        type: 'feature',
        confidence: 0.7,
        body: buildBody({
          why: prompt,
          what: `Tests run after creating a new file. Subject: ${m ? m[1] : 'unknown'}`,
          searchTags: ['feature', m ? m[1] : null, ...extractEntitiesFromCmd(cmd)].filter(Boolean),
          output: tailLines(output, 6),
        }),
        tags: ['bash', 'feature', 'auto-promoted'],
      };
    }
  }

  saveState(state);
  if (result && opts.minConfidence != null && result.confidence < opts.minConfidence) return null;
  if (result) bumpStatsAndSave(result.type);
  return result;
}

/**
 * Promote an Edit/Write capture. Returns { type, body, tags, confidence } or null.
 */
function promoteFromEdit(payload, opts = {}) {
  const tool = (payload && (payload.tool_name || payload.tool)) || '';
  const ti = (payload && (payload.tool_input || payload.input)) || {};
  const file = ti.file_path || ti.notebook_path || '';
  if (!file) return null;

  const sid = (payload && payload.session_id) || 'default';
  const now = Date.now();
  const state = loadState();
  pruneOld(state, now);
  state.sessions[sid] = state.sessions[sid] || { events: [] };
  const events = state.sessions[sid].events;

  const isWrite = tool === 'Write';
  let isNewFile = false;
  if (isWrite) {
    try {
      const stat = fs.statSync(file);
      // Heuristic: file mtime within 5s of now ⇒ likely newly created by this Write.
      isNewFile = (now - stat.mtimeMs) < 5000 && (now - stat.birthtimeMs) < 5000;
    } catch { isNewFile = true; }
  }

  events.push({
    ts: now,
    kind: 'edit',
    file,
    tool,
    newFile: isNewFile,
  });

  let result = null;
  const lcFile = file.toLowerCase();

  // Test file recovery: edit to a *.test.* file after a recent test failure.
  if (/\.test\.|_test\.|tests?[\\/]/.test(lcFile)) {
    const sawTestFail = events.some((e) => e.kind === 'test' && e.failed);
    if (sawTestFail) {
      result = {
        type: 'bugfix',
        confidence: 0.7,
        body: buildBody({
          why: recentUserPrompt(),
          what: `Edited test file ${file} after recent test failure.`,
          searchTags: ['bugfix', 'test', path.basename(file)],
        }),
        tags: ['edit', 'bugfix', 'test', 'auto-promoted'],
      };
    }
  }

  // Feature: NEW file in src/ lib/ app/ packages/ with a function/class def.
  if (!result && isNewFile && /(^|[\\/])(src|lib|app|packages|components|server)[\\/]/i.test(file)) {
    let body = '';
    try { body = String(ti.content || '').slice(0, 400); } catch {}
    if (/\b(function|class|def |const \w+\s*=\s*\(|export\s+(async\s+)?function|module\.exports)/.test(body)) {
      result = {
        type: 'feature',
        confidence: 0.65,
        body: buildBody({
          why: recentUserPrompt(),
          what: `Created new module ${file}.`,
          searchTags: ['feature', path.basename(file).replace(/\.[A-Za-z0-9]+$/, '')],
        }),
        tags: ['write', 'feature', 'auto-promoted'],
      };
    }
  }

  // Refactor: 3+ edits to the same file in <10 minutes with no test failures between.
  if (!result) {
    const sameFile = events.filter((e) => e.kind === 'edit' && e.file === file);
    const tenMinAgo = now - 10 * 60 * 1000;
    const recentSame = sameFile.filter((e) => e.ts >= tenMinAgo);
    const failuresBetween = events.some((e) => e.kind === 'test' && e.failed && e.ts >= tenMinAgo);
    if (recentSame.length >= 3 && !failuresBetween) {
      result = {
        type: 'refactor',
        confidence: 0.6,
        body: buildBody({
          why: recentUserPrompt(),
          what: `${recentSame.length} consecutive edits to ${file} within 10 minutes with no test failures.`,
          searchTags: ['refactor', path.basename(file)],
        }),
        tags: ['edit', 'refactor', 'auto-promoted'],
      };
    }
  }

  saveState(state);
  if (result && opts.minConfidence != null && result.confidence < opts.minConfidence) return null;
  if (result) bumpStatsAndSave(result.type);
  return result;
}

function bumpStatsAndSave(type) {
  const s = loadState();
  bumpStats(s, type);
  saveState(s);
}

function extractEntitiesFromCmd(cmd) {
  const out = [];
  const m = String(cmd).match(/[A-Za-z_][\w./-]{3,}/g) || [];
  for (const t of m.slice(0, 6)) out.push(t);
  return out;
}

function tailLines(s, n) {
  const lines = String(s || '').split(/\r?\n/);
  return lines.slice(-n).join('\n');
}

function buildBody({ why, what, searchTags, output }) {
  const lines = [];
  if (why) lines.push('WHY: ' + String(why).slice(0, 240));
  if (what) lines.push('WHAT: ' + what);
  if (searchTags && searchTags.length) {
    lines.push('FOR-LATER-SEARCH: ' + Array.from(new Set(searchTags.filter(Boolean))).join(', '));
  }
  if (output) {
    lines.push('---');
    lines.push(output);
  }
  return lines.join('\n');
}

module.exports = {
  promoteFromBash,
  promoteFromEdit,
  getStatsSummary,
  // Exposed for tests:
  _internal: { loadState, saveState, statePath, classifyBashCommand, detectFailure, detectPass },
};
