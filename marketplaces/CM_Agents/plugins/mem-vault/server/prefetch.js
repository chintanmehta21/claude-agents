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

// Filler / structural stopwords.
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

// Conversational filler and low-signal verbs that pollute FTS results.
const CONVERSATIONAL = new Set([
  'hey','hi','hello','please','thanks','thank','still','ffs','wtf','damn',
  'fix','fixed','broken','works','working','doesnt','dont','cant','wont',
  'show','tell','give','need','want','make','get','got','gonna','wanna',
  'ok','okay','yeah','yes','sure','maybe','really','actually','basically',
  'bug','bugs','issue','problem','error','wrong','bad','good','nice','great',
  'thing','stuff','something','anything','nothing','everything',
  'now','today','tomorrow','yesterday','soon','later','before','after',
  'handle','handled','handling',
  // Feature/intent verbs — they're noise for FTS, the noun phrase carries signal.
  'implement','implements','implemented','implementing',
  'add','added','adding','create','created','creating','build','built','building',
  'introduce','introduced','support','supported','enable','enabled',
]);

// Ring buffer of recent extractions (surfaced via doctor).
const _extractDebug = [];
function recordExtractDebug(prompt, result) {
  _extractDebug.push({
    ts: new Date().toISOString(),
    prompt: String(prompt || '').slice(0, 200),
    terms: result.terms,
    reason: result.reason,
  });
  while (_extractDebug.length > 10) _extractDebug.shift();
}
function getExtractDebug() { return _extractDebug.slice(); }

/**
 * Smart entity-aware extraction.
 * Returns { terms: string[], reason: string }.
 */
function extractQueryStructured(prompt, opts = {}) {
  const max = opts.maxTerms || 8;
  const text = String(prompt || '');
  if (!text.trim()) {
    const r = { terms: [], reason: 'empty' };
    return r;
  }

  // 1. Negation handling — collect terms NOT to include.
  const negated = new Set();
  const negPatterns = [
    /\bwithout\s+([A-Za-z_][\w./-]*)/gi,
    /\bdon['’]?t\s+(?:use|include|touch|change|modify)\s+([A-Za-z_][\w./-]*)/gi,
    /\bno\s+([A-Za-z_][\w./-]{2,})/gi,
  ];
  for (const re of negPatterns) {
    let m;
    while ((m = re.exec(text)) !== null) negated.add(m[1].toLowerCase());
  }

  // 2. Entity extraction (high-weight).
  const entities = [];
  const seen = new Set();
  const push = (tok) => {
    if (!tok) return;
    const lc = tok.toLowerCase();
    if (negated.has(lc)) return;
    if (CONVERSATIONAL.has(lc) || STOPWORDS.has(lc)) return;
    if (seen.has(lc)) return;
    seen.add(lc);
    entities.push(tok);
  };

  let m;
  // Quoted phrases.
  const quoteRe = /["'`]([^"'`\n]{2,80})["'`]/g;
  while ((m = quoteRe.exec(text)) !== null) {
    const inner = m[1].match(/[\p{L}\p{N}_]+/gu) || [];
    for (const t of inner) if (t.length >= 3) push(t);
  }
  // File paths with extensions.
  const pathRe = /\b([\w./-]+\.[A-Za-z]{1,6})\b/g;
  while ((m = pathRe.exec(text)) !== null) {
    push(m[1]);
    const base = m[1].split(/[\\/]/).pop().replace(/\.[A-Za-z0-9]+$/, '');
    if (base && base.length >= 3) push(base);
  }
  // Function-call style: foo(), bar.baz()
  const callRe = /\b([A-Za-z_][\w.]*)\s*\(/g;
  while ((m = callRe.exec(text)) !== null) push(m[1]);
  // snake_case (>=2 segments).
  const snakeRe = /\b([A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+)\b/g;
  while ((m = snakeRe.exec(text)) !== null) push(m[1]);
  // CamelCase identifiers.
  const camelRe = /\b([A-Z][a-z]+(?:[A-Z][a-z0-9]*)+)\b/g;
  while ((m = camelRe.exec(text)) !== null) push(m[1]);
  // kebab-case (>=2 segments).
  const kebabRe = /\b([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\b/g;
  while ((m = kebabRe.exec(text)) !== null) push(m[1]);

  // 3. Content words: any non-stop/non-filler token >=4 chars or capitalized.
  // Merge with entities so "Apostrophes ... quotes ... text_polish" all survive.
  const tokens = text.match(/[\p{L}\p{N}_]+/gu) || [];
  for (const tok of tokens) {
    const lc = tok.toLowerCase();
    if (lc.length < 4) continue;
    if (STOPWORDS.has(lc) || CONVERSATIONAL.has(lc)) continue;
    if (negated.has(lc)) continue;
    if (/^\d+$/.test(lc)) continue;
    if (seen.has(lc)) continue;
    push(tok);
  }

  if (entities.length > 0) {
    const reason = (entities.length === 1 && tokens.length > 1) ? 'entity+content' : 'entity-based';
    return { terms: entities.slice(0, max), reason };
  }
  return { terms: [], reason: 'no-signal' };
}

/**
 * Public string-returning wrapper. Empty string on no signal so callers can skip search.
 */
function extractQuery(prompt, opts = {}) {
  const r = extractQueryStructured(prompt, opts);
  try { recordExtractDebug(prompt, r); } catch {}
  return r.terms.join(' ');
}

/** Legacy permissive extractor — used as last-resort fallback if FTS returns 0 hits. */
function extractQueryLegacy(prompt, opts = {}) {
  const max = opts.maxTerms || 8;
  const text = String(prompt || '');
  if (!text.trim()) return '';
  const protectedText = text.replace(/([A-Za-z0-9_])[.\-/]([A-Za-z0-9_])/g, '$1$2');
  const raw = protectedText.match(/[\p{L}\p{N}_]+/gu) || [];
  const seen = new Set();
  const out = [];
  for (const tok of raw) {
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
    const base = path.basename(fp).replace(/\.[A-Za-z0-9]+$/, '');
    return extractQuery(base, { maxTerms: 4 });
  }
  if (name === 'Bash') {
    const cmd = String(toolInput.command || '');
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
 * Returns { query, results: [...], recent: [...], extract_reason }.
 */
function runPrefetch({ cwd, prompt, query, limit = 5, recent = true, settings } = {}) {
  const db = require('./db');
  const paths = require('./paths');
  if (!cwd) cwd = process.cwd();

  let extractReason = 'explicit';
  let q = (query || '').trim();
  if (!q && prompt) {
    const r = extractQueryStructured(prompt);
    try { recordExtractDebug(prompt, r); } catch {}
    q = r.terms.join(' ');
    extractReason = r.reason;
  }
  const out = { query: q, results: [], recent: [], extract_reason: extractReason };
  if (!q) return out;

  const dbFile = paths.vaultDbPath(cwd);
  if (!fs.existsSync(dbFile)) return out;

  let d;
  try { d = db.open(cwd); } catch { return out; }

  const merged = new Map();
  for (const t of HIGH_VALUE_TYPES) {
    let rows = [];
    try { rows = db.search(d, { query: q, limit, type: t }); } catch {}
    for (const r of rows) if (!merged.has(r.id)) merged.set(r.id, r);
  }
  if (merged.size < limit) {
    let any = [];
    try { any = db.search(d, { query: q, limit: limit * 2 }); } catch {}
    for (const r of any) {
      if (!merged.has(r.id)) merged.set(r.id, r);
      if (merged.size >= limit) break;
    }
  }

  // Empty-result fallback — retry with the legacy permissive query so we
  // never miss something just because the entity extractor was too narrow.
  if (merged.size === 0 && prompt) {
    const legacy = extractQueryLegacy(prompt);
    if (legacy && legacy !== q) {
      let any = [];
      try { any = db.search(d, { query: legacy, limit: limit * 2 }); } catch {}
      for (const r of any) {
        if (!merged.has(r.id)) merged.set(r.id, r);
        if (merged.size >= limit) break;
      }
      if (merged.size > 0) {
        out.query = legacy;
        out.extract_reason = 'fallback-legacy';
      }
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
    lines.push(`[mem-vault] You are about to use a fallback tool (Grep/Read/Glob/Bash). Prior memory may already answer this — query: ${query || '?'}`);
  } else {
    lines.push(`[mem-vault] ${r.length} prior observation${r.length === 1 ? '' : 's'} match your prompt — review these BEFORE deciding what to do:`);
  }
  for (const o of r) lines.push(formatLine(o));
  if (mode === 'prompt' && recent && recent.length) {
    lines.push('');
    lines.push(`Most recent activity (${recent.length}):`);
    for (const o of recent) lines.push(formatLine(o, { showType: true }));
  }
  if (mode === 'tool') {
    lines.push('');
    lines.push('PREFER one of these mem-vault tools first; fall back to the original Grep/Read/Glob/Bash only if they return insufficient results:');
    lines.push('  • search          — full-text history search');
    lines.push('  • smart_search    — find a function/class/method by name (replaces Grep for symbols)');
    lines.push('  • smart_outline   — file structural map (replaces blind Read of unfamiliar files)');
    lines.push('  • smart_unfold    — drill into a specific symbol from an outline');
  }
  return lines.join('\n');
}

function formatLine(o) {
  const type = o.type || 'note';
  const date = (o.ts || '').slice(0, 10);
  const title = String(o.title || '').replace(/\s+/g, ' ').trim();
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
  extractQueryStructured,
  extractQueryLegacy,
  extractQueryFromToolInput,
  runPrefetch,
  formatHint,
  getExtractDebug,
};
