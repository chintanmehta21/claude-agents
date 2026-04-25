// dashboard/server.js — local-only web dashboard for mem-vault.
// Serves static UI + a tiny JSON API backed by read-only sqlite handles.
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const { spawn } = require('node:child_process');

const paths = require('../server/paths');
const { loadSettings } = require('../server/settings');

// Read package version (best-effort) for the health endpoint.
let PKG_VERSION = '0.0.0';
try { PKG_VERSION = require('../package.json').version || '0.0.0'; } catch {}
const STARTED_AT = new Date().toISOString();
const HEALTH_DEFAULT_ENDPOINT = '/__memvault_health';

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('mem-vault dashboard: better-sqlite3 is not installed.');
  console.error('Run: npm install --prefix "' + paths.pluginRoot() + '"');
  process.exit(1);
}

// Port/host are resolved at start() time (not import time) so callers can
// pass `--port` on the CLI or set MEM_VAULT_DASHBOARD_PORT before invoking.
// Precedence: explicit override (CLI flag) > env var > per-project settings > built-in default.
function resolvePort(override) {
  if (override !== undefined && override !== null && override !== '') return Number(override);
  if (process.env.MEM_VAULT_DASHBOARD_PORT) return Number(process.env.MEM_VAULT_DASHBOARD_PORT);
  const s = loadSettings(process.env.MEM_VAULT_CWD || process.cwd());
  return Number(s.dashboard_port) || 37777;
}
function resolveHost(override) {
  if (override) return String(override);
  if (process.env.MEM_VAULT_DASHBOARD_HOST) return String(process.env.MEM_VAULT_DASHBOARD_HOST);
  const s = loadSettings(process.env.MEM_VAULT_CWD || process.cwd());
  return String(s.dashboard_host || '127.0.0.1');
}
const PUBLIC_DIR = path.join(__dirname, 'public');

// Cache read-only DB handles by slug (cheap to keep open).
const dbCache = new Map();
function openProject(slug) {
  if (dbCache.has(slug)) return dbCache.get(slug);
  const dbPath = path.join(paths.vaultRoot(), 'projects', slug, 'vault.db');
  if (!fs.existsSync(dbPath)) return null;
  try {
    const d = new Database(dbPath, { readonly: true, fileMustExist: true });
    d.pragma('busy_timeout = 2000');
    dbCache.set(slug, d);
    return d;
  } catch (e) {
    return null;
  }
}

function listProjectsDetailed() {
  const out = [];
  for (const slug of paths.listProjects()) {
    const metaPath = path.join(paths.vaultRoot(), 'projects', slug, 'meta.json');
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (_) {}
    let count = 0, lastTs = null;
    const d = openProject(slug);
    if (d) {
      try {
        count = d.prepare('SELECT COUNT(*) AS n FROM observations').get().n;
        const r = d.prepare('SELECT ts FROM observations ORDER BY ts DESC LIMIT 1').get();
        lastTs = r ? r.ts : null;
      } catch (_) {}
    }
    out.push({
      slug,
      cwd: meta.cwd || null,
      title: meta.cwd ? path.basename(meta.cwd) : slug,
      created_at: meta.created_at || null,
      observations: count,
      last_ts: lastTs,
    });
  }
  out.sort((a, b) => (b.last_ts || '').localeCompare(a.last_ts || ''));
  return out;
}

function sanitizeFts(query) {
  const tokens = String(query || '').match(/[\p{L}\p{N}_]+/gu) || [];
  if (tokens.length === 0) return null;
  return tokens.map((t) => `"${t}"`).join(' ');
}

function hydrate(row) {
  if (!row) return null;
  const safe = (s) => { try { return JSON.parse(s); } catch { return []; } };
  return {
    ...row,
    files: row.files ? safe(row.files) : [],
    tags: row.tags ? safe(row.tags) : [],
  };
}

function getObservations({ slug, q, type, limit }) {
  const d = openProject(slug);
  if (!d) return [];
  limit = Math.min(Number(limit) || 200, 1000);
  if (q && q.trim()) {
    const fts = sanitizeFts(q);
    if (!fts) return [];
    let sql = `SELECT o.*, bm25(observations_fts) AS score
               FROM observations_fts
               JOIN observations o ON o.rowid = observations_fts.rowid
               WHERE observations_fts MATCH ?`;
    const args = [fts];
    if (type) { sql += ` AND o.type = ?`; args.push(type); }
    sql += ` ORDER BY score LIMIT ?`;
    args.push(limit);
    return d.prepare(sql).all(...args).map(hydrate);
  }
  let sql = `SELECT * FROM observations WHERE 1=1`;
  const args = [];
  if (type) { sql += ` AND type = ?`; args.push(type); }
  sql += ` ORDER BY ts DESC LIMIT ?`;
  args.push(limit);
  return d.prepare(sql).all(...args).map(hydrate);
}

function getStats(slug) {
  const d = openProject(slug);
  if (!d) return null;
  const total = d.prepare('SELECT COUNT(*) AS n FROM observations').get().n;
  const byType = d.prepare(
    `SELECT type, COUNT(*) AS n FROM observations GROUP BY type ORDER BY n DESC`
  ).all();
  const byDay = d.prepare(
    `SELECT substr(ts,1,10) AS day, COUNT(*) AS n
     FROM observations GROUP BY day ORDER BY day DESC LIMIT 60`
  ).all();
  // Day-of-week heatmap (0=Sun..6=Sat) computed in JS.
  const dow = [0, 0, 0, 0, 0, 0, 0];
  for (const row of byDay) {
    const dt = new Date(row.day + 'T00:00:00Z');
    if (!isNaN(dt)) dow[dt.getUTCDay()] += row.n;
  }
  const sessions = d.prepare('SELECT COUNT(*) AS n FROM sessions').get().n;
  const chapters = d.prepare('SELECT COUNT(*) AS n FROM chapters').get().n;
  return { total, byType, byDay, dow, sessions, chapters };
}

// ---- HTTP ----

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function sendJson(res, code, body) {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': buf.length,
    'cache-control': 'no-store',
  });
  res.end(buf);
}

function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  // Block traversal.
  if (rel.includes('..')) { res.writeHead(400); return res.end('bad path'); }
  const full = path.join(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(400); return res.end('bad path'); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    const mime = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': mime, 'content-length': data.length });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Local-only: refuse non-loopback origins.
  const remote = req.socket.remoteAddress || '';
  if (!(remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1')) {
    res.writeHead(403); return res.end('local only');
  }
  const u = url.parse(req.url, true);
  try {
    // Health endpoint — used by ensureDashboardRunning to confirm the bound
    // process is mem-vault's dashboard (and not some other tool on the same port).
    if (u.pathname === HEALTH_DEFAULT_ENDPOINT || u.pathname === '/__memvault_health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'mem-vault-dashboard',
        version: PKG_VERSION,
        started_at: STARTED_AT,
        pid: process.pid,
        uptime_s: Math.round(process.uptime()),
      });
    }
    if (u.pathname === '/api/projects') {
      return sendJson(res, 200, { projects: listProjectsDetailed() });
    }
    if (u.pathname === '/api/observations') {
      const slug = String(u.query.project || '');
      if (!slug) return sendJson(res, 400, { error: 'missing project' });
      const rows = getObservations({
        slug,
        q: u.query.q || '',
        type: u.query.type || '',
        limit: u.query.limit,
      });
      return sendJson(res, 200, { observations: rows });
    }
    if (u.pathname === '/api/stats') {
      const slug = String(u.query.project || '');
      if (!slug) return sendJson(res, 400, { error: 'missing project' });
      const s = getStats(slug);
      if (!s) return sendJson(res, 404, { error: 'project not found' });
      return sendJson(res, 200, s);
    }
    if (u.pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: 'unknown endpoint' });
    }
    return serveStatic(req, res, u.pathname);
  } catch (err) {
    return sendJson(res, 500, { error: String(err && err.message || err) });
  }
});

function start({ open = true, port, host } = {}) {
  const PORT = resolvePort(port);
  const HOST = resolveHost(host);
  server.listen(PORT, HOST, () => {
    const urlStr = `http://${HOST}:${PORT}/`;
    process.stdout.write(`mem-vault dashboard: ${urlStr}\n`);
    process.stdout.write(`  vault root: ${paths.vaultRoot()}\n`);
    process.stdout.write(`  projects:   ${paths.listProjects().length}\n`);
    if (open) tryOpenBrowser(urlStr);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      process.stderr.write(`port ${PORT} already in use. Set MEM_VAULT_DASHBOARD_PORT to override.\n`);
    } else {
      process.stderr.write(String(err) + '\n');
    }
    process.exit(1);
  });
}

function tryOpenBrowser(target) {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', target], { stdio: 'ignore', detached: true }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [target], { stdio: 'ignore', detached: true }).unref();
    } else {
      spawn('xdg-open', [target], { stdio: 'ignore', detached: true }).unref();
    }
  } catch (_) { /* best-effort */ }
}

function installShutdownHandlers() {
  const cleanup = (sig) => {
    try {
      // Best-effort: remove the daemon PID file if this process owns it.
      const os = require('node:os');
      const pidPath = path.join(
        process.env.MEM_VAULT_DATA_DIR
          ? path.resolve(process.env.MEM_VAULT_DATA_DIR)
          : path.join(os.homedir(), '.mem-vault'),
        'dashboard.pid'
      );
      try {
        const raw = fs.readFileSync(pidPath, 'utf8');
        const obj = JSON.parse(raw);
        if (obj && obj.pid === process.pid) fs.unlinkSync(pidPath);
      } catch {}
    } catch {}
    try { server.close(() => process.exit(0)); } catch { process.exit(0); }
    setTimeout(() => process.exit(0), 1500).unref();
  };
  process.on('SIGTERM', () => cleanup('SIGTERM'));
  process.on('SIGINT', () => cleanup('SIGINT'));
  if (process.platform === 'win32') {
    try { process.on('SIGBREAK', () => cleanup('SIGBREAK')); } catch {}
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const noOpen = args.includes('--no-open') || args.includes('--daemon') || process.env.MEM_VAULT_DAEMON === '1';
  let port;
  const pi = args.indexOf('--port');
  if (pi >= 0 && args[pi + 1]) port = Number(args[pi + 1]);
  installShutdownHandlers();
  start({ open: !noOpen, port });
}

module.exports = { start };
