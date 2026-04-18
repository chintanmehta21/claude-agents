// capture.js — convert hook payloads into observation records.
'use strict';

const path = require('path');

/**
 * Decide whether a tool call should be captured, and turn it into an observation.
 * Returns null if the event should be ignored.
 * input: hook payload (object) -- claude-code's PostToolUse schema.
 */
function fromToolUse(payload) {
  const tool = payload.tool_name || payload.tool || 'unknown';
  const ti = payload.tool_input || payload.input || {};
  const tr = payload.tool_response || payload.response || {};

  switch (tool) {
    case 'Write':
    case 'Edit':
    case 'NotebookEdit': {
      const file = ti.file_path || ti.notebook_path;
      if (!file || looksLikeSecret(file)) return null;
      return {
        type: 'change',
        title: `${tool}: ${short(file)}`,
        body: summarizeEdit(tool, ti, tr),
        files: [file],
        tags: [tool.toLowerCase(), language(file)].filter(Boolean),
      };
    }

    case 'Bash': {
      const cmd = ti.command || '';
      if (!cmd || isTrivialCommand(cmd)) return null;
      return {
        type: 'capture',
        title: `Bash: ${cmd.slice(0, 80)}`,
        body: cmd + (tr.stdout ? `\n---\n${String(tr.stdout).slice(0, 2000)}` : ''),
        tags: ['bash', ...detectCommandKind(cmd)],
      };
    }

    case 'TodoWrite':
      return null; // too noisy

    // Task intentionally not captured by default — too noisy.  Users can re-enable via config.

    default:
      return null;
  }
}

function short(p) {
  if (!p) return '';
  const parts = String(p).replace(/\\/g, '/').split('/');
  return parts.slice(-2).join('/');
}

function language(file) {
  const ext = path.extname(file || '').toLowerCase().slice(1);
  const map = {
    py: 'python', js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    go: 'go', rs: 'rust', rb: 'ruby', java: 'java', kt: 'kotlin',
    c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp',
    cs: 'csharp', php: 'php', swift: 'swift',
    md: 'markdown', json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', sh: 'shell',
    html: 'html', css: 'css', scss: 'scss',
  };
  return map[ext] || null;
}

function summarizeEdit(tool, input, response) {
  if (tool === 'Edit') {
    const a = truncate(input.old_string, 300);
    const b = truncate(input.new_string, 300);
    return `OLD: ${a}\nNEW: ${b}`;
  }
  if (tool === 'Write') {
    return `Wrote ${String(input.content || '').length} bytes`;
  }
  return null;
}

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function looksLikeSecret(file) {
  const p = String(file).toLowerCase();
  return /\.(env|pem|key|p12|pfx|jks)(\.|$)/.test(p) ||
         /(^|[\\/])(credentials|secrets?|id_rsa|id_ed25519)(\.|$)/.test(p);
}

function isTrivialCommand(cmd) {
  const c = String(cmd).trim();
  return /^(ls|pwd|echo|cat|which|where|true|false|date|cd)\b/.test(c) || c.length < 3;
}

function detectCommandKind(cmd) {
  const kinds = [];
  if (/\bgit\b/.test(cmd)) kinds.push('git');
  if (/\b(npm|pnpm|yarn|bun)\b/.test(cmd)) kinds.push('npm');
  if (/\b(pytest|jest|vitest|mocha|go test|cargo test)\b/.test(cmd)) kinds.push('test');
  if (/\b(docker|kubectl|helm)\b/.test(cmd)) kinds.push('devops');
  return kinds;
}

module.exports = { fromToolUse, language, looksLikeSecret };
