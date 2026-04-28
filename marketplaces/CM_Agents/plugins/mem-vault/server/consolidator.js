// consolidator.js — periodic background pass that groups noisy
// `capture`/`change` observations from the last N hours into a single
// high-signal `discovery` / `refactor` / `feature` summary observation.
//
// Idempotent: a `consolidations` row marks each (project, window-end) pair
// so re-running on overlapping windows won't double-create summaries.
'use strict';

const path = require('path');
const fs = require('fs');

const db = require('./db');
const paths = require('./paths');
const { loadSettings } = require('./settings');

function ensureConsolidationTable(d) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS consolidations (
      id          TEXT PRIMARY KEY,
      run_at      TEXT NOT NULL,
      window_from TEXT NOT NULL,
      window_to   TEXT NOT NULL,
      group_key   TEXT NOT NULL,
      summary_id  TEXT NOT NULL,
      source_ids  TEXT NOT NULL,
      UNIQUE(window_from, window_to, group_key)
    );
    CREATE INDEX IF NOT EXISTS idx_consolidations_runat ON consolidations(run_at DESC);
  `);
}

function fileGroupKey(files) {
  if (!files || files.length === 0) return null;
  const f = String(files[0]).replace(/\\/g, '/');
  return 'file:' + f;
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return []; }
}

/**
 * Group observations into candidates by file (consecutive edits) and
 * by bash kind (test runs).
 */
function groupObservations(rows) {
  const fileGroups = new Map();
  const bashTests = [];
  const sequences = [];

  for (const o of rows) {
    const tags = parseTags(o.tags);
    const files = Array.isArray(o.files) ? o.files : (o.files ? JSON.parse(o.files) : []);
    if ((o.type === 'change' || o.type === 'capture') && files.length > 0) {
      const k = fileGroupKey(files);
      if (k) {
        if (!fileGroups.has(k)) fileGroups.set(k, []);
        fileGroups.get(k).push(o);
      }
    }
    if (o.type === 'capture' && tags.includes('test')) {
      bashTests.push(o);
    }
  }

  // Build sequences: window of capture+change interleaved on same file across <30 min.
  const byTime = rows.slice().sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  let cur = [];
  for (const o of byTime) {
    if (cur.length === 0) { cur.push(o); continue; }
    const last = cur[cur.length - 1];
    const dt = (new Date(o.ts) - new Date(last.ts));
    if (dt < 30 * 60 * 1000) cur.push(o);
    else {
      if (cur.length >= 4) sequences.push(cur);
      cur = [o];
    }
  }
  if (cur.length >= 4) sequences.push(cur);

  return { fileGroups, bashTests, sequences };
}

function buildSummaryFromFileGroup(file, items) {
  const fileShort = file.replace(/^file:/, '').split(/[\\/]/).slice(-2).join('/');
  const title = `Refactor session: ${fileShort} (${items.length} edits)`;
  const sourceIds = items.map((i) => i.id);
  const body = [
    `WHY: Multiple consecutive edits to ${fileShort} in window.`,
    `WHAT: ${items.length} edit/change captures grouped into one summary.`,
    `FOR-LATER-SEARCH: refactor, ${fileShort}`,
    `SOURCE_IDS: ${sourceIds.join(', ')}`,
  ].join('\n');
  return { type: 'refactor', title, body, tags: ['consolidated', 'refactor'], files: [file.replace(/^file:/, '')], source_ids: sourceIds };
}

function buildSummaryFromBashTests(items) {
  const sourceIds = items.map((i) => i.id);
  const title = `Test suite activity: ${items.length} runs`;
  const body = [
    `WHY: Repeated test invocations recorded in window.`,
    `WHAT: ${items.length} test-related Bash captures collapsed.`,
    `FOR-LATER-SEARCH: tests, suite, ${items.length} runs`,
    `SOURCE_IDS: ${sourceIds.join(', ')}`,
  ].join('\n');
  return { type: 'discovery', title, body, tags: ['consolidated', 'tests'], source_ids: sourceIds };
}

function buildSummaryFromSequence(items) {
  const sourceIds = items.map((i) => i.id);
  const title = `Investigation session: ${items.length} steps (${(items[0].title || '').slice(0, 40)}…)`;
  const body = [
    `WHY: Problem-solving sequence detected (capture+edit interleave).`,
    `WHAT: ${items.length} ordered steps, span ${items[0].ts} → ${items[items.length - 1].ts}.`,
    `FOR-LATER-SEARCH: session, sequence`,
    `SOURCE_IDS: ${sourceIds.join(', ')}`,
  ].join('\n');
  return { type: 'discovery', title, body, tags: ['consolidated', 'session'], source_ids: sourceIds };
}

/**
 * Run a single project's consolidation pass.
 */
function consolidateProject(cwd, opts = {}) {
  const settings = loadSettings(cwd);
  const windowHours = Number(opts.windowHours || settings.consolidator_window_hours || 24);
  const dryRun = !!opts.dryRun;

  const dbPath = paths.vaultDbPath(cwd);
  if (!fs.existsSync(dbPath)) return { cwd, skipped: 'no-vault' };

  const d = db.open(cwd);
  ensureConsolidationTable(d);

  // Round window endpoints down to the hour so re-runs within the same hour are idempotent.
  const HOUR = 3600 * 1000;
  const untilMs = Math.floor(Date.now() / HOUR) * HOUR;
  const sinceMs = untilMs - windowHours * HOUR;
  const sinceIso = new Date(sinceMs).toISOString();
  const untilIso = new Date(untilMs).toISOString();

  const rows = d.prepare(`
    SELECT * FROM observations
    WHERE ts >= ? AND ts <= ?
      AND (type = 'capture' OR type = 'change')
    ORDER BY ts ASC
  `).all(sinceIso, untilIso).map((r) => ({
    ...r,
    files: r.files ? safe(r.files) : [],
    tags: r.tags ? safe(r.tags) : [],
  }));

  const { fileGroups, bashTests, sequences } = groupObservations(rows);

  const proposed = [];
  for (const [k, items] of fileGroups.entries()) {
    if (items.length > 3) proposed.push({ key: k, summary: buildSummaryFromFileGroup(k, items) });
  }
  if (bashTests.length > 3) {
    proposed.push({ key: 'bash:tests', summary: buildSummaryFromBashTests(bashTests) });
  }
  for (let i = 0; i < sequences.length; i++) {
    if (sequences[i].length >= 4) {
      proposed.push({ key: 'seq:' + i + ':' + sequences[i][0].id, summary: buildSummaryFromSequence(sequences[i]) });
    }
  }

  const created = [];
  if (!dryRun) {
    const insertRecord = d.prepare(
      `INSERT OR IGNORE INTO consolidations (id, run_at, window_from, window_to, group_key, summary_id, source_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const p of proposed) {
      const exists = d.prepare(
        `SELECT id FROM consolidations WHERE window_from = ? AND window_to = ? AND group_key = ?`
      ).get(sinceIso, untilIso, p.key);
      if (exists) continue;
      const sid = db.currentSession(d, 'consolidator') || db.startSession(d, { client: 'consolidator', cwd });
      const summaryId = db.saveObservation(d, {
        session_id: sid,
        type: p.summary.type,
        title: p.summary.title,
        body: p.summary.body,
        files: p.summary.files || [],
        tags: p.summary.tags,
      });
      // Tag source observations as consolidated.
      const tagStmt = d.prepare(`UPDATE observations SET tags = ? WHERE id = ?`);
      for (const srcId of p.summary.source_ids) {
        const r = d.prepare(`SELECT tags FROM observations WHERE id = ?`).get(srcId);
        if (!r) continue;
        const tags = r.tags ? safe(r.tags) : [];
        if (!tags.includes('consolidated_into:' + summaryId)) {
          tags.push('consolidated_into:' + summaryId);
          tagStmt.run(JSON.stringify(tags), srcId);
        }
      }
      const recId = db.newId();
      insertRecord.run(recId, new Date().toISOString(), sinceIso, untilIso, p.key, summaryId, JSON.stringify(p.summary.source_ids));
      created.push({ summary_id: summaryId, type: p.summary.type, title: p.summary.title, sources: p.summary.source_ids.length });
    }
  }

  // Persist last-run marker.
  d.prepare(`INSERT OR REPLACE INTO kv(k, v) VALUES (?, ?)`)
    .run('consolidator_last_run', JSON.stringify({
      ts: new Date().toISOString(),
      window_from: sinceIso,
      window_to: untilIso,
      proposed: proposed.length,
      created: created.length,
      dry_run: dryRun,
    }));

  return {
    cwd,
    window_from: sinceIso,
    window_to: untilIso,
    candidates_observed: rows.length,
    groups_proposed: proposed.length,
    summaries_created: created.length,
    proposed: dryRun ? proposed.map((p) => ({ key: p.key, type: p.summary.type, title: p.summary.title, sources: p.summary.source_ids.length })) : undefined,
    created: dryRun ? undefined : created,
  };
}

function safe(s) { try { return JSON.parse(s); } catch { return []; } }

/**
 * Iterate every project in the registry and consolidate each.
 */
function consolidateAll(opts = {}) {
  const reg = paths.loadRegistry();
  const summary = { ts: new Date().toISOString(), projects: [] };
  for (const p of (reg.projects || [])) {
    const cwd = p.cwd;
    if (!cwd) continue;
    try {
      const r = consolidateProject(cwd, opts);
      summary.projects.push(r);
    } catch (e) {
      summary.projects.push({ cwd, error: String(e.message || e) });
    }
  }
  return summary;
}

/**
 * Read last-run marker for `doctor`.
 */
function lastRunFor(cwd) {
  const dbPath = paths.vaultDbPath(cwd);
  if (!fs.existsSync(dbPath)) return null;
  try {
    const d = db.open(cwd);
    ensureConsolidationTable(d);
    const r = d.prepare(`SELECT v FROM kv WHERE k = 'consolidator_last_run'`).get();
    return r ? JSON.parse(r.v) : null;
  } catch { return null; }
}

module.exports = { consolidateProject, consolidateAll, lastRunFor };
