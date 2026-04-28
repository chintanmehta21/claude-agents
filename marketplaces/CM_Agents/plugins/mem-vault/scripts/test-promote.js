#!/usr/bin/env node
// test-promote.js — simulate failing-test → edit → passing-test sequence and
// confirm the final test capture is promoted to `bugfix`.
'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

process.env.MEM_VAULT_DATA_DIR = path.join(os.tmpdir(), 'mem-vault-promote-' + Date.now());
process.env.MEM_VAULT_ROOT = path.resolve(__dirname, '..');

const db = require(path.join('..', 'server', 'db.js'));
const promote = require(path.join('..', 'server', 'promote.js'));
const capture = require(path.join('..', 'server', 'capture.js'));

const cwd = process.env.MEM_VAULT_ROOT;
const _d = db.open(cwd);
const sid = db.startSession(_d, { client: 'test', cwd, id: 'test-session-' + Date.now() });

function fire(tool, payload) {
  const enriched = { ...payload, tool_name: tool, session_id: sid };
  const obs = capture.fromToolUse(enriched);
  if (!obs) return null;
  const d = db.open(cwd);
  const obsId = db.saveObservation(d, { ...obs, session_id: sid });
  let p = null;
  if (tool === 'Bash') p = promote.promoteFromBash(enriched, { minConfidence: 0.5 });
  else p = promote.promoteFromEdit(enriched, { minConfidence: 0.5 });
  if (p && p.type) {
    const newTags = Array.from(new Set([...(obs.tags || []), ...(p.tags || [])]));
    db.updateObservation(d, obsId, { type: p.type, body: p.body, tags: newTags });
  }
  return { id: obsId, promoted: p };
}

(async () => {
  console.log('promotion test: failing-test → edit → passing-test');
  // 1. failing test
  const r1 = fire('Bash', {
    tool_input: { command: 'pytest tests/test_thing.py' },
    tool_response: { stdout: '1 failed\nFAILED tests/test_thing.py::test_x - AssertionError', stderr: '' },
  });
  console.log('  1. failing test  -> promoted:', r1.promoted ? r1.promoted.type : 'no');

  // 2. edit fix
  const r2 = fire('Edit', {
    tool_input: { file_path: 'C:\\test\\thing.py', old_string: 'return 0', new_string: 'return 1' },
    tool_response: {},
  });
  console.log('  2. edit fix      -> promoted:', r2 && r2.promoted ? r2.promoted.type : 'no');

  // 3. passing test
  const r3 = fire('Bash', {
    tool_input: { command: 'pytest tests/test_thing.py' },
    tool_response: { stdout: '1 passed in 0.04s', stderr: '' },
  });
  console.log('  3. passing test  -> promoted:', r3.promoted ? r3.promoted.type : 'no');

  const d = db.open(cwd);
  const o = db.getObservation(d, r3.id);
  console.log('  final observation type:', o.type);
  console.log('  body:', String(o.body || '').split('\n').slice(0, 6).join('\n  '));
  if (o.type !== 'bugfix') { console.error('FAIL: expected bugfix'); process.exit(1); }
  console.log('PASS');
})();
