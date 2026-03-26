#!/usr/bin/env node
// ==============================================================================
// context-compression-advisor.js
// ==============================================================================
// Purpose: 4-tier context compression advisor for the trading research pipeline.
//          Monitors context usage and injects actionable compression advice.
//          Replaces context-window-monitor.sh with more granular thresholds,
//          pipeline-specific guidance, and emergency session handoff capability.
//
// Hook Event: PostToolUse (matcher: "Agent")
// Timeout: 15 seconds
//
// Thresholds:
//   NORMAL:  remaining > 50%  → no action
//   CAUTION: remaining ≤ 50%  → light compression tips
//   WARNING: remaining ≤ 25%  → aggressive compression + alert lead
//   CRITICAL: remaining ≤ 10% → halt + state dump + schedule resume
// ==============================================================================

const fs = require('fs');
const os = require('os');
const path = require('path');

// --- Configuration ---
const THRESHOLDS = {
  CAUTION: 50,
  WARNING: 25,
  CRITICAL: 10
};
const DEBOUNCE_MIN_CALLS = 3;
const STALE_SECONDS = 120;
const INPUT_TIMEOUT_MS = 10000;
const MAX_CONTEXT_CHARS = 800000; // ~200K tokens × 4 chars/token

// --- State tracking ---
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || '.';
const STATE_FILE = path.join(os.tmpdir(), 'trading-ctx-compression-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return { lastLevel: 'NORMAL', callsSinceLastWarning: 0 };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8');
  } catch (e) { /* ignore */ }
}

// --- Metrics: Try statusline bridge first, fall back to file size estimation ---
function getContextMetrics() {
  // Method 1: Statusline bridge file (most accurate)
  const sessionId = process.env.CLAUDE_SESSION_ID || '';
  if (sessionId) {
    const bridgePaths = [
      path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`),
      path.join(os.tmpdir(), `claude-context-${sessionId}.json`)
    ];
    for (const bp of bridgePaths) {
      try {
        if (fs.existsSync(bp)) {
          const data = JSON.parse(fs.readFileSync(bp, 'utf8'));
          const age = (Date.now() - (data.timestamp || 0)) / 1000;
          if (age < STALE_SECONDS && typeof data.remaining_percentage === 'number') {
            return {
              source: 'statusline',
              remaining_pct: data.remaining_percentage,
              used_pct: 100 - data.remaining_percentage,
              raw: data
            };
          }
        }
      } catch (e) { /* continue to next method */ }
    }
  }

  // Method 2: File size estimation (fallback)
  const runDir = findLatestRunDir();
  if (runDir) {
    const totalBytes = estimateOutputSize(runDir);
    const usedPct = Math.round((totalBytes / MAX_CONTEXT_CHARS) * 100);
    return {
      source: 'file-estimation',
      remaining_pct: Math.max(0, 100 - usedPct),
      used_pct: Math.min(100, usedPct),
      totalBytes
    };
  }

  return null;
}

function findLatestRunDir() {
  const candidates = [
    path.join(process.cwd(), 'research_agent_ops'),
    path.join(PLUGIN_ROOT, '..', 'research_agent_ops')
  ];

  for (const base of candidates) {
    try {
      if (fs.existsSync(base)) {
        const dirs = fs.readdirSync(base)
          .filter(d => d.startsWith('output_'))
          .map(d => ({ name: d, mtime: fs.statSync(path.join(base, d)).mtimeMs }))
          .sort((a, b) => b.mtime - a.mtime);
        if (dirs.length > 0) {
          return path.join(base, dirs[0].name);
        }
      }
    } catch (e) { /* continue */ }
  }
  return null;
}

function estimateOutputSize(dir) {
  let total = 0;
  try {
    const walk = (d) => {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
          try { total += fs.statSync(fullPath).size; } catch (e) { /* skip */ }
        }
      }
    };
    walk(dir);
  } catch (e) { /* ignore */ }
  return total;
}

// --- Determine severity level ---
function getLevel(remainingPct) {
  if (remainingPct <= THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (remainingPct <= THRESHOLDS.WARNING) return 'WARNING';
  if (remainingPct <= THRESHOLDS.CAUTION) return 'CAUTION';
  return 'NORMAL';
}

const SEVERITY_ORDER = { NORMAL: 0, CAUTION: 1, WARNING: 2, CRITICAL: 3 };

// --- Generate advice per level ---
function generateAdvice(level, remainingPct, metrics) {
  const header = '='.repeat(60);
  const lines = [];

  if (level === 'CAUTION') {
    lines.push(header);
    lines.push('  CONTEXT OPTIMIZATION -- CAUTION');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% (source: ${metrics.source})`);
    lines.push('');
    lines.push('  Optimization tips for all agents:');
    lines.push('  - Summarize completed outputs to key findings (name, score, executor_params)');
    lines.push('  - Reference files by path -- do not re-read already-processed files');
    lines.push('  - Use structured tables, not prose paragraphs');
    lines.push('  - Drop intermediate reasoning chains -- keep conclusions only');
    lines.push('  - When spawning subagents, pass only the RELEVANT section of context');
    lines.push(header);
  }

  if (level === 'WARNING') {
    lines.push(header);
    lines.push('  WARNING: CONTEXT LOW -- COMPRESS AGGRESSIVELY');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% -- approaching limit`);
    lines.push('');
    lines.push('  MANDATORY for all agents:');
    lines.push('  1. Write ALL current working state to files immediately');
    lines.push('  2. Summarize strategies to: name | score | 3-line synopsis | executor_params');
    lines.push('  3. Subagents: output ONLY final schema, zero reasoning chains');
    lines.push('  4. Reference file paths, never quote file content inline');
    lines.push('  5. Project Lead: begin drafting session_handoff.md proactively');
    lines.push('  6. Do NOT re-read large files -- use summaries from previous reads');
    lines.push('  7. Collapse regime matrix to: versatility_score + best/worst regime only');
    lines.push('');
    lines.push('  KEY INFORMATION TO PRESERVE (never drop these):');
    lines.push('  - Strategy names, confidence scores, regime versatility scores');
    lines.push('  - Executor params (complete JSON blocks)');
    lines.push('  - Critical flags: [VERIFY], [STALE], [COMPLIANCE_RISK], [IV_MISMATCH]');
    lines.push('  - Pipeline stage and completion status per agent');
    lines.push(header);
  }

  if (level === 'CRITICAL') {
    lines.push(header);
    lines.push('  CRITICAL: CONTEXT LIMIT -- EMERGENCY HANDOFF');
    lines.push(header);
    lines.push('');
    lines.push(`  Context remaining: ~${remainingPct}% -- IMMEDIATE ACTION REQUIRED`);
    lines.push('');
    lines.push('  STOP all new agent spawning immediately.');
    lines.push('');
    lines.push('  EMERGENCY PROTOCOL:');
    lines.push('  1. Write session_handoff.md to output directory with:');
    lines.push('     - Pipeline stage and completion status per agent');
    lines.push('     - ALL strategy data collected (full schema for each)');
    lines.push('     - shared_context.json snapshot');
    lines.push('     - run_state.json snapshot');
    lines.push('     - Remaining work queue (which agents still need to run)');
    lines.push('     - All output file paths');
    lines.push('  2. Update run_state.json: status = "SUSPENDED_CONTEXT_LIMIT"');
    lines.push('  3. Attempt to schedule resume via MCP scheduled-tasks tool:');
    lines.push('     - Task ID: "trading-research-resume"');
    lines.push('     - Schedule: 60 minutes from now');
    lines.push('     - Prompt: "Resume trading research pipeline from session_handoff.md"');
    lines.push('  4. If scheduling unavailable, output to user:');
    lines.push('     "Pipeline suspended at context limit. Resume with:');
    lines.push('      /trading-research-agent:run_research_agent --resume"');
    lines.push('  5. EXIT -- no further agent spawning permitted');
    lines.push('');
    lines.push('  DO NOT LOSE THIS INFORMATION:');
    lines.push('  - Every strategy collected so far (name, score, full schema)');
    lines.push('  - Every executor_params block');
    lines.push('  - Every regime performance matrix');
    lines.push('  - Current IV regime and shared context');
    lines.push('  - Which scouts/verifiers completed vs pending');
    lines.push(header);
  }

  return lines.join('\n');
}

// --- Main ---
async function main() {
  // Read stdin with timeout (prevent hanging)
  let input = '';
  try {
    const stdinPromise = new Promise((resolve) => {
      const chunks = [];
      process.stdin.on('data', (chunk) => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString()));
      process.stdin.on('error', () => resolve(''));
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(''), INPUT_TIMEOUT_MS));
    input = await Promise.race([stdinPromise, timeoutPromise]);
  } catch (e) {
    input = '';
  }

  // Get context metrics
  const metrics = getContextMetrics();
  if (!metrics) {
    process.exit(0);
  }

  const remainingPct = metrics.remaining_pct;
  const level = getLevel(remainingPct);

  if (level === 'NORMAL') {
    process.exit(0);
  }

  // Load state for debounce
  const state = loadState();
  state.callsSinceLastWarning++;

  // Severity escalation bypasses debounce
  const isEscalation = SEVERITY_ORDER[level] > SEVERITY_ORDER[state.lastLevel];
  if (!isEscalation && state.callsSinceLastWarning < DEBOUNCE_MIN_CALLS) {
    saveState(state);
    process.exit(0);
  }

  // Generate and emit advice
  const advice = generateAdvice(level, remainingPct, metrics);

  const output = {
    hookSpecificOutput: {
      additionalContext: advice
    }
  };

  console.log(JSON.stringify(output));

  // Update state
  state.lastLevel = level;
  state.callsSinceLastWarning = 0;
  saveState(state);

  process.exit(0);
}

main().catch(() => process.exit(0));
