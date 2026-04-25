// paths.js — resolve vault, project, and plugin paths consistently on Windows/macOS/Linux.
'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/** Root directory of the plugin (contains .claude-plugin, server/, hooks/ ...). */
function pluginRoot() {
  if (process.env.MEM_VAULT_ROOT) return path.resolve(process.env.MEM_VAULT_ROOT);
  // server/paths.js -> ../
  return path.resolve(__dirname, '..');
}

/** Global vault root, shared across all clients.  Windows: %USERPROFILE%\.mem-vault */
function vaultRoot() {
  if (process.env.MEM_VAULT_DATA_DIR) return path.resolve(process.env.MEM_VAULT_DATA_DIR);
  return path.join(os.homedir(), '.mem-vault');
}

/** Normalize a CWD so the same project resolves identically on every client. */
function normalizeCwd(cwd) {
  let p = path.resolve(cwd || process.cwd());
  // Windows: drive letter lowercase + forward slashes
  if (process.platform === 'win32') {
    p = p.replace(/\\/g, '/');
    if (/^[A-Z]:/.test(p)) p = p[0].toLowerCase() + p.slice(1);
  }
  return p;
}

/**
 * Deterministic project slug: `<basename>-<sha1[0..11]>`.
 * Same CWD across Claude Code, CC CLI, and Codex -> same slug -> same vault.
 */
function projectSlug(cwd) {
  const norm = normalizeCwd(cwd);
  const hash = crypto.createHash('sha1').update(norm).digest('hex').slice(0, 12);
  const base = path.basename(norm).toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 32) || 'project';
  return `${base}-${hash}`;
}

/** Legacy global directory for the project's vault.  Used as a fallback. */
function globalProjectDir(cwd) {
  return path.join(vaultRoot(), 'projects', projectSlug(cwd));
}

// Markers that indicate the root of a "project".  Order matters: the first
// matching marker wins.  An existing `.mem-vault/` is the strongest signal
// because it's an exact previous-run match — never walk past it.
const PROJECT_MARKERS = [
  '.mem-vault',
  '.git',
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'go.mod',
  'pom.xml',
  'AGENTS.md',
  'CLAUDE.md',
];

const _findRootCache = new Map(); // key: resolved start dir → resolved project root

/**
 * Walk UP from `startCwd` looking for project markers.  Returns the first
 * directory containing one of `PROJECT_MARKERS`.  Stops at the user's homedir
 * (inclusive — if home itself has a marker we still accept it) and at the
 * filesystem root.  Returns `startCwd` (resolved) unchanged if nothing matches.
 *
 * Cached per resolved start dir for the life of the process.
 */
function findProjectRoot(startCwd) {
  const start = path.resolve(startCwd || process.cwd());
  if (_findRootCache.has(start)) return _findRootCache.get(start);

  const home = path.resolve(os.homedir());
  let dir = start;
  let safety = 64; // hard cap on walk depth

  while (safety-- > 0) {
    // Never treat the user's home as a "project" — even if it has a `.git`
    // (some users init dotfile repos in $HOME) or a legacy global `.mem-vault/`.
    // We stop the walk BEFORE inspecting markers at home so the fallback to
    // `startCwd` kicks in instead.
    if (dir === home) break;
    for (const marker of PROJECT_MARKERS) {
      try {
        if (fs.existsSync(path.join(dir, marker))) {
          _findRootCache.set(start, dir);
          return dir;
        }
      } catch { /* ignore stat errors, keep walking */ }
    }
    const parent = path.dirname(dir);
    if (!parent || parent === dir) break; // filesystem root
    dir = parent;
  }
  _findRootCache.set(start, start);
  return start;
}

function _resetFindRootCache() { _findRootCache.clear(); }

/**
 * Directory for the project's vault (observations DB + metadata).
 *
 * Resolution order (per spec):
 *   1. If MEM_VAULT_DATA_DIR is set → <MEM_VAULT_DATA_DIR>/projects/<slug>
 *      (preserves test-isolation; smoke tests and parity tests rely on it).
 *   2. Else if <cwd>/.mem-vault/ exists → return that (project-local, no slug subdir).
 *   3. Else if a global vault exists at ~/.mem-vault/projects/<slug>/vault.db → use it.
 *   4. Else → return <cwd>/.mem-vault/ (will be created lazily by ensureProjectVault).
 */
function projectDir(cwd) {
  if (process.env.MEM_VAULT_DATA_DIR) return globalProjectDir(cwd);
  const root = findProjectRoot(cwd || process.cwd());
  const local = path.join(root, '.mem-vault');
  const localHasDb = fs.existsSync(path.join(local, 'vault.db'));
  if (localHasDb) return local;
  const global = globalProjectDir(cwd);
  const globalHasDb = fs.existsSync(path.join(global, 'vault.db'));
  if (globalHasDb) return global;
  // Prefer the local dir even if empty (the marker exists) — the next
  // ensureProjectVault call will populate it.  This matches the spec's
  // "one project = one dir" intent.
  if (fs.existsSync(local)) return local;
  return local;
}

/** Path to the SQLite DB for this project. */
function vaultDbPath(cwd) {
  return path.join(projectDir(cwd), 'vault.db');
}

/** Path to the per-project meta.json. */
function projectMetaPath(cwd) {
  return path.join(projectDir(cwd), 'meta.json');
}

/** Ensure a directory exists (idempotent). */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Path where bundled WASM grammars live. */
function grammarsDir() {
  return path.join(pluginRoot(), 'server', 'grammars');
}

// ---- ensureProjectVault: idempotent, cheap, safe to call on every hook fire ----

const _ensureCache = new Map(); // key: normalized cwd → resolved dir

const MIGRATE_FILES = ['vault.db', 'vault.db-wal', 'vault.db-shm', 'meta.json'];

function _copyIfMissing(src, dst) {
  if (!fs.existsSync(src)) return 0;
  if (fs.existsSync(dst)) return 0;
  fs.copyFileSync(src, dst);
  try { return fs.statSync(dst).size; } catch { return 0; }
}

function _copyDirIfMissing(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) return 0;
  let bytes = 0;
  fs.mkdirSync(dstDir, { recursive: true });
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(dstDir, ent.name);
    if (ent.isDirectory()) bytes += _copyDirIfMissing(s, d);
    else if (ent.isFile()) bytes += _copyIfMissing(s, d);
  }
  return bytes;
}

/**
 * Resolve (and lazily create) the project vault directory for `cwd`.
 * Idempotent and cached per cwd.  Honors:
 *   - MEM_VAULT_DATA_DIR env (test mode): never auto-creates a local dir.
 *   - settings.enabled === false: do NOT auto-create.
 *   - settings.auto_create_project_vault === false: do NOT auto-create; fall back
 *     to the global slug dir so legacy users keep working.
 *
 * On first creation of a local dir, transparently copies any pre-existing global
 * vault (vault.db/-wal/-shm, meta.json, cache/) so the user keeps their history.
 *
 * Returns the absolute path to the chosen project vault directory.
 */
function ensureProjectVault(cwd, opts = {}) {
  const norm = normalizeCwd(cwd);
  if (_ensureCache.has(norm)) return _ensureCache.get(norm);

  // Test mode: honor MEM_VAULT_DATA_DIR exactly; just ensure the dir exists.
  if (process.env.MEM_VAULT_DATA_DIR) {
    const d = globalProjectDir(cwd);
    fs.mkdirSync(d, { recursive: true });
    _ensureCache.set(norm, d);
    return d;
  }

  // Lazy load settings (avoid require cycle if called during paths.js load).
  let settings = opts.settings;
  if (!settings) {
    try { settings = require('./settings').loadSettings(cwd); } catch { settings = {}; }
  }

  const root = findProjectRoot(cwd || process.cwd());
  const localDir = path.join(root, '.mem-vault');
  const globalDir = globalProjectDir(cwd);
  const globalDb = path.join(globalDir, 'vault.db');
  const localExists = fs.existsSync(localDir);
  const localDbExists = fs.existsSync(path.join(localDir, 'vault.db'));
  const globalDbExists = fs.existsSync(globalDb);

  // Disabled or auto-create off → never create new dirs.
  const disabled = settings.enabled === false;
  const autoCreate = settings.auto_create_project_vault !== false;

  if (disabled || !autoCreate) {
    // Use whatever already has a vault DB; don't create or migrate anything.
    // Prefer local DB → global DB → local marker dir → global slug fallback.
    let chosen;
    if (localDbExists) chosen = localDir;
    else if (globalDbExists) chosen = globalDir;
    else if (localExists) chosen = localDir;
    else chosen = globalDir; // legacy fallback path; db.open will mkdir under it
    _ensureCache.set(norm, chosen);
    try { upsertProject({ cwd, vaultDir: chosen }); } catch {}
    return chosen;
  }

  // Auto-create local dir if it doesn't exist (and we're allowed to).
  if (!localExists) {
    fs.mkdirSync(localDir, { recursive: true });
    _writeMarkerFiles(localDir);
  }

  // If the local dir has no DB yet but a global vault exists, migrate it.
  if (!localDbExists && globalDbExists) {
    let bytes = 0;
    for (const f of MIGRATE_FILES) {
      bytes += _copyIfMissing(path.join(globalDir, f), path.join(localDir, f));
    }
    bytes += _copyDirIfMissing(path.join(globalDir, 'cache'), path.join(localDir, 'cache'));
    if (bytes > 0 && (settings.log_verbosity || 'info') !== 'silent') {
      try {
        process.stderr.write(
          `[mem-vault] migrated ${bytes} bytes from ${globalDir} → ${localDir}\n`
        );
      } catch {}
    }
  }

  _ensureCache.set(norm, localDir);
  // Upsert into the project registry so the dashboard / other clients can
  // discover this vault even though it lives outside ~/.mem-vault/projects/.
  try { upsertProject({ cwd, vaultDir: localDir }); } catch {}
  return localDir;
}

function _writeMarkerFiles(localDir) {
  const gi = path.join(localDir, '.gitignore');
  if (!fs.existsSync(gi)) {
    fs.writeFileSync(gi, '*\n!.gitignore\n!README.md\n', 'utf8');
  }
  const rd = path.join(localDir, 'README.md');
  if (!fs.existsSync(rd)) {
    fs.writeFileSync(
      rd,
      'This directory holds this project\'s mem-vault memory store. ' +
        'Safe to delete to reset memory. Do not commit `vault.db` (or `*.db-wal` / `*.db-shm`) — ' +
        'they are private per-developer state. The bundled `.gitignore` already excludes them.\n',
      'utf8'
    );
  }
}

/** Test helper — reset the per-cwd cache. */
function _resetEnsureCache() { _ensureCache.clear(); _findRootCache.clear(); }

/** List every project slug that has a vault on disk. */
function listProjects() {
  const root = path.join(vaultRoot(), 'projects');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter((d) => {
    const metaPath = path.join(root, d, 'meta.json');
    return fs.existsSync(metaPath);
  });
}

// ----------------- Project registry -----------------
//
// `~/.mem-vault/registry.json` is a single canonical index of every project
// vault the plugin knows about (local OR global).  The dashboard, MCP server,
// and CLI all read & write through this so newly-migrated project-local vaults
// are visible everywhere instead of being shadowed by a stale global vault.

function registryPath() {
  return path.join(vaultRoot(), 'registry.json');
}

function _registryLockPath() {
  return path.join(vaultRoot(), 'registry.lock');
}

function _emptyRegistry() {
  return { version: 1, projects: [] };
}

function loadRegistry() {
  const p = registryPath();
  if (!fs.existsSync(p)) return _emptyRegistry();
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!obj || typeof obj !== 'object') return _emptyRegistry();
    if (!Array.isArray(obj.projects)) obj.projects = [];
    if (!obj.version) obj.version = 1;
    return obj;
  } catch {
    return _emptyRegistry();
  }
}

function _acquireRegistryLock() {
  const lock = _registryLockPath();
  ensureDir(path.dirname(lock));
  const STALE_MS = 5000;
  const start = Date.now();
  while (Date.now() - start < 6000) {
    try {
      const fd = fs.openSync(lock, 'wx');
      try { fs.writeSync(fd, String(process.pid)); } catch {}
      fs.closeSync(fd);
      return lock;
    } catch (err) {
      // Steal stale lock.
      try {
        const st = fs.statSync(lock);
        if (Date.now() - st.mtimeMs > STALE_MS) {
          try { fs.unlinkSync(lock); } catch {}
          continue;
        }
      } catch {}
      // Brief spin
      const until = Date.now() + 50;
      while (Date.now() < until) { /* busy wait */ }
    }
  }
  return null; // give up; write best-effort without lock
}

function _releaseRegistryLock(lock) {
  if (!lock) return;
  try { fs.unlinkSync(lock); } catch {}
}

function saveRegistry(reg) {
  const p = registryPath();
  ensureDir(path.dirname(p));
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(reg, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

/**
 * Upsert a project entry into the registry.  Updates `vault_dir`, `vault_db`,
 * `cwd`, and `last_seen`.  Preserves `created_at` if already present.
 */
function upsertProject({ cwd, vaultDir, title }) {
  if (process.env.MEM_VAULT_DATA_DIR) return; // test mode: stay isolated
  let lock = null;
  try {
    lock = _acquireRegistryLock();
    const reg = loadRegistry();
    const slug = projectSlug(cwd);
    const norm = normalizeCwd(cwd);
    const dir = vaultDir || projectDir(cwd);
    const dbPath = path.join(dir, 'vault.db');
    const now = new Date().toISOString();
    const existing = reg.projects.find((p) => p.slug === slug);
    if (existing) {
      existing.cwd = norm;
      existing.vault_dir = dir.replace(/\\/g, '/');
      existing.vault_db = dbPath.replace(/\\/g, '/');
      existing.last_seen = now;
      if (title) existing.title = title;
      if (!existing.created_at) existing.created_at = now;
    } else {
      reg.projects.push({
        slug,
        cwd: norm,
        title: title || path.basename(norm),
        vault_dir: dir.replace(/\\/g, '/'),
        vault_db: dbPath.replace(/\\/g, '/'),
        last_seen: now,
        created_at: now,
      });
    }
    saveRegistry(reg);
  } catch (_) {
    /* never block callers on registry write failure */
  } finally {
    _releaseRegistryLock(lock);
  }
}

/**
 * Hydrate the registry with any global project slugs not yet listed
 * (back-compat for setups that predate the registry).  Also performs
 * stale-global retirement: when a slug has BOTH a local vault and a
 * global vault and the local is materially newer (>60s), the global
 * `vault.db` is renamed to `vault.db.legacy` and the registry points
 * at the local.
 *
 * Cheap and idempotent — safe to call on every server start.
 */
function hydrateRegistry(opts = {}) {
  if (process.env.MEM_VAULT_DATA_DIR) return { added: 0, retired: 0 };
  const log = opts.log === false ? () => {} : (msg) => {
    try { process.stderr.write(msg + '\n'); } catch {}
  };
  let lock = null;
  let added = 0;
  let retired = 0;
  let DatabaseCtor;
  try { DatabaseCtor = require('better-sqlite3'); } catch { DatabaseCtor = null; }

  function readLastTs(dbPath) {
    if (!DatabaseCtor || !fs.existsSync(dbPath)) return null;
    let d;
    try {
      d = new DatabaseCtor(dbPath, { readonly: true, fileMustExist: true });
      d.pragma('busy_timeout = 1500');
      const r = d.prepare('SELECT ts FROM observations ORDER BY ts DESC LIMIT 1').get();
      return r ? r.ts : null;
    } catch { return null; }
    finally { try { d && d.close(); } catch {} }
  }

  try {
    lock = _acquireRegistryLock();
    const reg = loadRegistry();
    const bySlug = new Map(reg.projects.map((p) => [p.slug, p]));
    const globalRoot = path.join(vaultRoot(), 'projects');

    if (fs.existsSync(globalRoot)) {
      for (const slug of fs.readdirSync(globalRoot)) {
        const gDir = path.join(globalRoot, slug);
        const gDb = path.join(gDir, 'vault.db');
        const gMeta = path.join(gDir, 'meta.json');
        let meta = {};
        try { meta = JSON.parse(fs.readFileSync(gMeta, 'utf8')); } catch {}

        const cwdHint = meta.cwd || null;
        const titleHint = cwdHint ? path.basename(cwdHint) : slug;

        // Determine the local dir for this project (if cwd is known + still exists).
        let localDir = null, localDb = null, localExists = false;
        if (cwdHint && fs.existsSync(cwdHint)) {
          try {
            const root = findProjectRoot(cwdHint);
            localDir = path.join(root, '.mem-vault');
            localDb = path.join(localDir, 'vault.db');
            localExists = fs.existsSync(localDb);
          } catch {}
        }

        const globalExists = fs.existsSync(gDb);

        // Divergence: both local + global exist; pick the newer.
        let chosenDir = gDir;
        if (localExists && globalExists) {
          const lTs = readLastTs(localDb);
          const gTs = readLastTs(gDb);
          const lMs = lTs ? Date.parse(lTs) : 0;
          const gMs = gTs ? Date.parse(gTs) : 0;
          if (lMs && gMs && lMs - gMs > 60_000) {
            // Retire the stale global.
            const legacy = gDb + '.legacy';
            try {
              if (!fs.existsSync(legacy)) {
                fs.renameSync(gDb, legacy);
                // Also retire the wal/shm so SQLite doesn't get confused.
                for (const ext of ['-wal', '-shm']) {
                  const f = gDb + ext;
                  if (fs.existsSync(f)) {
                    try { fs.renameSync(f, legacy + ext); } catch {}
                  }
                }
                const deltaMs = lMs - gMs;
                log(`[mem-vault] retired stale global vault for ${slug} (local is ${Math.round(deltaMs/1000)}s newer) -> ${legacy.replace(/\\/g,'/')}`);
                retired++;
              }
            } catch (e) {
              log(`[mem-vault] failed to retire stale global for ${slug}: ${e.message || e}`);
            }
            chosenDir = localDir;
          } else if (lMs >= gMs) {
            chosenDir = localDir;
          } else {
            log(`[mem-vault] divergence detected for ${slug}: local=${lTs} global=${gTs}; using global`);
          }
        } else if (localExists) {
          chosenDir = localDir;
        }

        const entry = bySlug.get(slug);
        const dbPath = path.join(chosenDir, 'vault.db');
        if (!entry) {
          reg.projects.push({
            slug,
            cwd: cwdHint ? normalizeCwd(cwdHint) : null,
            title: titleHint,
            vault_dir: chosenDir.replace(/\\/g, '/'),
            vault_db: dbPath.replace(/\\/g, '/'),
            last_seen: meta.created_at || new Date().toISOString(),
            created_at: meta.created_at || new Date().toISOString(),
          });
          added++;
        } else {
          // Reflect retirement / divergence resolution into existing entry.
          entry.vault_dir = chosenDir.replace(/\\/g, '/');
          entry.vault_db = dbPath.replace(/\\/g, '/');
          if (!entry.cwd && cwdHint) entry.cwd = normalizeCwd(cwdHint);
          if (!entry.title) entry.title = titleHint;
        }
      }
    }
    saveRegistry(reg);
  } catch (_) {
    /* best-effort */
  } finally {
    _releaseRegistryLock(lock);
  }
  return { added, retired };
}

module.exports = {
  pluginRoot,
  vaultRoot,
  normalizeCwd,
  projectSlug,
  projectDir,
  globalProjectDir,
  vaultDbPath,
  projectMetaPath,
  ensureDir,
  ensureProjectVault,
  _resetEnsureCache,
  _resetFindRootCache,
  findProjectRoot,
  PROJECT_MARKERS,
  grammarsDir,
  listProjects,
  registryPath,
  loadRegistry,
  saveRegistry,
  upsertProject,
  hydrateRegistry,
};
