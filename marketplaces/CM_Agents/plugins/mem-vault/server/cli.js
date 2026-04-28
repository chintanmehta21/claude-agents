// cli.js — command-line interface for mem-vault.
// Used by hooks (save-obs, start-session, end-session, recent-context) and humans.
'use strict';

const fs = require('fs');
const path = require('path');
const db = require('./db');
const parsers = require('./parsers');
const paths = require('./paths');
const capture = require('./capture');
const mirror = require('./project_mirror');
const settingsMod = require('./settings');
const dashboardDaemon = require('./dashboard_daemon');

const COMMANDS = {
  status,
  search: cliSearch,
  timeline: cliTimeline,
  save: cliSave,
  'save-obs-from-stdin': saveFromStdin,
  'start-session': startSession,
  'end-session': endSession,
  'mark-chapter': markChapter,
  'recent-context': recentContext,
  outline,
  purge,
  projects: listProjects,
  mirror: cliMirror,
  'setup-codex': setupCodex,
  dashboard: dashboard,
  prefetch: cliPrefetch,
  doctor: cliDoctor,
  help: help,
  '--help': help,
  '-h': help,
};

async function run(argv) {
  const [cmd, ...rest] = argv;
  const fn = COMMANDS[cmd || 'help'];
  if (!fn) {
    console.error(`Unknown command: ${cmd}`);
    help();
    process.exit(1);
  }
  try {
    const args = parseArgs(rest);
    // Fire-and-forget dashboard autostart on every CLI dispatch, except when
    // the user is explicitly controlling the dashboard (dashboard subcommand
    // handles spawn itself) or asking for help.
    if (cmd && cmd !== 'help' && cmd !== '--help' && cmd !== '-h' && cmd !== 'dashboard') {
      try { dashboardDaemon.ensureDashboardRunningAsync({ cwd: args.cwd ? path.resolve(args.cwd) : process.cwd() }); } catch {}
    }
    // Resolve / lazily create the per-project .mem-vault/ before any command
    // touches the DB.  Idempotent + cached.  Honors enabled / auto_create_project_vault.
    if (cmd && cmd !== 'help' && cmd !== '--help' && cmd !== '-h' && cmd !== 'setup-codex' && cmd !== 'projects') {
      try {
        const cwd = args.cwd ? path.resolve(args.cwd) : process.cwd();
        paths.ensureProjectVault(cwd, { settings: settingsMod.loadSettings(cwd) });
      } catch (_) { /* never block CLI on ensure failure */ }
    }
    const r = await fn(args);
    if (r !== undefined) process.stdout.write(typeof r === 'string' ? r : JSON.stringify(r, null, 2) + '\n');
  } catch (err) {
    process.stderr.write(`[mem-vault] ${err.message || err}\n`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > -1) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        out[a.slice(2)] = argv[++i];
      } else {
        out[a.slice(2)] = true;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function cwdFromArgs(args) {
  return args.cwd ? path.resolve(args.cwd) : process.cwd();
}

function status(args) {
  const cwd = cwdFromArgs(args);
  if (isDisabled(cwd)) {
    return {
      ...DISABLED_MSG,
      project_slug: paths.projectSlug(cwd),
      vault_dir: paths.projectDir(cwd),
      cwd,
    };
  }
  const d = db.open(cwd);
  const s = db.stats(d);
  return {
    project_slug: paths.projectSlug(cwd),
    vault_dir: paths.projectDir(cwd),
    db_path: paths.vaultDbPath(cwd),
    cwd,
    ...s,
  };
}

const DISABLED_MSG = { disabled: true, message: 'mem-vault is disabled for this project (set `enabled: true` in .claude/mem-vault.local.md to re-enable).' };

function isDisabled(cwd) {
  return settingsMod.loadSettings(cwd).enabled === false;
}

function cliSearch(args) {
  const cwd = cwdFromArgs(args);
  if (isDisabled(cwd)) return DISABLED_MSG;
  const d = db.open(cwd);
  return db.search(d, {
    query: args.q || args.query || args._[0] || '',
    limit: Number(args.limit) || 20,
    type: args.type,
  });
}

function cliTimeline(args) {
  const cwd = cwdFromArgs(args);
  if (isDisabled(cwd)) return DISABLED_MSG;
  const d = db.open(cwd);
  return db.timeline(d, {
    limit: Number(args.limit) || 50,
    since: args.since,
    until: args.until,
    type: args.type,
  });
}

function cliSave(args) {
  const cwd = cwdFromArgs(args);
  const d = db.open(cwd);
  const sid = db.currentSession(d, args.client || 'cli') || db.startSession(d, { client: args.client || 'cli', cwd });
  const id = db.saveObservation(d, {
    session_id: sid,
    type: args.type || 'note',
    title: args.title || args._[0] || 'note',
    body: args.body,
    files: args.files ? args.files.split(',') : [],
    tags: args.tags ? args.tags.split(',') : [],
  });
  return { id, ok: true };
}

/** Read a JSON payload on stdin (hook event) and write an observation if applicable. */
async function saveFromStdin(args) {
  const cwd = cwdFromArgs(args);
  const raw = await readStdin();
  if (!raw) return { ok: false, reason: 'empty' };
  let payload;
  try { payload = JSON.parse(raw); } catch { return { ok: false, reason: 'invalid-json' }; }

  const obs = capture.fromToolUse(payload);
  if (!obs) return { ok: true, captured: false };

  const d = db.open(cwd);
  const sid = db.currentSession(d, args.client || 'hook') || db.startSession(d, { client: args.client || 'hook', cwd });
  const id = db.saveObservation(d, { ...obs, session_id: sid });
  return { ok: true, captured: true, id };
}

function startSession(args) {
  const cwd = cwdFromArgs(args);
  const d = db.open(cwd);
  const sid = db.startSession(d, { client: args.client || 'cli', cwd, id: args.id });
  return { session_id: sid };
}

function endSession(args) {
  const cwd = cwdFromArgs(args);
  const d = db.open(cwd);
  const sid = args.id || db.currentSession(d, args.client || 'cli');
  if (sid) db.endSession(d, sid);
  return { ok: true, session_id: sid };
}

function markChapter(args) {
  const cwd = cwdFromArgs(args);
  const d = db.open(cwd);
  const sid = db.currentSession(d, args.client || 'cli') || db.startSession(d, { client: args.client || 'cli', cwd });
  const id = db.markChapter(d, { sessionId: sid, title: args.title || args._[0] || 'chapter', summary: args.summary });
  return { id, ok: true };
}

function recentContext(args) {
  const cwd = cwdFromArgs(args);
  const d = db.open(cwd);
  const rows = db.recentContext(d, { limit: Number(args.limit) || 15 });
  if (args.format === 'markdown') return renderRecentMarkdown(rows, cwd);
  return rows;
}

function renderRecentMarkdown(rows, cwd) {
  if (!rows.length) return '';
  const lines = [
    `# [mem-vault] ${paths.projectSlug(cwd)} — recent context (${rows.length} items)`,
    '',
    '| Time | Type | Title | Files |',
    '|------|------|-------|-------|',
  ];
  for (const r of rows) {
    const files = (r.files || []).slice(0, 2).join(', ');
    lines.push(`| ${r.ts} | ${r.type} | ${escapePipes(r.title)} | ${escapePipes(files)} |`);
  }
  lines.push('', '_Stored across Claude Code, CC CLI, and Codex._');
  return lines.join('\n') + '\n';
}

function escapePipes(s) { return String(s || '').replace(/\|/g, '\\|'); }

async function outline(args) {
  const cwd = cwdFromArgs(args);
  const file = args.file || args._[0];
  if (!file) throw new Error('Provide --file <path>');
  const abs = path.resolve(cwd, file);
  const d = db.open(cwd);
  const mtime = Math.floor(fs.statSync(abs).mtimeMs);
  const { lang, symbols, error } = await parsers.outlineFile(abs);
  if (!error) db.replaceSymbols(d, abs, mtime, lang, symbols);
  return { file: abs, lang, symbols, error };
}

function purge(args) {
  const cwd = cwdFromArgs(args);
  if (!args.yes) throw new Error('Refusing to purge without --yes');
  const d = db.open(cwd);
  db.purgeProject(d);
  return { ok: true, purged: paths.projectSlug(cwd) };
}

function cliMirror(args) {
  const cwd = cwdFromArgs(args);
  return mirror.refresh(cwd, { limit: Number(args.limit) || 25 });
}

function listProjects(args) {
  if (args && args.registry) {
    // Print the canonical project registry (debug aid).
    paths.hydrateRegistry();
    return paths.loadRegistry();
  }
  return paths.listProjects().map((slug) => {
    const metaPath = path.join(paths.vaultRoot(), 'projects', slug, 'meta.json');
    try { return { slug, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) }; }
    catch { return { slug }; }
  });
}

/** Write the Codex MCP config entry idempotently. */
function setupCodex() {
  const os = require('os');
  const cfg = path.join(os.homedir(), '.codex', 'config.toml');
  const entry = codexTomlEntry(paths.pluginRoot());
  paths.ensureDir(path.dirname(cfg));

  let existing = '';
  if (fs.existsSync(cfg)) existing = fs.readFileSync(cfg, 'utf8');

  if (existing.includes('[mcp_servers.mem_vault]') || existing.includes('[mcp_servers.mem-vault]')) {
    // Replace existing block (handles both legacy `mem_vault` and current `mem-vault` keys).
    const replaced = existing.replace(
      /\[mcp_servers\.mem[-_]vault\][\s\S]*?(?=\n\[|\n*$)/,
      entry.trimEnd() + '\n'
    );
    fs.writeFileSync(cfg, replaced, 'utf8');
    return { ok: true, path: cfg, action: 'replaced' };
  }
  const sep = existing && !existing.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(cfg, existing + sep + entry, 'utf8');
  return { ok: true, path: cfg, action: 'added' };
}

function codexTomlEntry(pluginRoot) {
  const serverPath = path.join(pluginRoot, 'server', 'index.js').replace(/\\/g, '\\\\');
  // Use hyphenated name to match Claude Code's `.mcp.json` registration so the
  // same server name (`mem-vault`) works across both clients.  TOML bare keys
  // support hyphens.
  return `
[mcp_servers.mem-vault]
command = "node"
args = ["${serverPath}", "mcp"]
env = { MEM_VAULT_ROOT = "${pluginRoot.replace(/\\/g, '\\\\')}", MEM_VAULT_CLIENT = "codex" }
`;
}

/** Control the local web dashboard daemon (24x7 background process). */
async function dashboard(args) {
  const sub = (args._ && args._[0]) || '';
  // --foreground: run in current terminal (legacy / debugging).
  if (args.foreground || sub === 'foreground') {
    const dash = require('../dashboard/server');
    let open;
    if (args['no-open']) open = false;
    else {
      const s = settingsMod.loadSettings(process.env.MEM_VAULT_CWD || process.cwd());
      open = s.dashboard_open_browser !== false;
    }
    dash.start({
      open,
      port: args.port ? Number(args.port) : undefined,
      host: args.host || undefined,
    });
    return new Promise(() => {});
  }

  if (args.status || sub === 'status') {
    const st = dashboardDaemon.getStatus();
    return st;
  }

  if (args.stop || sub === 'stop') {
    const r = await dashboardDaemon.stopDaemon();
    return r;
  }

  if (args.restart || sub === 'restart') {
    await dashboardDaemon.stopDaemon();
    // Force a fresh check past the throttle.
    const r = await dashboardDaemon.ensureDashboardRunning({ force: true });
    return { restarted: true, ...r };
  }

  // Default: ensure running, return URL.
  const r = await dashboardDaemon.ensureDashboardRunning({ force: true });
  const port = r.port || (settingsMod.loadSettings(process.env.MEM_VAULT_CWD || process.cwd()).dashboard_port) || 37777;
  return { ...r, url: `http://127.0.0.1:${port}/` };
}

/**
 * `prefetch --prompt "<text>" [--json]` — same logic as the
 * UserPromptSubmit hook, callable from the terminal for testing/debugging.
 */
function cliPrefetch(args) {
  const cwd = cwdFromArgs(args);
  const prefetch = require('./prefetch');
  const settings = settingsMod.loadSettings(cwd);
  const limit = Number(args.limit) || Number(settings.prefetch_max_results) || 5;
  const prompt = args.prompt || args.q || args._[0] || '';
  const result = prefetch.runPrefetch({ cwd, prompt, limit, recent: true, settings });
  if (args.json || args.format === 'json') {
    return result;
  }
  const hint = prefetch.formatHint({
    results: result.results,
    recent: result.recent,
    query: result.query,
    mode: 'prompt',
  });
  return (hint || '(no matches)') + '\n';
}

/** `doctor` — diagnostics for the user. */
function cliDoctor(args) {
  const cwd = cwdFromArgs(args);
  const root = paths.pluginRoot();
  const fsx = require('fs');
  const cp = require('child_process');
  const hookLog = require('./hook_log');

  const hooksJsonPath = path.join(root, 'hooks', 'hooks.json');
  let hooksJson = null;
  try { hooksJson = JSON.parse(fsx.readFileSync(hooksJsonPath, 'utf8')); } catch (e) { hooksJson = { error: e.message }; }

  const hookFiles = [
    'sessionstart-index.js',
    'userpromptsubmit-prefetch.js',
    'pretooluse-hint.js',
    'posttooluse-capture.js',
    'sessionend-consolidate.js',
  ];
  const hookChecks = hookFiles.map((f) => {
    const p = path.join(root, 'hooks', f);
    const exists = fsx.existsSync(p);
    let nodeOk = false, nodeErr = null;
    if (exists) {
      try {
        cp.execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
        nodeOk = true;
      } catch (e) { nodeErr = String(e.stderr || e.message || e).slice(0, 240); }
    }
    return { file: f, exists, node_check: nodeOk, error: nodeErr };
  });

  const events = (hooksJson && hooksJson.hooks) ? Object.keys(hooksJson.hooks) : [];
  const requiredEvents = ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'SessionEnd'];
  const missingEvents = requiredEvents.filter((e) => !events.includes(e));

  let dashStatus = null;
  try { dashStatus = dashboardDaemon.getStatus(); } catch (e) { dashStatus = { error: e.message }; }

  let registry = { projects: [] };
  try { registry = paths.loadRegistry(); } catch {}

  let vault = null;
  try {
    const vDir = paths.projectDir(cwd);
    const vDb = paths.vaultDbPath(cwd);
    let counts = null;
    if (fsx.existsSync(vDb)) {
      const d = db.open(cwd);
      counts = db.stats(d);
      try {
        const decisions = d.prepare("SELECT COUNT(*) AS n FROM observations WHERE type='decision'").get().n;
        const bugfixes = d.prepare("SELECT COUNT(*) AS n FROM observations WHERE type='bugfix'").get().n;
        counts.decisions = decisions;
        counts.bugfixes = bugfixes;
      } catch {}
    }
    vault = { cwd, dir: vDir, db: vDb, exists: fsx.existsSync(vDb), counts };
  } catch (e) { vault = { error: e.message }; }

  const lastFires = hookLog.tail(5);

  const ok =
    missingEvents.length === 0 &&
    hookChecks.every((h) => h.exists && h.node_check) &&
    !!vault && !vault.error;

  return {
    ok,
    plugin_root: root,
    hooks_json: hooksJsonPath,
    registered_events: events,
    missing_events: missingEvents,
    hook_scripts: hookChecks,
    dashboard: dashStatus,
    registry_projects: (registry.projects || []).length,
    current_vault: vault,
    last_hook_fires: lastFires,
    hook_log_path: hookLog.logPath(),
  };
}

function help() {
  return `mem-vault — persistent memory vault CLI

Usage:
  mem-vault <command> [--cwd <dir>] [options]

Memory:
  status                                 Show project vault stats
  save --title <t> [--body <b>] [--type <t>] [--files a,b] [--tags x,y]
  search --q <query> [--limit 20] [--type feature]
  timeline [--limit 50] [--since ISO] [--until ISO] [--type ...]
  recent-context [--limit 15] [--format markdown]
  mark-chapter --title <t> [--summary <s>]
  purge --yes                            Wipe this project's vault

Session:
  start-session --client <name>
  end-session   [--client <name>]

Code intelligence:
  outline --file <path>                  Structural outline (WASM tree-sitter)

Hooks (stdin JSON):
  save-obs-from-stdin                    Read hook payload on stdin, capture if relevant

Admin:
  projects [--registry]                  List all project vaults (or print registry.json)
  mirror [--limit 25]                    Refresh <project>/.mem-vault/ README + recent.md
  setup-codex                            Write Codex MCP config to ~/.codex/config.toml
  dashboard                              Ensure 24x7 background dashboard is running, print URL
  dashboard --status                     Show daemon PID, port, uptime, log path
  dashboard --stop                       Stop the background dashboard daemon
  dashboard --restart                    Restart the background dashboard daemon
  dashboard --foreground [--port 37777]  Run dashboard in current terminal (debugging)

Diagnostics:
  prefetch --prompt "<text>" [--json]    Same logic as the UserPromptSubmit hook
  doctor                                 Verify hooks, dashboard, vault, registry
`;
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve('');
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
    // Safety timeout: 2s.
    setTimeout(() => resolve(data), 2000);
  });
}

module.exports = { run };
