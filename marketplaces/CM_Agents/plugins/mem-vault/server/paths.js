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
  const local = path.join(path.resolve(cwd || process.cwd()), '.mem-vault');
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

  const localDir = path.join(path.resolve(cwd || process.cwd()), '.mem-vault');
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
function _resetEnsureCache() { _ensureCache.clear(); }

/** List every project slug that has a vault on disk. */
function listProjects() {
  const root = path.join(vaultRoot(), 'projects');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter((d) => {
    const metaPath = path.join(root, d, 'meta.json');
    return fs.existsSync(metaPath);
  });
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
  grammarsDir,
  listProjects,
};
