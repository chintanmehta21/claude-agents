// mcp.js — Model Context Protocol server exposing mem-vault tools over stdio.
// Uses @modelcontextprotocol/sdk.  Cross-client: same contract for CC, CC CLI, Codex.
'use strict';

const path = require('path');
const fs = require('fs');

const db = require('./db');
const parsers = require('./parsers');
const paths = require('./paths');
const mirror = require('./project_mirror');
const { loadSettings } = require('./settings');
const dashboardDaemon = require('./dashboard_daemon');

const DISABLED_RESULT = {
  disabled: true,
  message: 'mem-vault is disabled for this project (set `enabled: true` in .claude/mem-vault.local.md to re-enable).',
};

function detectClient() {
  // Best-effort: Codex sets CODEX_* env; CC sets CLAUDE_* env.
  if (process.env.CODEX_SESSION || process.env.CODEX_MODE) return 'codex';
  if (process.env.CLAUDECODE || process.env.CLAUDE_CODE_ENTRYPOINT) return 'claude-code';
  return process.env.MEM_VAULT_CLIENT || 'mcp';
}

/** Entrypoint for `node server/index.js mcp`. */
async function run() {
  // Load MCP SDK lazily — if missing, explain.
  let sdk;
  try {
    sdk = require('@modelcontextprotocol/sdk/server/index.js');
  } catch (e) {
    die(
      'mem-vault: @modelcontextprotocol/sdk not installed.\n' +
        'Run `npm install --prefix "' + paths.pluginRoot() + '"` once, then restart the client.'
    );
    return;
  }
  const { Server } = sdk;
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
  const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
  } = require('@modelcontextprotocol/sdk/types.js');

  // Initial cwd resolution at server startup (may be overridden per-request when
  // a tool call carries a file path).  Resolution order:
  //   1. explicit MEM_VAULT_CWD env override (test mode / power users)
  //   2. project root walked up from process.cwd() — handles the common case
  //      where Codex spawns the MCP child from the dir the user launched
  //      `codex` in (project root or somewhere inside it).
  //   3. raw process.cwd() last resort.
  const startupCwd = process.env.MEM_VAULT_CWD
    ? path.resolve(process.env.MEM_VAULT_CWD)
    : paths.findProjectRoot(process.cwd());
  let cwd = startupCwd;
  const client = detectClient();

  // Load settings once at server startup. The `enabled` kill switch makes every
  // tool call short-circuit to a friendly disabled message — we never touch the DB.
  const settings = loadSettings(cwd);

  // Resolve / lazily create the per-project .mem-vault/ dir at startup.
  // Each tool/resource handler also calls ensureProjectVault (cached) so a
  // long-running MCP process picks up dir creation done after startup.
  function ensureVault(forCwd) {
    if (settings.enabled === false) return;
    try { paths.ensureProjectVault(forCwd || cwd, { settings }); } catch {}
  }
  ensureVault();
  // Hydrate the project registry from the legacy global tree once at startup
  // (back-compat for vaults predating the registry; also retires stale globals).
  try { paths.hydrateRegistry(); } catch {}
  // Kick the 24x7 dashboard daemon at MCP startup. Fire-and-forget.
  try { dashboardDaemon.ensureDashboardRunningAsync({ cwd }); } catch {}

  // Open DB + start session lazily, cached per resolved project cwd.  This lets
  // a single MCP server process serve multiple project vaults if the user
  // touches files in different projects from the same Codex session.
  const _dbByCwd = new Map(); // cwd → { db, sessionId }
  function getDb(forCwd) {
    const key = paths.normalizeCwd(forCwd || cwd);
    let entry = _dbByCwd.get(key);
    if (entry) return entry;
    const opened = db.open(forCwd || cwd);
    const sid = db.startSession(opened, { client, cwd: forCwd || cwd });
    entry = { db: opened, sessionId: sid };
    _dbByCwd.set(key, entry);
    return entry;
  }

  /**
   * Resolve the effective project cwd for an incoming tool call.  Inspect tool
   * params for any file/path hint and walk up from there to a project root —
   * this is the most reliable signal when the MCP child was spawned from a
   * non-project directory (e.g. user's home).
   */
  function resolveCwdForCall(toolName, args) {
    if (process.env.MEM_VAULT_CWD) return path.resolve(process.env.MEM_VAULT_CWD);
    const hint = extractPathHint(args);
    if (hint) {
      try {
        const abs = path.isAbsolute(hint) ? hint : path.resolve(cwd, hint);
        const dir = fs.existsSync(abs) && fs.statSync(abs).isDirectory()
          ? abs
          : path.dirname(abs);
        const root = paths.findProjectRoot(dir);
        if (root) return root;
      } catch { /* fall through */ }
    }
    return cwd;
  }

  function extractPathHint(args) {
    if (!args || typeof args !== 'object') return null;
    // Common shapes across our tool registry: file_path, file, files[].
    if (typeof args.file_path === 'string' && args.file_path) return args.file_path;
    if (typeof args.file === 'string' && args.file) return args.file;
    if (Array.isArray(args.files) && args.files.length && typeof args.files[0] === 'string') {
      return args.files[0];
    }
    return null;
  }

  const server = new Server(
    { name: 'mem-vault', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  const TOOLS = tools();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    if (settings.enabled === false) {
      return { content: [{ type: 'text', text: JSON.stringify(DISABLED_RESULT, null, 2) }] };
    }
    const callCwd = resolveCwdForCall(name, args);
    ensureVault(callCwd);
    // Idempotent + throttled — safe to call on every tool invocation.
    try { dashboardDaemon.ensureDashboardRunningAsync({ cwd: callCwd }); } catch {}
    const { db: callDb, sessionId: callSid } = getDb(callCwd);
    try {
      const result = await tool.handler(args, { db: callDb, cwd: callCwd, sessionId: callSid });
      return {
        content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `mem-vault error (${name}): ${err.message || err}` }],
      };
    }
  });

  // Resources: expose readable views of the vault so MCP clients that auto-browse
  // resources (e.g. Codex) see useful context without calling tools.
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'mem-vault://recent',
        name: 'Recent context',
        description: 'Last 15 observations for this project, as markdown.',
        mimeType: 'text/markdown',
      },
      {
        uri: 'mem-vault://status',
        name: 'Vault status',
        description: 'Project slug, vault path, and counts.',
        mimeType: 'application/json',
      },
      {
        uri: 'mem-vault://timeline',
        name: 'Timeline',
        description: 'Last 50 observations as JSON.',
        mimeType: 'application/json',
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const uri = req.params.uri;
    if (settings.enabled === false) {
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(DISABLED_RESULT, null, 2) }] };
    }
    ensureVault(cwd);
    const d = getDb(cwd).db;
    if (uri === 'mem-vault://recent') {
      const rows = db.recentContext(d, { limit: 15 });
      const md = rows.length
        ? `# ${paths.projectSlug(cwd)} — recent\n\n` +
          rows.map((r) => `- \`${r.type}\` ${r.title} _(${r.ts})_`).join('\n') + '\n'
        : `_No observations yet in ${paths.projectSlug(cwd)}._\n`;
      return { contents: [{ uri, mimeType: 'text/markdown', text: md }] };
    }
    if (uri === 'mem-vault://status') {
      const s = { project: paths.projectSlug(cwd), path: paths.projectDir(cwd), ...db.stats(d) };
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(s, null, 2) }] };
    }
    if (uri === 'mem-vault://timeline') {
      const rows = db.timeline(d, { limit: 50 });
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(rows, null, 2) }] };
    }
    throw new Error(`Unknown resource: ${uri}`);
  });

  // No prompts — return an empty list so clients that call prompts/list don't error.
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Graceful shutdown.
  const shutdown = () => {
    for (const entry of _dbByCwd.values()) {
      try { db.endSession(entry.db, entry.sessionId); } catch {}
      try { entry.db.close(); } catch {}
    }
    _dbByCwd.clear();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
}

function die(msg) {
  // MCP servers must not write to stdout (that's the JSON-RPC channel).
  process.stderr.write(msg + '\n');
  process.exit(1);
}

/** Tool registry. */
function tools() {
  return [
    {
      name: 'search',
      description:
        'PROACTIVE USE: Call this FIRST whenever the user asks about the codebase history, past decisions, "what does X do", "why did we...", "have we done...", "status of...". ' +
        'Full-text search across captured observations (titles, bodies, files, tags) in this project\'s persistent memory vault. ' +
        'Returns ranked matches. Cheap, fast, always safe to call — prefer this over Grep/Read when the question is about what has already been done or decided.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural-language or keyword query.' },
          limit: { type: 'integer', default: 20, minimum: 1, maximum: 200 },
          type: { type: 'string', description: 'Optional type filter (feature|bugfix|refactor|change|discovery|decision|note|capture).' },
        },
        required: ['query'],
      },
      handler: (args, ctx) => db.search(ctx.db, args),
    },

    {
      name: 'timeline',
      description:
        'PROACTIVE USE: Call this whenever the user asks "what did we do recently", "what changed today/yesterday", "recent activity", or you need temporal context at the start of a task. ' +
        'Lists recent observations in reverse-chronological order. Supports since/until date filters and type filter.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 50, minimum: 1, maximum: 500 },
          since: { type: 'string', description: 'ISO timestamp lower bound (inclusive).' },
          until: { type: 'string', description: 'ISO timestamp upper bound (inclusive).' },
          type: { type: 'string' },
        },
      },
      handler: (args, ctx) => db.timeline(ctx.db, args),
    },

    {
      name: 'get_observations',
      description: 'Fetch full observation records by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          ids: { type: 'array', items: { type: 'string' }, minItems: 1 },
        },
        required: ['ids'],
      },
      handler: (args, ctx) => db.getObservations(ctx.db, args.ids),
    },

    {
      name: 'save_observation',
      description:
        'PROACTIVE USE: Call this after completing ANY meaningful task — bugfix, feature, refactor, decision, discovery. ' +
        'Persists the learning to the vault so future sessions (CC, CLI, Codex) remember it. ' +
        'Use type=decision for choices, bugfix for fixes, feature for new capability, discovery for insights, refactor for structural changes. ' +
        'Do NOT wait to be asked — record proactively at logical checkpoints.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          body: { type: 'string' },
          type: {
            type: 'string',
            enum: ['feature', 'bugfix', 'refactor', 'change', 'discovery', 'decision', 'note', 'capture'],
            default: 'note',
          },
          files: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title'],
      },
      handler: (args, ctx) => {
        const id = db.saveObservation(ctx.db, { ...args, session_id: ctx.sessionId });
        return { id, ok: true };
      },
    },

    {
      name: 'mark_chapter',
      description: 'Mark a logical chapter boundary in the current session.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
        },
        required: ['title'],
      },
      handler: (args, ctx) => {
        const id = db.markChapter(ctx.db, { sessionId: ctx.sessionId, ...args });
        return { id, ok: true };
      },
    },

    {
      name: 'smart_outline',
      description:
        'PROACTIVE USE: Call this BEFORE using Read on any unfamiliar source file to get a structural map (functions, classes, methods, types) in seconds instead of reading hundreds of lines. ' +
        'Returns a file outline via WASM tree-sitter parsing. Also populates the symbol cache used by smart_search and smart_unfold.',
      inputSchema: {
        type: 'object',
        properties: {
          file_path: { type: 'string', description: 'Absolute or cwd-relative file path.' },
          refresh: { type: 'boolean', default: false, description: 'Bypass the symbol cache.' },
        },
        required: ['file_path'],
      },
      handler: async (args, ctx) => {
        const abs = path.resolve(ctx.cwd, args.file_path);
        if (!fs.existsSync(abs)) throw new Error('File not found: ' + abs);
        const mtime = Math.floor(fs.statSync(abs).mtimeMs);

        if (!args.refresh) {
          const cached = db.cachedSymbols(ctx.db, abs, mtime);
          if (cached && cached.length) return { file: abs, cached: true, symbols: cached };
        }
        const { lang, symbols, error } = await parsers.outlineFile(abs);
        if (error) return { file: abs, lang, symbols: [], error };
        db.replaceSymbols(ctx.db, abs, mtime, lang, symbols);
        return { file: abs, lang, cached: false, symbols };
      },
    },

    {
      name: 'smart_search',
      description:
        'PROACTIVE USE: Call this FIRST for ANY code-location question — "where is function X", "show me class Y", "find the handler for Z", "what implements W". ' +
        'Searches cached symbol outlines (functions, classes, methods, types) by name across all files in this project. ' +
        'Much faster and more precise than Grep for symbol lookups. Always safe to call.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer', default: 30 },
          lang: { type: 'string' },
        },
        required: ['query'],
      },
      handler: (args, ctx) => db.symbolSearch(ctx.db, args),
    },

    {
      name: 'smart_unfold',
      description:
        'Return the source of a specific symbol (by file path + start/end line, or name).',
      inputSchema: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          start_line: { type: 'integer' },
          end_line: { type: 'integer' },
          name: { type: 'string', description: 'If provided, looks up the symbol by name in the cache.' },
        },
        required: ['file_path'],
      },
      handler: async (args, ctx) => {
        const abs = path.resolve(ctx.cwd, args.file_path);
        if (!fs.existsSync(abs)) throw new Error('File not found: ' + abs);
        let start = args.start_line, end = args.end_line;
        if (args.name && (!start || !end)) {
          const rows = db.symbolSearch(ctx.db, { query: args.name, limit: 5 });
          const hit = rows.find((r) => r.file === abs) || rows[0];
          if (hit) { start = hit.start_line; end = hit.end_line; }
        }
        if (!start || !end) throw new Error('Provide start_line+end_line or name.');
        return { file: abs, start_line: start, end_line: end, source: parsers.unfoldLines(abs, start, end) };
      },
    },

    {
      name: 'recent_context',
      description:
        'Return a compact index of recent observations (cheap to load).  Useful at session start.',
      inputSchema: {
        type: 'object',
        properties: { limit: { type: 'integer', default: 15 } },
      },
      handler: (args, ctx) => db.recentContext(ctx.db, args),
    },

    {
      name: 'stats',
      description: 'Return counts of observations, chapters, sessions, and cached symbols.',
      inputSchema: { type: 'object', properties: {} },
      handler: (_args, ctx) => ({
        project: paths.projectSlug(ctx.cwd),
        path: paths.projectDir(ctx.cwd),
        ...db.stats(ctx.db),
      }),
    },

    {
      name: 'mirror_project',
      description:
        'Refresh the <project>/.mem-vault/ folder with README.md + recent.md — a human-readable ' +
        'mirror of this project\'s vault for quick reference and git visibility.',
      inputSchema: {
        type: 'object',
        properties: { limit: { type: 'integer', default: 25 } },
      },
      handler: (args, ctx) => mirror.refresh(ctx.cwd, args),
    },
  ];
}

module.exports = { run, tools, detectClient };
