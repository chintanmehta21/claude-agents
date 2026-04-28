// prefetch.js — derive a mem-vault search query from a user prompt or tool input,
// run a focused FTS5 search, and format the hits as a compact bulleted hint.
// Used by:
//   * hooks/userpromptsubmit-prefetch.js  (UserPromptSubmit hook)
//   * hooks/pretooluse-hint.js            (PreToolUse hook)
//   * server/index.js prefetch --prompt … (CLI subcommand, also driven by hook #1)
//   * server/mcp.js  recall_for_query     (Codex parity tool)
'use strict';

const path = require('path');
const fs = require('fs');

const HIGH_VALUE_TYPES = ['decision', 'bugfix', 'feature', 'discovery', 'refactor'];

// Filler words to strip when extracting query terms from a free-text prompt.
const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','then','else','for','to','of','in','on',
  'at','by','with','about','as','is','are','was','were','be','been','being',
  'do','does','did','done','have','has','had','having','can','could','should',
  'would','will','shall','may','might','must','i','you','we','they','it','this',
  'that','these','those','my','your','our','their','its','what','which','who',
  'whom','whose','where','when','why','how','please','let','me','us','some',
  'any','all','no','not','out','up','down','from','into','over','under','again',
  'so','than','also','just','only','very','more','most','too','here','there',
]);

/**
 * Extract a short FTS5-friendly query from a free-text prompt.
 * Returns a plain string of space-separated tokens (db.search will sanitize
 * them into FTS phrases). Empty string if no useful terms found.
 */
function extractQuery(prompt, opts = {}) {
  const max = opts.maxTerms || 8;
  const text = String(prompt || '');
  if (!text.trim()) return '';
  // Split on non-word, but keep dotted/dashed identifiers like "foo.bar" or
  // "auto-refresh" as single tokens by first protecting them.
  const protectedText = text
    .replace(/([A-Za-z0-9_])[.\-/]([A-Za-z0-9_])/g, '$1$2');
  const raw = protectedText.match(/[\p{L}\p{N}_]+/gu) || [];
  const seen = new Set();
  const out = [];
  for (let tok of raw) {
    tok = tok.replace(//g, '_');
    const lc = tok.toLowerCase();
    if (lc.length < 3) continue;
    if (STOPWORDS.has(lc)) continue;
    if (/^\d+$/.test(lc) && lc.length < 4) continue;
    if (seen.has(lc)) continue;
    seen.add(lc);
    out.push(tok);
    if (out.length >= max) break;
  }
  return out.join(' ');
}

/** Extract a query from a PreToolUse payload's tool_input. */
function extractQueryFromToolInput(toolName, toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return '';
  const name = String(toolName || '');
  if (name === 'Grep' || name === 'Glob') {
    return extractQuery(String(toolInput.pattern || ''), { maxTerms: 6 });
  }
  if (name === 'Read') {
    const fp = String(toolInput.file_path || '');
    // Use just the basename (without extension) as the query — that's the most
    // distinctive token and matches how observations reference files.
    const base = path.basename(fp).replace(/\.[A-Za-z0-9]+$/, '');
    return extractQuery(base, { maxTerms: 4 });
  }
  if (name === 'Bash') {
    const cmd = String(toolInput.command || '');
    // Pull substrings after grep/rg/find -name, ignore flags.
    const m =
      cmd.match(/\b(?:grep|rg|egrep|fgrep)\b[^|;&]*?(?:["']([^"']{2,80})["']|(\S{3,80}))/) ||
      cmd.match(/\bfind\b[^|;&]*-name\s+["']?([^"'\s]{3,80})["']?/);
    if (m) return extractQuery(m[1] || m[2] || '', { maxTerms: 6 });
    return '';
  }
  return '';
}

/**
 * Run a prefetch search against the project vault.
 * Returns { query, results: [...], recent: [...] }.
 *
 * The search filters to high-value types only; `recent` is a separate
 * recent_context fetch for general orientation when the user prompt is the
 * trigger (omitted for PreToolUse calls — pass opts.recent=false).
 */
function runPrefetch({ cwd, prompt, query, limit = 5, recent = true, settings } = {}) {
  const db = require('./db');
  const paths = require('./paths');
  if (!cwd) cwd = process.cwd();

  const q = (query || extractQuery(prompt) || '').trim();
  const out = { query: q, results: [], recent: [] };
  if (!q) return out;

  const dbFile = paths.vaultDbPath(cwd);
  if (!fs.existsSync(dbFile)) return out;

  let d;
  try { d = db.open(cwd); } catch { return out; }

  // Run one search per high-value type (FTS doesn't support OR-of-types in a
  // single MATCH cleanly), then merge by score, dedupe, and take top N.
  const merged = new Map();
  for (const t of HIGH_VALUE_TYPES) {
    let rows = [];
    try { rows = db.search(d, { query: q, limit, type: t }); } catch {}
    for (const r of rows) {
      if (!merged.has(r.id)) merged.set(r.id, r);
    }
  }
  // Also include any-type matches if we still have headroom — useful when the
  // user asks about a `note` or `change` we captured.
  if (merged.size < limit) {
    let any = [];
    try { any = db.search(d, { query: q, limit: limit * 2 }); } catch {}
    for (const r of any) {
      if (!merged.has(r.id)) merged.set(r.id, r);
      if (merged.size >= limit) break;
    }
  }
  out.results = Array.from(merged.values())
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, limit);

  if (recent) {
    try { out.recent = db.recentContext(d, { limit: 5 }); } catch {}
  }
  return out;
}

/** Format prefetch results as a compact additionalContext block. */
function formatHint({ results, recent, query, mode = 'prompt' } = {}) {
  const lines = [];
  const r = Array.isArray(results) ? results : [];
  if (r.length === 0 && (!recent || recent.length === 0)) return '';

  if (mode === 'tool') {
    lines.push(
      `[mem-vault] Prior memory matches what you're about to search for (query: ${query || '?'}):`
    );
  } else {
    lines.push(
      `[mem-vault] ${r.length} prior observation${r.length === 1 ? '' : 's'} match your prompt — read these BEFORE searching/grepping:`
    );
  }
  for (const o of r) {
    lines.push(formatLine(o));
  }
  if (mode === 'prompt' && recent && recent.length) {
    lines.push('');
    lines.push(`Most recent activity (${recent.length}):`);
    for (const o of recent) {
      lines.push(formatLine(o, { showType: true }));
    }
  }
  if (mode === 'tool') {
    lines.push('Consider if this answers your question before continuing.');
  }
  return lines.join('\n');
}

function formatLine(o) {
  const type = o.type || 'note';
  const date = (o.ts || '').slice(0, 10);
  let title = String(o.title || '').replace(/\s+/g, ' ').trim();
  // Pull first file:line if any.
  let suffix = '';
  if (Array.isArray(o.files) && o.files.length) {
    const f = String(o.files[0]).replace(/\\/g, '/');
    const short = f.length > 80 ? '…' + f.slice(-79) : f;
    suffix = ` — ${short}`;
  }
  let line = `- [${type} ${date}] ${title}${suffix}`;
  if (line.length > 200) line = line.slice(0, 197) + '...';
  return line;
}

module.exports = {
  HIGH_VALUE_TYPES,
  extractQuery,
  extractQueryFromToolInput,
  runPrefetch,
  formatHint,
};
