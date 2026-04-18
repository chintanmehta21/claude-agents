#!/usr/bin/env node
// bootstrap-grammars.js — copy pre-built WASM grammars into server/grammars/.
// Run automatically on `npm install` (postinstall), or manually:
//   node scripts/bootstrap-grammars.js
//
// Source: `tree-sitter-wasms` npm package (pre-compiled, no C toolchain required).
// Safe to re-run; it's idempotent.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'server', 'grammars');

// Languages we guarantee to ship.  Add more here as needed; anything available
// in tree-sitter-wasms will be copied automatically below.
const REQUIRED = [
  'python', 'javascript', 'typescript', 'tsx',
  'go', 'rust', 'java',
  'c', 'cpp', 'c_sharp',
  'ruby', 'php',
  'json', 'yaml', 'toml',
  'html', 'css', 'bash', 'markdown',
];

function main() {
  fs.mkdirSync(DEST, { recursive: true });

  let srcDir;
  try {
    // Resolve the installed tree-sitter-wasms output directory.
    const pkgJson = require.resolve('tree-sitter-wasms/package.json', { paths: [ROOT] });
    srcDir = path.join(path.dirname(pkgJson), 'out');
  } catch (e) {
    console.error('[mem-vault] tree-sitter-wasms not installed. Run `npm install` in ' + ROOT);
    process.exit(1);
  }

  if (!fs.existsSync(srcDir)) {
    console.error('[mem-vault] Expected ' + srcDir + ' to exist.');
    process.exit(1);
  }

  // Copy all .wasm files we find, plus the web-tree-sitter runtime wasm.
  const entries = fs.readdirSync(srcDir);
  let copied = 0;
  for (const f of entries) {
    if (!f.endsWith('.wasm')) continue;
    const src = path.join(srcDir, f);
    const dst = path.join(DEST, f);
    try {
      fs.copyFileSync(src, dst);
      copied++;
    } catch (err) {
      console.warn('[mem-vault] Failed to copy ' + f + ': ' + err.message);
    }
  }

  // Verify required grammars landed.
  const missing = REQUIRED.filter((l) => !fs.existsSync(path.join(DEST, `tree-sitter-${l}.wasm`)));
  if (missing.length) {
    console.warn('[mem-vault] Missing grammars (non-fatal, will fall back to node_modules): ' + missing.join(', '));
  }

  console.log(`[mem-vault] Bootstrapped ${copied} grammar(s) into ${DEST}`);
}

try {
  main();
} catch (e) {
  // Never fail the install — smart_* tools will simply return a helpful error until fixed.
  console.warn('[mem-vault] bootstrap-grammars soft-failed: ' + e.message);
}
