// dashboard_daemon.js — autostart + supervise the mem-vault dashboard as a
// detached background process so it persists across CC/Codex/CLI lifetimes.
//
// Public API:
//   ensureDashboardRunning(opts) -> Promise<{ ok, started, pid, port, reason? }>
//   getStatus()                  -> { running, pid, port, uptime_ms, log, pid_file }
//   stopDaemon()                 -> Promise<{ ok, stopped, pid? }>
//
// The function is fire-and-forget safe: caller may ignore the returned promise.
// All errors are swallowed; ensureDashboardRunning never throws.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const http = require('node:http');
const { spawn } = require('node:child_process');

const paths = require('./paths');
const { loadSettings } = require('./settings');

// Module-level guard so a long-lived process (MCP server) only checks once
// per N seconds even if every CallTool calls ensureDashboardRunning.
const THROTTLE_MS = 10_000;
let _lastCheck = 0;
let _inflight = null;

function vaultDir() {
  // Always use the global ~/.mem-vault for daemon control files so the
  // dashboard's lifecycle is independent of which project triggered it.
  const root = process.env.MEM_VAULT_DATA_DIR
    ? path.resolve(process.env.MEM_VAULT_DATA_DIR)
    : path.join(os.homedir(), '.mem-vault');
  try { fs.mkdirSync(root, { recursive: true }); } catch {}
  return root;
}

function pidFile() { return path.join(vaultDir(), 'dashboard.pid'); }
function lockFile() { return path.join(vaultDir(), 'dashboard.pid.lock'); }
function logFile() { return path.join(vaultDir(), 'dashboard.log'); }

function readPidFile() {
  try {
    const raw = fs.readFileSync(pidFile(), 'utf8');
    const obj = JSON.parse(raw);
    if (obj && typeof obj.pid === 'number') return obj;
  } catch {}
  return null;
}

function writePidFile(obj) {
  try { fs.writeFileSync(pidFile(), JSON.stringify(obj, null, 2), 'utf8'); } catch {}
}

function removePidFile() {
  try { fs.unlinkSync(pidFile()); } catch {}
}

function isPidAlive(pid) {
  if (!pid || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // exists but no permission
  }
}

function probePort(host, port, timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (open) => { if (!done) { done = true; try { socket.destroy(); } catch {} resolve(open); } };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    try { socket.connect(port, host); } catch { finish(false); }
  });
}

function probeHealth(host, port, endpoint, timeoutMs = 400) {
  return new Promise((resolve) => {
    const req = http.request(
      { host, port, path: endpoint, method: 'GET', timeout: timeoutMs },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { body += c; if (body.length > 4096) req.destroy(); });
        res.on('end', () => {
          try {
            const j = JSON.parse(body);
            if (j && j.ok === true && j.service === 'mem-vault-dashboard') {
              resolve({ ok: true, info: j });
            } else {
              resolve({ ok: false });
            }
          } catch { resolve({ ok: false }); }
        });
      }
    );
    req.on('timeout', () => { try { req.destroy(); } catch {} resolve({ ok: false }); });
    req.on('error', () => resolve({ ok: false }));
    req.end();
  });
}

function rotateLog() {
  try {
    const f = logFile();
    const st = fs.statSync(f);
    if (st.size > 5 * 1024 * 1024) {
      const old = f + '.1';
      try { fs.unlinkSync(old); } catch {}
      fs.renameSync(f, old);
    }
  } catch {}
}

function tryAcquireLock() {
  // Atomic O_CREAT|O_EXCL — returns fd on success, null if lock held.
  try {
    const fd = fs.openSync(lockFile(), 'wx');
    fs.writeSync(fd, String(process.pid));
    return fd;
  } catch (e) {
    // If the lock is older than 30s, treat as stale and steal it.
    try {
      const st = fs.statSync(lockFile());
      if (Date.now() - st.mtimeMs > 30_000) {
        try { fs.unlinkSync(lockFile()); } catch {}
        try {
          const fd = fs.openSync(lockFile(), 'wx');
          fs.writeSync(fd, String(process.pid));
          return fd;
        } catch {}
      }
    } catch {}
    return null;
  }
}

function releaseLock(fd) {
  try { if (fd != null) fs.closeSync(fd); } catch {}
  try { fs.unlinkSync(lockFile()); } catch {}
}

function spawnDaemon({ port, host, pluginRoot }) {
  rotateLog();
  const serverPath = path.join(pluginRoot, 'dashboard', 'server.js');
  // Minimal env: do NOT inherit MEM_VAULT_CWD (would mislead project resolution
  // for a daemon that should serve all projects).
  const env = {
    PATH: process.env.PATH || '',
    SystemRoot: process.env.SystemRoot || '',
    USERPROFILE: process.env.USERPROFILE || '',
    HOME: process.env.HOME || os.homedir(),
    APPDATA: process.env.APPDATA || '',
    LOCALAPPDATA: process.env.LOCALAPPDATA || '',
    TEMP: process.env.TEMP || os.tmpdir(),
    TMP: process.env.TMP || os.tmpdir(),
    MEM_VAULT_ROOT: pluginRoot,
    MEM_VAULT_DASHBOARD_PORT: String(port),
    MEM_VAULT_DASHBOARD_HOST: String(host),
    MEM_VAULT_DAEMON: '1',
  };
  if (process.env.MEM_VAULT_DATA_DIR) env.MEM_VAULT_DATA_DIR = process.env.MEM_VAULT_DATA_DIR;

  let logFd;
  try { logFd = fs.openSync(logFile(), 'a'); } catch { logFd = 'ignore'; }

  // Use process.execPath (current node) for reliability — `node` may not be in PATH on Windows hooks.
  const child = spawn(
    process.execPath,
    [serverPath, '--no-open', '--daemon'],
    {
      detached: true,
      stdio: ['ignore', logFd, logFd],
      windowsHide: true,
      shell: false,
      env,
      cwd: pluginRoot,
    }
  );
  child.unref();
  return child.pid;
}

async function waitForHealth(host, port, endpoint, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await probeHealth(host, port, endpoint, 300);
    if (r.ok) return r;
    await new Promise((r2) => setTimeout(r2, 150));
  }
  return { ok: false };
}

/**
 * Idempotent. Cheap. Never throws. Caller may ignore the returned promise.
 * Throttled to once per ~10s per process.
 */
async function ensureDashboardRunning(opts = {}) {
  const now = Date.now();
  if (_inflight) return _inflight;
  if (now - _lastCheck < THROTTLE_MS && !opts.force) {
    return { ok: true, started: false, reason: 'throttled' };
  }
  _lastCheck = now;
  _inflight = (async () => {
    try {
      const cwd = opts.cwd || process.env.MEM_VAULT_CWD || process.cwd();
      const settings = loadSettings(cwd);
      if (settings.enabled === false) {
        return { ok: false, started: false, reason: 'mem-vault disabled' };
      }
      if (settings.dashboard_autostart === false) {
        return { ok: false, started: false, reason: 'dashboard_autostart=false' };
      }
      const port = Number(settings.dashboard_port) || 37777;
      const host = String(settings.dashboard_host || '127.0.0.1');
      const endpoint = String(settings.dashboard_health_endpoint || '/__memvault_health');
      const pluginRoot = paths.pluginRoot();

      // Step 1: validate existing PID file.
      const pidInfo = readPidFile();
      if (pidInfo && isPidAlive(pidInfo.pid)) {
        const portOpen = await probePort(host, port, 250);
        if (portOpen) {
          const h = await probeHealth(host, port, endpoint, 400);
          if (h.ok) return { ok: true, started: false, pid: pidInfo.pid, port };
        }
        // PID alive but not bound or not ours — stale, drop the file.
        removePidFile();
      } else if (pidInfo) {
        removePidFile();
      }

      // Step 2: maybe a daemon is running but the PID file vanished — check port + health.
      const portOpen = await probePort(host, port, 250);
      if (portOpen) {
        const h = await probeHealth(host, port, endpoint, 500);
        if (h.ok) {
          // Recreate the PID file from health info.
          writePidFile({
            pid: h.info && h.info.pid ? h.info.pid : null,
            port,
            host,
            started_at: (h.info && h.info.started_at) || new Date().toISOString(),
            recovered: true,
          });
          return { ok: true, started: false, pid: h.info && h.info.pid, port, recovered: true };
        }
        // Port held by something else — back off.
        return { ok: false, started: false, reason: 'port-occupied-by-other', port };
      }

      // Step 3: spawn under a lock so two concurrent processes don't race.
      const lockFd = tryAcquireLock();
      if (lockFd == null) {
        // Someone else is spawning right now — wait briefly for health.
        const h = await waitForHealth(host, port, endpoint, 3000);
        if (h.ok) return { ok: true, started: false, port, raced: true };
        return { ok: false, started: false, reason: 'lock-held' };
      }
      try {
        // Re-check after acquiring lock (another process may have just finished).
        const portOpen2 = await probePort(host, port, 200);
        if (portOpen2) {
          const h = await probeHealth(host, port, endpoint, 400);
          if (h.ok) return { ok: true, started: false, port, raced: true };
        }
        const pid = spawnDaemon({ port, host, pluginRoot });
        const h = await waitForHealth(host, port, endpoint, 6000);
        if (!h.ok) {
          return { ok: false, started: false, pid, reason: 'health-check-failed', port };
        }
        writePidFile({
          pid,
          port,
          host,
          started_at: new Date().toISOString(),
          plugin_root: pluginRoot,
        });
        return { ok: true, started: true, pid, port };
      } finally {
        releaseLock(lockFd);
      }
    } catch (e) {
      return { ok: false, started: false, reason: 'exception: ' + (e && e.message || e) };
    }
  })();
  try { return await _inflight; } finally { _inflight = null; }
}

function getStatus() {
  const info = readPidFile();
  if (!info) return { running: false };
  const alive = isPidAlive(info.pid);
  let uptime_ms = null;
  try { uptime_ms = Date.now() - new Date(info.started_at).getTime(); } catch {}
  return {
    running: alive,
    pid: info.pid,
    port: info.port,
    host: info.host,
    started_at: info.started_at,
    uptime_ms,
    log: logFile(),
    pid_file: pidFile(),
  };
}

async function stopDaemon() {
  const info = readPidFile();
  if (!info) return { ok: true, stopped: false, reason: 'no-pid-file' };
  if (!isPidAlive(info.pid)) {
    removePidFile();
    return { ok: true, stopped: false, reason: 'not-running', pid: info.pid };
  }
  try {
    process.kill(info.pid, 'SIGTERM');
  } catch (e) {
    return { ok: false, stopped: false, reason: 'signal-failed: ' + (e.message || e), pid: info.pid };
  }
  // Wait up to 4s for the process to exit and free the port.
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    if (!isPidAlive(info.pid)) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (isPidAlive(info.pid)) {
    try { process.kill(info.pid, 'SIGKILL'); } catch {}
  }
  removePidFile();
  return { ok: true, stopped: true, pid: info.pid };
}

// Fire-and-forget convenience: schedule on next tick, swallow rejections.
function ensureDashboardRunningAsync(opts) {
  setImmediate(() => {
    Promise.resolve(ensureDashboardRunning(opts)).catch(() => {});
  });
}

module.exports = {
  ensureDashboardRunning,
  ensureDashboardRunningAsync,
  getStatus,
  stopDaemon,
  pidFile,
  logFile,
};
