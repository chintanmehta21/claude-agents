#!/usr/bin/env node
// test-extractor.js — assertions for prefetch.extractQueryStructured.
'use strict';

const path = require('path');
const { extractQueryStructured } = require(path.join('..', 'server', 'prefetch.js'));

let pass = 0, fail = 0;
function assertSet(label, prompt, expected, opts = {}) {
  const got = extractQueryStructured(prompt).terms.map((t) => t.toLowerCase());
  const exp = expected.map((t) => t.toLowerCase());
  let ok;
  if (opts.exact || expected.length === 0) ok = got.length === exp.length && exp.every((t) => got.includes(t));
  else ok = exp.every((t) => got.includes(t));
  // No-noise check: ensure no obvious filler leaked in.
  const filler = ['the','please','still','ffs','where','did','we','show','implement'];
  const leaked = got.filter((t) => filler.includes(t));
  if (ok && leaked.length === 0) { pass++; console.log('  PASS ' + label + '  -> ' + JSON.stringify(got)); }
  else { fail++; console.log('  FAIL ' + label + '\n    expected (subset): ' + JSON.stringify(exp) + '\n    got:               ' + JSON.stringify(got) + (leaked.length ? '\n    leaked filler:     ' + JSON.stringify(leaked) : '')); }
}

console.log('extractor tests');

assertSet(
  'auth bug question',
  'where did we handle the auth bug?',
  ['auth']    // "bug" is conversational filler; "handle" is too; "auth" passes via fallback long-word path? auth is 4 chars >=4 — but not capital, length 4, threshold >5. Actually we'd want auth here.
);

assertSet(
  'apostrophe text_polish',
  'fix Apostrophes mis-detected as quotes in text_polish',
  ['text_polish', 'Apostrophes', 'mis-detected', 'quotes']
);

assertSet(
  'empty for low-signal rant',
  'still not fixed FFS',
  []
);

assertSet(
  'function call',
  'show me load_config()',
  ['load_config']
);

assertSet(
  'feature noun phrase',
  'implement the registry hydration',
  ['registry', 'hydration']
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
