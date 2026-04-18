#!/usr/bin/env node
// smoke-test.js — end-to-end sanity check without needing an MCP client.
// Run: `node scripts/smoke-test.js` after `npm install`.
'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

process.env.MEM_VAULT_DATA_DIR = path.join(os.tmpdir(), 'mem-vault-smoke-' + Date.now());
process.env.MEM_VAULT_ROOT = path.resolve(__dirname, '..');

const db = require('../server/db');
const paths = require('../server/paths');
const capture = require('../server/capture');

const cwd = process.env.MEM_VAULT_ROOT; // use plugin dir as the "project" under test

function ok(label) { console.log('  ✓ ' + label); }
function fail(label, err) { console.error('  ✗ ' + label + ' — ' + (err.message || err)); process.exitCode = 1; }

(async () => {
  console.log('mem-vault smoke test');
  console.log('  data dir: ' + process.env.MEM_VAULT_DATA_DIR);

  // 1. Open + schema
  let d;
  try {
    d = db.open(cwd);
    ok('open vault');
  } catch (e) { return fail('open vault', e); }

  // 2. Session + observation
  try {
    const sid = db.startSession(d, { client: 'smoke', cwd });
    const id = db.saveObservation(d, { session_id: sid, title: 'smoke obs', body: 'hello world', type: 'note', tags: ['smoke'] });
    ok('save observation (' + id + ')');
  } catch (e) { return fail('save observation', e); }

  // 3. Search
  try {
    const rows = db.search(d, { query: 'hello', limit: 5 });
    if (rows.length < 1) throw new Error('expected >=1 search hit');
    ok('FTS5 search returned ' + rows.length);
  } catch (e) { return fail('search', e); }

  // 4. Capture logic
  try {
    const obs = capture.fromToolUse({
      tool_name: 'Edit',
      tool_input: { file_path: 'C:\\test\\foo.py', old_string: 'a', new_string: 'b' },
    });
    if (!obs || obs.type !== 'change') throw new Error('capture failed');
    ok('capture.fromToolUse for Edit');
  } catch (e) { return fail('capture', e); }

  // 5. Parser — only if WASM available
  try {
    const parsers = require('../server/parsers');
    const hasPython = !!parsers.findGrammarWasm('python');
    if (!hasPython) {
      console.log('  ~ skipping parser test (run scripts/bootstrap-grammars.js first)');
    } else {
      const src = 'def hello():\n    return 1\n\nclass Foo:\n    def bar(self):\n        pass\n';
      const { symbols } = await parsers.outlineSource(src, 'python');
      if (symbols.length < 2) throw new Error('expected >=2 symbols, got ' + symbols.length);
      ok('outline python source (' + symbols.length + ' symbols)');
    }
  } catch (e) { return fail('parser', e); }

  // 6. Stats
  try {
    const s = db.stats(d);
    ok('stats: ' + JSON.stringify(s));
  } catch (e) { return fail('stats', e); }

  console.log('DONE.');
})();
