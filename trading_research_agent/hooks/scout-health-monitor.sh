#!/usr/bin/env bash
# ==============================================================================
# scout-health-monitor.sh
# ==============================================================================
# Purpose: Background monitor that checks scout progress after subagent
#          completion. Validates that output files exist, are non-empty, and
#          contain the expected number of strategies. Detects hanging processes
#          and cross-contamination.
#
# Stakeholder: Triggered by SubagentStop hook. Reports to ScoutLeader/Lead.
#
# Hook Event: SubagentStop (matcher: ".*")
# Timeout: 15 seconds
#
# Usage: scout-health-monitor.sh check
# ==============================================================================

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
ACTION="${1:-check}"

# --- Find the most recent run directory ---
find_latest_run() {
    local output_dir="$PLUGIN_ROOT/outputs"
    if [ ! -d "$output_dir" ]; then
        echo ""
        return
    fi
    # Find the most recently modified run directory
    local latest
    latest=$(ls -td "$output_dir"/run_* 2>/dev/null | head -1)
    echo "$latest"
}

# --- Check a single scout output file ---
check_scout_file() {
    local filepath="$1"
    local filename
    filename=$(basename "$filepath")
    local status="OK"
    local issues=()

    if [ ! -f "$filepath" ]; then
        echo "  ✗ $filename: FILE_MISSING"
        return 1
    fi

    if [ ! -s "$filepath" ]; then
        echo "  ✗ $filename: FILE_EMPTY — scout output is 0 bytes"
        return 1
    fi

    # Count strategies (look for "### Strategy" headers)
    local strategy_count
    strategy_count=$(grep -c "^### Strategy" "$filepath" 2>/dev/null || echo 0)

    if [ "$strategy_count" -lt 5 ]; then
        issues+=("INSUFFICIENT_STRATEGIES: found $strategy_count, need 5")
        status="WARN"
    fi

    # Check for required schema fields
    local missing_fields=()
    for field in "Bias:" "Expiry Category:" "Underlying:" "Structure:" "Entry Conditions" "Exit Conditions" "Edge Thesis"; do
        if ! grep -qi "$field" "$filepath" 2>/dev/null; then
            missing_fields+=("$field")
        fi
    done

    if [ ${#missing_fields[@]} -gt 0 ]; then
        issues+=("SCHEMA_INCOMPLETE: missing fields — ${missing_fields[*]}")
        status="WARN"
    fi

    # Check for cross-contamination (references to other scout files)
    local contamination_check
    contamination_check=$(grep -ci "other scout\|scout-[0-9]\|from the.*scout\|reddit scout\|websearch scout\|forum scout" "$filepath" 2>/dev/null || echo 0)
    if [ "$contamination_check" -gt 0 ]; then
        issues+=("ISOLATION_VIOLATION: possible cross-contamination detected ($contamination_check references)")
        status="FAIL"
    fi

    # Check for US-only instrument references without translation
    local us_only_check
    us_only_check=$(grep -ci "SPX\|SPY\|QQQ\|NASDAQ\|S&P 500" "$filepath" 2>/dev/null || echo 0)
    local translated_check
    translated_check=$(grep -ci "translated\|indian equivalent\|adaptation" "$filepath" 2>/dev/null || echo 0)
    if [ "$us_only_check" -gt 0 ] && [ "$translated_check" -eq 0 ]; then
        issues+=("US_INSTRUMENT: found $us_only_check US instrument references without documented translation")
        status="WARN"
    fi

    # Report
    if [ "$status" = "OK" ]; then
        echo "  ✓ $filename: $strategy_count strategies, schema valid"
    else
        echo "  ⚠ $filename: $status"
        for issue in "${issues[@]}"; do
            echo "    → $issue"
        done
    fi

    if [ "$status" = "FAIL" ]; then
        return 1
    fi
    return 0
}

# --- Main check logic ---
if [ "$ACTION" = "check" ]; then
    RUN_DIR=$(find_latest_run)

    if [ -z "$RUN_DIR" ]; then
        echo "scout-health-monitor: No active run directory found. Skipping."
        exit 0
    fi

    echo "═══════════════════════════════════════════"
    echo "  Scout Health Monitor — $(basename "$RUN_DIR")"
    echo "═══════════════════════════════════════════"

    ERRORS=0

    # Check bullish scouts
    BULLISH_DIR="$RUN_DIR/bullish/scouts"
    if [ -d "$BULLISH_DIR" ]; then
        echo ""
        echo "Bullish Scouts:"
        for file in "$BULLISH_DIR"/*.md; do
            [ -f "$file" ] || continue
            check_scout_file "$file" || ERRORS=$((ERRORS + 1))
        done
        BULLISH_COUNT=$(ls "$BULLISH_DIR"/*.md 2>/dev/null | wc -l)
        if [ "$BULLISH_COUNT" -eq 0 ]; then
            echo "  ✗ No scout output files found in bullish/scouts/"
            ERRORS=$((ERRORS + 1))
        fi
    fi

    # Check bearish scouts
    BEARISH_DIR="$RUN_DIR/bearish/scouts"
    if [ -d "$BEARISH_DIR" ]; then
        echo ""
        echo "Bearish Scouts:"
        for file in "$BEARISH_DIR"/*.md; do
            [ -f "$file" ] || continue
            check_scout_file "$file" || ERRORS=$((ERRORS + 1))
        done
        BEARISH_COUNT=$(ls "$BEARISH_DIR"/*.md 2>/dev/null | wc -l)
        if [ "$BEARISH_COUNT" -eq 0 ]; then
            echo "  ✗ No scout output files found in bearish/scouts/"
            ERRORS=$((ERRORS + 1))
        fi
    fi

    echo ""
    if [ "$ERRORS" -gt 0 ]; then
        echo "RESULT: $ERRORS issue(s) detected — review required"
    else
        echo "RESULT: All scout outputs healthy"
    fi
    echo "═══════════════════════════════════════════"
fi

exit 0
