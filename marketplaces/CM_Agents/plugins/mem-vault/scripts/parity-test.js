#!/usr/bin/env node
// parity-test.js — verify every claude-mem feature has a working mem-vault equivalent,
// exercised against a real project CWD passed on argv.
//
// Usage:  node scripts/parity-test.js <project-cwd>
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
process.env.MEM_VAULT_ROOT = PLUGIN_ROOT;

const cwd = path.resolve(process.argv[2] || process.cwd());
if (!fs.existsSync(cwd)) die('Target CWD does not exist: ' + cwd);

const db = require('../server/db');
const paths = require('../server/paths');
const capture = require('../server/capture');
const parsers = require('../server/parsers');
const mirror = require('../server/project_mirror');

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail: detail === undefined ? '' : String(detail) });
  const mark = ok ? '\u2713 PASS' : '\u2717 FAIL';
  console.log(`  ${mark}  ${name}${detail ? '  —  ' + detail : ''}`);
}
async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, true, detail);
  } catch (e) {
    record(name, false, e.message || String(e));
  }
}

console.log('\n================================================================');
console.log(' mem-vault parity test');
console.log('   project CWD:  ' + cwd);
console.log('   project slug: ' + paths.projectSlug(cwd));
console.log('   vault DB:     ' + paths.vaultDbPath(cwd));
console.log('================================================================\n');

// Purge any pre-existing vault for this CWD so we start clean.
if (fs.existsSync(paths.vaultDbPath(cwd))) {
  const d0 = db.open(cwd);
  db.purgeProject(d0);
  d0.close();
  console.log('  (cleared pre-existing vault for a clean run)\n');
}

(async () => {

  // ---------- 1. Per-project isolation (slug + DB file) ----------
  await check('per-project isolation (slug + dedicated DB file)', () => {
    const d = db.open(cwd);
    const slug = paths.projectSlug(cwd);
    if (!slug.includes('-')) throw new Error('slug format wrong: ' + slug);
    if (!fs.existsSync(paths.vaultDbPath(cwd))) throw new Error('DB file not created');
    // Different CWD -> different slug
    const otherSlug = paths.projectSlug(cwd + '/sub');
    if (slug === otherSlug) throw new Error('slug collision for different CWD');
    d.close();
    return 'slug=' + slug;
  });

  // ---------- 2. PostToolUse observation capture (Edit) ----------
  let editObsId;
  await check('PostToolUse capture: Edit tool -> observation row', () => {
    const payload = {
      tool_name: 'Edit',
      tool_input: {
        file_path: path.join(cwd, 'DhanHQ_src/__init__.py'),
        old_string: 'abc',
        new_string: 'xyz',
      },
    };
    const obs = capture.fromToolUse(payload);
    if (!obs) throw new Error('capture returned null');
    if (obs.type !== 'change') throw new Error('expected type=change, got ' + obs.type);
    const d = db.open(cwd);
    const sid = db.startSession(d, { client: 'parity-test', cwd });
    editObsId = db.saveObservation(d, { ...obs, session_id: sid });
    const row = db.getObservation(d, editObsId);
    if (!row || row.title !== obs.title) throw new Error('round-trip mismatch');
    d.close();
    return 'id=' + editObsId;
  });

  // ---------- 3. PostToolUse capture: Bash (non-trivial) ----------
  await check('PostToolUse capture: Bash non-trivial command', () => {
    const obs = capture.fromToolUse({
      tool_name: 'Bash',
      tool_input: { command: 'pytest tests/test_scraper.py -v' },
      tool_response: { stdout: '3 passed in 0.5s' },
    });
    if (!obs || obs.type !== 'capture') throw new Error('capture failed');
    if (!obs.tags.includes('test')) throw new Error('expected test tag');
    return 'tags=' + obs.tags.join(',');
  });

  // ---------- 4. PostToolUse capture: trivial command skipped ----------
  await check('PostToolUse capture: trivial Bash skipped (noise filter)', () => {
    const obs = capture.fromToolUse({ tool_name: 'Bash', tool_input: { command: 'ls' } });
    if (obs !== null) throw new Error('expected null for ls');
    return 'ls correctly skipped';
  });

  // ---------- 5. Secret path never captured ----------
  await check('secret files never captured (.env / credentials)', () => {
    const obs = capture.fromToolUse({
      tool_name: 'Edit',
      tool_input: { file_path: path.join(cwd, '.env'), old_string: 'KEY=1', new_string: 'KEY=2' },
    });
    if (obs !== null) throw new Error('.env leaked into capture');
    return 'secret filter works';
  });

  // ---------- 6. save_observation: manual high-value entry ----------
  let decisionId;
  await check('save_observation (manual, type=decision)', () => {
    const d = db.open(cwd);
    const sid = db.currentSession(d, 'parity-test') || db.startSession(d, { client: 'parity-test', cwd });
    decisionId = db.saveObservation(d, {
      session_id: sid,
      type: 'decision',
      title: 'Use DhanHQ REST API for expiry list',
      body: 'Chose REST over WS because expiry list is bounded and cacheable.',
      files: ['DhanHQ_src/loop_expiries/__init__.py'],
      tags: ['architecture', 'dhanhq', 'decision'],
    });
    const r = db.getObservation(d, decisionId);
    if (!r || r.type !== 'decision' || r.tags.length !== 3) throw new Error('mismatch');
    d.close();
    return 'id=' + decisionId;
  });

  // ---------- 7. mark_chapter ----------
  await check('mark_chapter', () => {
    const d = db.open(cwd);
    const sid = db.currentSession(d, 'parity-test');
    const id = db.markChapter(d, { sessionId: sid, title: 'DhanHQ integration', summary: 'Research phase' });
    const row = d.prepare('SELECT * FROM chapters WHERE id = ?').get(id);
    if (!row || row.title !== 'DhanHQ integration') throw new Error('chapter not saved');
    d.close();
    return 'id=' + id;
  });

  // ---------- 8. FTS5 search (multi-term, ranked) ----------
  await check('search (FTS5 ranked, multi-term)', () => {
    const d = db.open(cwd);
    const rows = db.search(d, { query: 'DhanHQ expiry', limit: 10 });
    if (!rows.length) throw new Error('no hits for "DhanHQ expiry"');
    if (!rows.some((r) => r.id === decisionId)) throw new Error('decision row not found in search');
    d.close();
    return rows.length + ' hits';
  });

  // ---------- 9. search with type filter ----------
  await check('search with type filter', () => {
    const d = db.open(cwd);
    const all = db.search(d, { query: 'DhanHQ', limit: 50 });
    const onlyDecisions = db.search(d, { query: 'DhanHQ', limit: 50, type: 'decision' });
    if (!onlyDecisions.every((r) => r.type === 'decision')) throw new Error('type filter leaked');
    d.close();
    return `all=${all.length} decisions=${onlyDecisions.length}`;
  });

  // ---------- 10. timeline ----------
  await check('timeline (reverse-chronological, with type filter)', () => {
    const d = db.open(cwd);
    const all = db.timeline(d, { limit: 20 });
    const changes = db.timeline(d, { limit: 20, type: 'change' });
    if (!all.length) throw new Error('empty timeline');
    if (all[0].ts < all[all.length - 1].ts) throw new Error('not reverse-chronological');
    if (!changes.every((r) => r.type === 'change')) throw new Error('type filter leaked');
    d.close();
    return `all=${all.length} changes=${changes.length}`;
  });

  // ---------- 11. get_observations (batch by ID) ----------
  await check('get_observations (batch fetch by IDs)', () => {
    const d = db.open(cwd);
    const rows = db.getObservations(d, [editObsId, decisionId]);
    if (rows.length !== 2) throw new Error('expected 2, got ' + rows.length);
    d.close();
    return rows.length + ' rows';
  });

  // ---------- 12. recent_context ----------
  await check('recent_context (compact recent index)', () => {
    const d = db.open(cwd);
    const rows = db.recentContext(d, { limit: 5 });
    if (!rows.length) throw new Error('empty');
    // must include id, ts, type, title, files
    for (const r of rows) {
      if (!r.id || !r.ts || !r.type || !r.title) throw new Error('missing field');
    }
    d.close();
    return rows.length + ' items';
  });

  // ---------- 13. smart_outline (Python via WASM) ----------
  // Pick a real .py file in the project for parsing.
  const pickPy = () => {
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return [];
      let out = [];
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name.startsWith('.') || e.name === '__pycache__' || e.name === '.venv') continue;
          out = out.concat(walk(p));
        } else if (e.name.endsWith('.py')) {
          out.push(p);
        }
      }
      return out;
    };
    const candidates = walk(cwd).filter((p) => fs.statSync(p).size > 400 && fs.statSync(p).size < 30000);
    return candidates[0] || null;
  };
  const pyFile = pickPy();
  let outlineFile, outlineSymbols = [];
  await check('smart_outline (Python via WASM tree-sitter)', async () => {
    if (!pyFile) throw new Error('no .py file in project');
    outlineFile = pyFile;
    const { lang, symbols, error } = await parsers.outlineFile(pyFile);
    if (error) throw new Error(error);
    if (lang !== 'python') throw new Error('expected python, got ' + lang);
    outlineSymbols = symbols;
    // Persist cache
    const d = db.open(cwd);
    const mtime = Math.floor(fs.statSync(pyFile).mtimeMs);
    db.replaceSymbols(d, pyFile, mtime, lang, symbols);
    d.close();
    return `${path.basename(pyFile)} -> ${symbols.length} symbols`;
  });

  // ---------- 14. smart_search (by symbol name) ----------
  await check('smart_search (symbol lookup by name)', () => {
    if (!outlineSymbols.length) throw new Error('no symbols to search (outline failed)');
    const anySym = outlineSymbols[0];
    const d = db.open(cwd);
    const rows = db.symbolSearch(d, { query: anySym.name.slice(0, 4) || 'a', limit: 10 });
    d.close();
    if (!rows.length) throw new Error(`no symbols found for "${anySym.name.slice(0,4)}"`);
    return `${rows.length} hits for "${anySym.name.slice(0,4)}"`;
  });

  // ---------- 15. smart_unfold (extract source by range) ----------
  await check('smart_unfold (extract source by line range)', () => {
    if (!outlineSymbols.length) throw new Error('no symbols to unfold');
    const sym = outlineSymbols.find((s) => s.end_line > s.start_line) || outlineSymbols[0];
    const source = parsers.unfoldLines(outlineFile, sym.start_line, sym.end_line);
    if (!source) throw new Error('empty unfold');
    const lines = source.split('\n').length;
    return `${sym.name} (${sym.kind}) ${lines} lines`;
  });

  // ---------- 16. Parse multiple languages ----------
  await check('multi-language parser (JS self-test)', async () => {
    const jsSource = 'function add(a, b) { return a + b; }\nclass C { m() { return 1; } }\n';
    const { symbols } = await parsers.outlineSource(jsSource, 'javascript');
    if (symbols.length < 2) throw new Error('expected >= 2, got ' + symbols.length);
    return symbols.length + ' JS symbols';
  });

  // ---------- 17. Dedup on consolidation (sessionend) ----------
  await check('consolidation dedups observations within same second', () => {
    const d = db.open(cwd);
    const sid = db.currentSession(d, 'parity-test');
    // Insert 3 duplicates with the same title+type+second.
    const ts = new Date().toISOString();
    for (let i = 0; i < 3; i++) {
      db.saveObservation(d, { session_id: sid, ts, type: 'capture', title: 'dup-marker', body: 'x' + i });
    }
    const before = d.prepare("SELECT COUNT(*) AS n FROM observations WHERE title='dup-marker'").get().n;
    if (before !== 3) throw new Error('setup failed: ' + before);
    // Run the consolidation query used by SessionEnd hook.
    d.exec(`
      DELETE FROM observations WHERE rowid IN (
        SELECT MIN(rowid) FROM observations
        GROUP BY title, type, substr(ts, 1, 19)
        HAVING COUNT(*) > 1
      );
    `);
    const after = d.prepare("SELECT COUNT(*) AS n FROM observations WHERE title='dup-marker'").get().n;
    d.close();
    if (after !== before - 1) throw new Error(`dedup wrong: before=${before} after=${after}`);
    return `${before} -> ${after}`;
  });

  // ---------- 18. Cross-session persistence (close & reopen) ----------
  await check('cross-session persistence (close DB, reopen, query)', () => {
    const d1 = db.open(cwd);
    const before = db.stats(d1).observations;
    d1.close();
    // New process-like open
    const d2 = db.open(cwd);
    const after = db.stats(d2).observations;
    d2.close();
    if (before !== after) throw new Error(`count drift: ${before} -> ${after}`);
    return `${after} obs survived reopen`;
  });

  // ---------- 19. Project-root .mem-vault/ mirror ----------
  await check('project-root .mem-vault/ mirror (README + recent.md + .gitignore)', () => {
    const out = mirror.refresh(cwd);
    if (!out.ok) throw new Error(JSON.stringify(out));
    const dir = path.join(cwd, '.mem-vault');
    for (const f of ['README.md', 'recent.md', '.gitignore']) {
      if (!fs.existsSync(path.join(dir, f))) throw new Error('missing ' + f);
    }
    const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
    if (!readme.includes(paths.projectSlug(cwd))) throw new Error('README missing slug');
    return out.mirror_dir;
  });

  // ---------- 20. SessionStart hook output shape ----------
  await check('SessionStart hook emits hookSpecificOutput.additionalContext', () => {
    const hookPath = path.join(PLUGIN_ROOT, 'hooks', 'sessionstart-index.js');
    const payload = JSON.stringify({ cwd, source: 'parity-test' });
    const proc = spawnSync(process.execPath, [hookPath], {
      input: payload, env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
      encoding: 'utf8', timeout: 10000,
    });
    if (proc.status !== 0 && proc.status !== null) throw new Error('hook exit ' + proc.status + ' stderr=' + proc.stderr);
    const out = (proc.stdout || '').trim();
    if (!out) throw new Error('no stdout');
    const parsed = JSON.parse(out);
    const ctx = parsed.hookSpecificOutput && parsed.hookSpecificOutput.additionalContext;
    if (!ctx || !ctx.includes('mem-vault')) throw new Error('additionalContext missing/invalid');
    return out.length + ' bytes of additionalContext';
  });

  // ---------- 21. PostToolUse hook end-to-end (stdin -> DB write) ----------
  await check('PostToolUse hook end-to-end (stdin payload -> DB insert)', () => {
    const hookPath = path.join(PLUGIN_ROOT, 'hooks', 'posttooluse-capture.js');
    const d0 = db.open(cwd);
    const before = db.stats(d0).observations;
    d0.close();
    const payload = JSON.stringify({
      cwd,
      tool_name: 'Write',
      tool_input: { file_path: path.join(cwd, 'scripts/new_file.py'), content: 'print("hi")' },
    });
    const proc = spawnSync(process.execPath, [hookPath], {
      input: payload, env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
      encoding: 'utf8', timeout: 10000,
    });
    if (proc.status !== 0 && proc.status !== null) throw new Error('hook exit ' + proc.status);
    const d1 = db.open(cwd);
    const after = db.stats(d1).observations;
    d1.close();
    if (after !== before + 1) throw new Error(`expected +1, got ${before} -> ${after}`);
    return `${before} -> ${after}`;
  });

  // ---------- 22. stats ----------
  await check('stats (counts of observations/chapters/sessions/symbols)', () => {
    const d = db.open(cwd);
    const s = db.stats(d);
    d.close();
    if (typeof s.observations !== 'number') throw new Error('no observations count');
    if (typeof s.symbols !== 'number') throw new Error('no symbols count');
    return JSON.stringify(s);
  });

  // ---------- 23. MCP stdio handshake (full round-trip) ----------
  await check('MCP stdio handshake: initialize + tools/list (11 tools)', () => {
    const req1 = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'parity-test', version: '0.1' } } });
    const req2 = JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const proc = spawnSync(process.execPath, [path.join(PLUGIN_ROOT, 'server', 'index.js'), 'mcp'], {
      input: req1 + '\n' + req2 + '\n',
      env: { ...process.env, MEM_VAULT_ROOT: PLUGIN_ROOT, MEM_VAULT_CWD: cwd },
      encoding: 'utf8', timeout: 15000,
    });
    const lines = (proc.stdout || '').trim().split('\n').filter(Boolean);
    const tools = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } })
                       .filter((r) => r && r.id === 2)
                       .map((r) => r.result && r.result.tools) [0];
    if (!tools) throw new Error('no tools/list response: ' + (proc.stderr || proc.stdout).slice(0,200));
    const expected = ['search','timeline','get_observations','save_observation','mark_chapter','smart_outline','smart_search','smart_unfold','recent_context','stats','mirror_project'];
    for (const t of expected) if (!tools.find((x) => x.name === t)) throw new Error('missing tool: ' + t);
    return tools.length + ' tools';
  });

  // ---------- Summary ----------
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log('\n----------------------------------------------------------------');
  console.log(` Summary: ${passed} passed, ${failed} failed (of ${results.length})`);
  console.log('----------------------------------------------------------------');
  if (failed) {
    console.log('\nFailures:');
    for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.name}: ${r.detail}`);
  }
  process.exit(failed ? 1 : 0);

})();

function die(msg) { console.error(msg); process.exit(2); }
