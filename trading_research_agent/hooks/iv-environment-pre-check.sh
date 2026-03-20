#!/usr/bin/env bash
# ==============================================================================
# iv-environment-pre-check.sh
# ==============================================================================
# Purpose: Pre-run hook that checks for current India VIX level in the run's
#          shared context. If shared_context.json exists and contains IV data,
#          validates that strategies about to be processed are compatible with
#          the current IV regime. Flags incompatible strategies before they
#          advance past the Scout tier.
#
# Stakeholder: Triggered by PreToolUse hook before Agent spawning. Works with
#              the iv-regime-classifier skill to classify the current regime.
#
# Hook Event: PreToolUse (matcher: "Agent")
# Timeout: 20 seconds
#
# IV Regime Thresholds (see rules/OptionsTrading.md):
#   LOW:     India VIX < 12    (below 25th percentile)
#   MEDIUM:  India VIX 12-18   (25th-60th percentile)
#   HIGH:    India VIX 18-25   (60th-85th percentile)
#   EXTREME: India VIX > 25    (above 85th percentile)
#
# [VERIFY: empirical source needed — thresholds estimated from historical distribution]
# ==============================================================================

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"

# --- Find the most recent run directory ---
find_latest_run() {
    local output_dir="$PLUGIN_ROOT/outputs"
    if [ ! -d "$output_dir" ]; then
        echo ""
        return
    fi
    ls -td "$output_dir"/run_* 2>/dev/null | head -1
}

# --- Read IV regime from shared context ---
get_iv_regime() {
    local run_dir="$1"
    local context_file="$run_dir/shared_context.json"

    if [ ! -f "$context_file" ]; then
        echo "UNKNOWN"
        return
    fi

    # Extract regime using grep/sed (avoid Python dependency for speed)
    local regime
    regime=$(grep -o '"regime"[[:space:]]*:[[:space:]]*"[^"]*"' "$context_file" 2>/dev/null \
        | head -1 \
        | sed 's/.*"regime"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

    if [ -z "$regime" ]; then
        echo "UNKNOWN"
    else
        echo "$regime"
    fi
}

get_iv_level() {
    local run_dir="$1"
    local context_file="$run_dir/shared_context.json"

    if [ ! -f "$context_file" ]; then
        echo "N/A"
        return
    fi

    local level
    level=$(grep -o '"current_level"[[:space:]]*:[[:space:]]*[0-9.]*' "$context_file" 2>/dev/null \
        | head -1 \
        | sed 's/.*:[[:space:]]*//')

    if [ -z "$level" ]; then
        echo "N/A"
    else
        echo "$level"
    fi
}

# --- Check strategy compatibility with current IV regime ---
check_iv_compatibility() {
    local run_dir="$1"
    local current_regime="$2"
    local incompatible_count=0

    # Check scout output files for IV environment fields
    for scouts_dir in "$run_dir"/bullish/scouts "$run_dir"/bearish/scouts; do
        [ -d "$scouts_dir" ] || continue
        for file in "$scouts_dir"/*.md; do
            [ -f "$file" ] || continue

            # Find strategy IV requirements
            local iv_reqs
            iv_reqs=$(grep -i "IV Environment:" "$file" 2>/dev/null || true)

            if [ -z "$iv_reqs" ]; then
                continue
            fi

            # Check for mismatches
            case "$current_regime" in
                LOW)
                    if echo "$iv_reqs" | grep -qi "HIGH\|EXTREME"; then
                        incompatible_count=$((incompatible_count + 1))
                        local filename
                        filename=$(basename "$file")
                        echo "  ⚠ $filename: Strategy requires HIGH/EXTREME IV, current regime is LOW"
                    fi
                    ;;
                MEDIUM)
                    if echo "$iv_reqs" | grep -qi "EXTREME"; then
                        incompatible_count=$((incompatible_count + 1))
                        filename=$(basename "$file")
                        echo "  ⚠ $filename: Strategy requires EXTREME IV, current regime is MEDIUM"
                    fi
                    ;;
                HIGH|EXTREME)
                    if echo "$iv_reqs" | grep -qi "LOW"; then
                        incompatible_count=$((incompatible_count + 1))
                        filename=$(basename "$file")
                        echo "  ⚠ $filename: Strategy requires LOW IV, current regime is $current_regime"
                    fi
                    ;;
            esac
        done
    done

    echo "$incompatible_count"
}

# --- Main ---
RUN_DIR=$(find_latest_run)

if [ -z "$RUN_DIR" ]; then
    # No active run — nothing to check
    exit 0
fi

REGIME=$(get_iv_regime "$RUN_DIR")
LEVEL=$(get_iv_level "$RUN_DIR")

if [ "$REGIME" = "UNKNOWN" ]; then
    # IV data not yet available — Lead hasn't populated shared_context yet
    # This is normal during early pipeline stages
    exit 0
fi

# Report current IV regime
echo "IV Environment: India VIX $LEVEL — Regime: $REGIME"

# Check for incompatible strategies if scout outputs exist
SCOUT_FILES=$(find "$RUN_DIR" -path "*/scouts/*.md" -type f 2>/dev/null | wc -l)
if [ "$SCOUT_FILES" -gt 0 ]; then
    INCOMPATIBLE=$(check_iv_compatibility "$RUN_DIR" "$REGIME")

    # The function echoes warnings and then returns the count on the last line
    INCOMPAT_COUNT=$(echo "$INCOMPATIBLE" | tail -1)

    if [ "$INCOMPAT_COUNT" -gt 0 ] 2>/dev/null; then
        echo ""
        echo "IV PRE-CHECK: $INCOMPAT_COUNT strategies may be incompatible with current $REGIME IV regime"
        echo "These will be flagged [IV_MISMATCH] and deprioritized in final selection"
    fi
fi

exit 0
