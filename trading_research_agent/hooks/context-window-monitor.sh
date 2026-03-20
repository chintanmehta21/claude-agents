#!/usr/bin/env bash
# ==============================================================================
# context-window-monitor.sh
# ==============================================================================
# Purpose: Estimates accumulated token usage per agent scratchpad and triggers
#          a summarization warning before the agent hits its context ceiling.
#          Uses file sizes as a proxy for token count.
#
# Stakeholder: Triggered by PreToolUse hook before Agent spawning. Reports
#              to the parent agent.
#
# Hook Event: PreToolUse (matcher: "Agent")
# Timeout: 10 seconds
#
# Threshold: When estimated token usage exceeds 70% of context window,
#            emit a warning recommending summarization before continuing.
#
# Token Estimation: ~4 characters per token (rough English estimate).
#                   200K context window ≈ 800K characters ≈ 780KB of text.
#                   70% threshold ≈ 560K characters ≈ 546KB.
# ==============================================================================

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"

# Configuration
MAX_CONTEXT_CHARS=800000     # ~200K tokens * 4 chars/token
THRESHOLD_PERCENT=70
THRESHOLD_CHARS=$(( MAX_CONTEXT_CHARS * THRESHOLD_PERCENT / 100 ))
# = 560000 characters

# --- Find the most recent run directory ---
find_latest_run() {
    local output_dir="$PLUGIN_ROOT/outputs"
    if [ ! -d "$output_dir" ]; then
        echo ""
        return
    fi
    ls -td "$output_dir"/run_* 2>/dev/null | head -1
}

# --- Estimate total content size in the run ---
estimate_context_usage() {
    local run_dir="$1"
    local total_bytes=0

    if [ ! -d "$run_dir" ]; then
        echo "0"
        return
    fi

    # Sum all .md and .json files in the run directory
    while IFS= read -r -d '' file; do
        local size
        size=$(wc -c < "$file" 2>/dev/null || echo 0)
        total_bytes=$((total_bytes + size))
    done < <(find "$run_dir" -type f \( -name "*.md" -o -name "*.json" \) -print0 2>/dev/null)

    echo "$total_bytes"
}

# --- Main ---
RUN_DIR=$(find_latest_run)

if [ -z "$RUN_DIR" ]; then
    # No active run — nothing to monitor
    exit 0
fi

USAGE=$(estimate_context_usage "$RUN_DIR")
USAGE_PERCENT=$(( USAGE * 100 / MAX_CONTEXT_CHARS ))

if [ "$USAGE" -gt "$THRESHOLD_CHARS" ]; then
    echo "═══════════════════════════════════════════════════════"
    echo "  CONTEXT WINDOW WARNING"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "  Estimated content accumulation: ${USAGE} bytes (~$(( USAGE / 4 )) tokens)"
    echo "  Threshold: ${THRESHOLD_CHARS} bytes (${THRESHOLD_PERCENT}% of ~200K tokens)"
    echo "  Usage: ~${USAGE_PERCENT}% of estimated context window"
    echo ""
    echo "  RECOMMENDATION: Before spawning the next agent, consider:"
    echo "  1. Summarize completed scout/verifier outputs to key findings only"
    echo "  2. Archive raw outputs and pass summaries to downstream agents"
    echo "  3. Use focused context — pass only relevant files, not entire run state"
    echo ""
    echo "  SUMMARIZATION INSTRUCTION:"
    echo "  For each completed agent output, create a summary preserving:"
    echo "  - Strategy names and confidence scores"
    echo "  - Key entry/exit conditions (1-2 lines each)"
    echo "  - Critical flags ([VERIFY], [STALE], [HYPOTHESIS])"
    echo "  - Discard: full reasoning chains, verbose debate sections, raw source text"
    echo "═══════════════════════════════════════════════════════"
fi

exit 0
