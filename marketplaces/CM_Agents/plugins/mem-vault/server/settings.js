// settings.js — load per-project mem-vault config from .claude/mem-vault.local.md
// Pattern follows the plugin-dev:plugin-settings skill: YAML frontmatter +
// optional free-form markdown body (body is for humans; we ignore it).
//
// We deliberately ship a tiny inline YAML parser so this module pulls in zero
// new deps. It supports exactly the shapes used by our schema:
//   key: value           (string, int, bool, or null)
//   key: [a, b, "c"]     (flow list of scalars)
//   key:                 (followed by `  - item` block list of scalars)
//     - item
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULTS = Object.freeze({
  // Master kill switch.
  enabled: true,

  // If true, the plugin auto-creates a project-local `.mem-vault/` directory
  // on first fire (SessionStart hook, PostToolUse hook, MCP tool call, or CLI),
  // and transparently migrates any pre-existing global vault into it.
  // Set false to keep legacy behavior (use ~/.mem-vault/projects/<slug>/ only).
  auto_create_project_vault: true,

  // PostToolUse capture hook.
  capture_enabled: true,
  capture_filter_extra: [],
  capture_max_body_chars: 4000,

  // SessionStart indexer.
  session_index_enabled: true,
  session_index_limit: 12,

  // SessionEnd consolidation.
  consolidate_on_session_end: false,

  // Dashboard.
  dashboard_port: 37777,
  dashboard_host: '127.0.0.1',
  dashboard_open_browser: true,

  // Logging.
  log_verbosity: 'info', // silent | info | debug
});

const VALID_VERBOSITY = new Set(['silent', 'info', 'debug']);

/**
 * Load mem-vault settings for a project rooted at `cwd`.
 * Returns DEFAULTS merged with any values successfully parsed from
 * <cwd>/.claude/mem-vault.local.md.  Never throws.
 */
function loadSettings(cwd) {
  const merged = { ...DEFAULTS };
  if (!cwd) return merged;
  const cfgPath = path.join(cwd, '.claude', 'mem-vault.local.md');
  let raw;
  try {
    raw = fs.readFileSync(cfgPath, 'utf8');
  } catch (e) {
    return merged; // missing file is normal
  }
  let parsed;
  try {
    parsed = parseFrontmatter(raw);
  } catch (e) {
    warn(merged, '[mem-vault] settings: failed to parse ' + cfgPath + ': ' + (e.message || e));
    return merged;
  }
  if (!parsed || typeof parsed !== 'object') return merged;

  // Coerce known fields; ignore unknown keys silently.
  for (const key of Object.keys(DEFAULTS)) {
    if (!(key in parsed)) continue;
    const v = parsed[key];
    const def = DEFAULTS[key];
    try {
      if (typeof def === 'boolean') merged[key] = toBool(v, def);
      else if (typeof def === 'number') merged[key] = toInt(v, def);
      else if (Array.isArray(def)) merged[key] = toStringList(v, def);
      else if (key === 'log_verbosity') {
        const s = String(v).trim().toLowerCase();
        merged[key] = VALID_VERBOSITY.has(s) ? s : def;
      } else {
        merged[key] = String(v);
      }
    } catch (_) {
      // keep default on coercion failure
    }
  }
  return merged;
}

// ---- internals ----

function warn(settings, msg) {
  const v = (settings && settings.log_verbosity) || 'info';
  if (v === 'silent') return;
  process.stderr.write(msg + '\n');
}

function toBool(v, def) {
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (s === 'true' || s === 'yes' || s === 'on' || s === '1') return true;
  if (s === 'false' || s === 'no' || s === 'off' || s === '0') return false;
  return def;
}
function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}
function toStringList(v, def) {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (v == null || v === '') return def;
  // Allow a single scalar to become a 1-element list.
  return [String(v)];
}

/**
 * Extract the YAML frontmatter from a string, return {} if none.
 * Frontmatter must start at offset 0 with `---\n` and end at a line `---`.
 */
function parseFrontmatter(text) {
  const src = String(text).replace(/^﻿/, ''); // strip BOM
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return {};
  return parseTinyYaml(m[1]);
}

/**
 * Tiny YAML subset: flat key/value, scalars, flow lists, block lists.
 * No nested maps, no anchors, no multiline strings.
 */
function parseTinyYaml(body) {
  const out = {};
  const lines = String(body).split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = stripComment(rawLine);
    if (!line.trim()) { i++; continue; }

    // Top-level keys must be at column 0.
    if (/^\s/.test(rawLine)) { i++; continue; }

    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rest = kv[2];

    if (rest === '' || rest === undefined) {
      // Could be the start of a block list on following indented `- item` lines.
      const items = [];
      let j = i + 1;
      while (j < lines.length) {
        const nxt = lines[j];
        if (!nxt.trim()) { j++; continue; }
        const blk = nxt.match(/^\s+-\s*(.*)$/);
        if (!blk) break;
        items.push(parseScalar(stripComment(blk[1])));
        j++;
      }
      out[key] = items;
      i = j;
      continue;
    }

    // Flow list: [a, b, "c"]
    const flow = rest.match(/^\[(.*)\]\s*$/);
    if (flow) {
      out[key] = parseFlowList(flow[1]);
      i++;
      continue;
    }

    out[key] = parseScalar(rest);
    i++;
  }
  return out;
}

function stripComment(line) {
  // Strip a `#` comment but only when it's outside quotes. Conservative:
  // if the line contains a quote, leave it; our schema only uses comments
  // on bare scalar/empty lines.
  if (line.includes('"') || line.includes("'")) {
    // Best-effort: only strip when ` # ` appears outside quoted runs.
    let inQ = null, out = '';
    for (let k = 0; k < line.length; k++) {
      const c = line[k];
      if (inQ) {
        if (c === inQ) inQ = null;
        out += c;
      } else if (c === '"' || c === "'") {
        inQ = c;
        out += c;
      } else if (c === '#' && (k === 0 || /\s/.test(line[k - 1]))) {
        break;
      } else {
        out += c;
      }
    }
    return out.replace(/\s+$/, '');
  }
  const hash = line.indexOf('#');
  if (hash === -1) return line;
  if (hash === 0 || /\s/.test(line[hash - 1])) return line.slice(0, hash).replace(/\s+$/, '');
  return line;
}

function parseFlowList(inner) {
  // Split on commas not inside quotes.
  const parts = [];
  let buf = '', inQ = null;
  for (let k = 0; k < inner.length; k++) {
    const c = inner[k];
    if (inQ) {
      if (c === inQ) inQ = null;
      else buf += c;
    } else if (c === '"' || c === "'") {
      inQ = c;
    } else if (c === ',') {
      parts.push(buf); buf = '';
    } else {
      buf += c;
    }
  }
  if (buf.trim() !== '' || parts.length) parts.push(buf);
  return parts.map((s) => parseScalar(s.trim())).filter((v) => v !== '');
}

function parseScalar(s) {
  if (s === undefined || s === null) return null;
  let v = String(s).trim();
  if (v === '') return '';
  // Quoted string.
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

module.exports = { DEFAULTS, loadSettings };
