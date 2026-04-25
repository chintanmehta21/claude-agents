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

function listProjects() {
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
  projects                               List all project vaults
  mirror [--limit 25]                    Refresh <project>/.mem-vault/ README + recent.md
  setup-codex                            Write Codex MCP config to ~/.codex/config.toml
  dashboard                              Ensure 24x7 background dashboard is running, print URL
  dashboard --status                     Show daemon PID, port, uptime, log path
  dashboard --stop                       Stop the background dashboard daemon
  dashboard --restart                    Restart the background dashboard daemon
  dashboard --foreground [--port 37777]  Run dashboard in current terminal (debugging)
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
