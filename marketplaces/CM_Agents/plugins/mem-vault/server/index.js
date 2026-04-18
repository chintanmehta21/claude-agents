#!/usr/bin/env node
// index.js — single entrypoint.  Dispatches to MCP stdio server or CLI.
//
//   node server/index.js mcp                  -> runs MCP stdio server
//   node server/index.js <cli-cmd> [args...]  -> CLI (status, save, search, ...)
'use strict';

const argv = process.argv.slice(2);
const mode = argv[0] || 'help';

(async () => {
  try {
    if (mode === 'mcp') {
      const mcp = require('./mcp');
      await mcp.run();
      return;
    }
    const cli = require('./cli');
    await cli.run(argv);
  } catch (err) {
    process.stderr.write('[mem-vault] fatal: ' + (err && err.stack || err) + '\n');
    process.exit(1);
  }
})();
