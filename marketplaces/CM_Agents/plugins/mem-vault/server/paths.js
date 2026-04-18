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

/** Directory for the project's vault (observations DB + metadata). */
function projectDir(cwd) {
  return path.join(vaultRoot(), 'projects', projectSlug(cwd));
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
  vaultDbPath,
  projectMetaPath,
  ensureDir,
  grammarsDir,
  listProjects,
};
