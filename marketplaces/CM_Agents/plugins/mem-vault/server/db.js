// db.js — SQLite wrapper with schema, FTS5 index, and safe concurrent writes (WAL).
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  // Fatal at use time; surfaced with friendly message.
  Database = null;
}

const paths = require('./paths');

/** Short unique id (24-char base64url). */
function newId() {
  return crypto.randomBytes(18).toString('base64url');
}

/** Open (or create) the per-project vault DB.  Idempotent. */
function open(cwd) {
  if (!Database) {
    throw new Error(
      'mem-vault: better-sqlite3 is not installed.\n' +
        'Run `npm install --prefix "' + paths.pluginRoot() + '"` once, then retry.'
    );
  }

  const dbPath = paths.vaultDbPath(cwd);
  paths.ensureDir(path.dirname(dbPath));
  const db = new Database(dbPath);

  // WAL for concurrent readers + one writer (CC app, CC CLI, Codex all safe).
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  migrate(db);
  ensureProjectMeta(cwd);
  return db;
}

/** Run all pending migrations. */
function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      client     TEXT NOT NULL,           -- claude-code | claude-code-cli | codex | other
      cwd        TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id          TEXT PRIMARY KEY,
      session_id  TEXT NOT NULL,
      title       TEXT NOT NULL,
      summary     TEXT,
      started_at  TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_chapters_session ON chapters(session_id);

    CREATE TABLE IF NOT EXISTS observations (
      id          TEXT PRIMARY KEY,
      chapter_id  TEXT,
      session_id  TEXT,
      ts          TEXT NOT NULL,
      type        TEXT NOT NULL,        -- feature|bugfix|refactor|change|discovery|decision|note|capture
      title       TEXT NOT NULL,
      body        TEXT,
      files       TEXT,                  -- JSON array
      tags        TEXT,                  -- JSON array
      tokens_work INTEGER,
      tokens_read INTEGER,
      FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_obs_session ON observations(session_id);
    CREATE INDEX IF NOT EXISTS idx_obs_chapter ON observations(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_obs_ts      ON observations(ts DESC);
    CREATE INDEX IF NOT EXISTS idx_obs_type    ON observations(type);

    -- Full-text search over title + body + files + tags.
    CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(
      title, body, files, tags,
      content='observations', content_rowid='rowid',
      tokenize='porter unicode61'
    );

    CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN
      INSERT INTO observations_fts(rowid, title, body, files, tags)
      VALUES (new.rowid, new.title, coalesce(new.body,''), coalesce(new.files,''), coalesce(new.tags,''));
    END;
    CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN
      INSERT INTO observations_fts(observations_fts, rowid, title, body, files, tags)
      VALUES ('delete', old.rowid, old.title, coalesce(old.body,''), coalesce(old.files,''), coalesce(old.tags,''));
    END;
    CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN
      INSERT INTO observations_fts(observations_fts, rowid, title, body, files, tags)
      VALUES ('delete', old.rowid, old.title, coalesce(old.body,''), coalesce(old.files,''), coalesce(old.tags,''));
      INSERT INTO observations_fts(rowid, title, body, files, tags)
      VALUES (new.rowid, new.title, coalesce(new.body,''), coalesce(new.files,''), coalesce(new.tags,''));
    END;

    -- Cache of parsed code symbols (smart_outline / smart_unfold).
    CREATE TABLE IF NOT EXISTS symbols (
      file       TEXT NOT NULL,
      mtime      INTEGER NOT NULL,
      lang       TEXT NOT NULL,
      name       TEXT NOT NULL,
      kind       TEXT NOT NULL,
      start_line INTEGER NOT NULL,
      end_line   INTEGER NOT NULL,
      signature  TEXT,
      parent     TEXT,
      PRIMARY KEY(file, name, start_line)
    );
    CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(file);
    CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);

    -- Key-value store for config, migration markers, etc.
    CREATE TABLE IF NOT EXISTS kv (
      k TEXT PRIMARY KEY,
      v TEXT NOT NULL
    );
  `);

  const row = db.prepare('SELECT MAX(version) AS v FROM schema_version').get();
  if (!row || !row.v) {
    db.prepare('INSERT INTO schema_version(version, applied_at) VALUES (?, ?)')
      .run(1, new Date().toISOString());
  }
}

/** Ensure meta.json exists for this project. */
function ensureProjectMeta(cwd) {
  const metaPath = paths.projectMetaPath(cwd);
  if (fs.existsSync(metaPath)) return;
  const meta = {
    cwd: paths.normalizeCwd(cwd),
    slug: paths.projectSlug(cwd),
    created_at: new Date().toISOString(),
    version: 1,
  };
  paths.ensureDir(path.dirname(metaPath));
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
}

// ---- Sessions ----

function startSession(db, { client, cwd, id }) {
  const sid = id || newId();
  db.prepare(`INSERT OR REPLACE INTO sessions(id, client, cwd, started_at) VALUES (?, ?, ?, ?)`)
    .run(sid, client || 'unknown', paths.normalizeCwd(cwd), new Date().toISOString());
  return sid;
}

function endSession(db, sessionId) {
  db.prepare(`UPDATE sessions SET ended_at = ? WHERE id = ?`)
    .run(new Date().toISOString(), sessionId);
}

function currentSession(db, client) {
  const row = db
    .prepare(
      `SELECT id FROM sessions WHERE client = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1`
    )
    .get(client || 'unknown');
  return row && row.id;
}

// ---- Chapters ----

function markChapter(db, { sessionId, title, summary }) {
  const id = newId();
  db.prepare(
    `INSERT INTO chapters(id, session_id, title, summary, started_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, sessionId, title, summary || null, new Date().toISOString());
  return id;
}

// ---- Observations ----

function saveObservation(db, obs) {
  const id = obs.id || newId();
  const ts = obs.ts || new Date().toISOString();
  db.prepare(
    `INSERT INTO observations
       (id, chapter_id, session_id, ts, type, title, body, files, tags, tokens_work, tokens_read)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    obs.chapter_id || null,
    obs.session_id || null,
    ts,
    obs.type || 'note',
    obs.title,
    obs.body || null,
    obs.files ? JSON.stringify(obs.files) : null,
    obs.tags ? JSON.stringify(obs.tags) : null,
    obs.tokens_work || null,
    obs.tokens_read || null
  );
  return id;
}

function getObservation(db, id) {
  const row = db.prepare(`SELECT * FROM observations WHERE id = ?`).get(id);
  if (!row) return null;
  return hydrate(row);
}

function getObservations(db, ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM observations WHERE id IN (${placeholders})`).all(...ids);
  return rows.map(hydrate);
}

function search(db, { query, limit = 20, type }) {
  if (!query) return [];
  // Escape double-quotes in user query for FTS5 phrase safety.
  const q = sanitizeFts(query);
  let sql = `
    SELECT o.*, bm25(observations_fts) AS score
    FROM observations_fts
    JOIN observations o ON o.rowid = observations_fts.rowid
    WHERE observations_fts MATCH ?`;
  const args = [q];
  if (type) {
    sql += ` AND o.type = ?`;
    args.push(type);
  }
  sql += ` ORDER BY score LIMIT ?`;
  args.push(limit);
  const rows = db.prepare(sql).all(...args);
  return rows.map(hydrate);
}

function timeline(db, { limit = 50, since, until, type }) {
  let sql = `SELECT * FROM observations WHERE 1=1`;
  const args = [];
  if (since) { sql += ` AND ts >= ?`; args.push(since); }
  if (until) { sql += ` AND ts <= ?`; args.push(until); }
  if (type)  { sql += ` AND type = ?`; args.push(type); }
  sql += ` ORDER BY ts DESC LIMIT ?`;
  args.push(limit);
  return db.prepare(sql).all(...args).map(hydrate);
}

function recentContext(db, { limit = 15 }) {
  // Quick index of recent observations grouped by day & file.
  const rows = db
    .prepare(
      `SELECT id, ts, type, title, files, tokens_work, tokens_read
         FROM observations ORDER BY ts DESC LIMIT ?`
    )
    .all(limit);
  return rows.map(hydrate);
}

function deleteObservation(db, id) {
  return db.prepare(`DELETE FROM observations WHERE id = ?`).run(id).changes > 0;
}

function purgeProject(db) {
  db.exec(`
    DELETE FROM observations;
    DELETE FROM chapters;
    DELETE FROM sessions;
    DELETE FROM symbols;
    INSERT INTO observations_fts(observations_fts) VALUES('rebuild');
  `);
}

function stats(db) {
  return {
    observations: db.prepare(`SELECT COUNT(*) AS n FROM observations`).get().n,
    chapters: db.prepare(`SELECT COUNT(*) AS n FROM chapters`).get().n,
    sessions: db.prepare(`SELECT COUNT(*) AS n FROM sessions`).get().n,
    symbols: db.prepare(`SELECT COUNT(*) AS n FROM symbols`).get().n,
  };
}

// ---- Symbol cache (for smart_outline / smart_unfold) ----

function cachedSymbols(db, file, mtime) {
  return db.prepare(`SELECT * FROM symbols WHERE file = ? AND mtime = ? ORDER BY start_line`).all(file, mtime);
}

function replaceSymbols(db, file, mtime, lang, symbols) {
  const tx = db.transaction((file, mtime, lang, syms) => {
    db.prepare(`DELETE FROM symbols WHERE file = ?`).run(file);
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO symbols(file, mtime, lang, name, kind, start_line, end_line, signature, parent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const s of syms) {
      stmt.run(file, mtime, lang, s.name, s.kind, s.start_line, s.end_line, s.signature || null, s.parent || null);
    }
  });
  tx(file, mtime, lang, symbols);
}

function symbolSearch(db, { query, limit = 30, lang }) {
  let sql = `SELECT * FROM symbols WHERE name LIKE ?`;
  const args = [`%${query}%`];
  if (lang) { sql += ` AND lang = ?`; args.push(lang); }
  sql += ` ORDER BY name LIMIT ?`;
  args.push(limit);
  return db.prepare(sql).all(...args);
}

// ---- Helpers ----

function hydrate(row) {
  if (!row) return null;
  return {
    ...row,
    files: row.files ? safeParse(row.files) : [],
    tags: row.tags ? safeParse(row.tags) : [],
  };
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return []; }
}

/**
 * Sanitize user query for FTS5 MATCH.
 * Strategy: split into alphanumeric tokens, wrap each in double-quotes,
 * join with AND.  Safe against FTS operators and quotes.
 */
function sanitizeFts(query) {
  const tokens = String(query)
    .match(/[\p{L}\p{N}_]+/gu) || [];
  if (tokens.length === 0) return '""';
  return tokens.map((t) => `"${t}"`).join(' ');
}

module.exports = {
  open,
  newId,
  startSession,
  endSession,
  currentSession,
  markChapter,
  saveObservation,
  getObservation,
  getObservations,
  search,
  timeline,
  recentContext,
  deleteObservation,
  purgeProject,
  stats,
  cachedSymbols,
  replaceSymbols,
  symbolSearch,
};
