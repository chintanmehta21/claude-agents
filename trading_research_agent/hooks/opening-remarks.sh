#!/usr/bin/env bash
# ==============================================================================
# opening-remarks.sh
# ==============================================================================
# Purpose: Preprocess script that runs at the start of every pipeline execution.
#          Archives previous run artifacts and enforces output conventions.
#
# Tasks:
#   1. Move all existing run_* folders in the trading research output directory
#      into the .mummies archive folder (keeps only the latest output after run)
#   2. Emit strict output folder naming convention to the Project Lead
#
# Hook Event: SessionStart (matcher: "startup")
# Timeout: 15 seconds
# ==============================================================================

set -euo pipefail

# --- Resolve paths ---
# The agent_outputs folder lives alongside the plugin root's parent
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"

# Navigate up from plugin root to the repo root, then into agent_outputs
REPO_ROOT="$(cd "$PLUGIN_ROOT/.." && pwd)"
RESEARCH_DIR="$REPO_ROOT/agent_outputs/trading research"
MUMMIES_DIR="$RESEARCH_DIR/.mummies"

# ==============================================================================
# TASK 1: Archive previous run folders into .mummies
# ==============================================================================

echo "═══════════════════════════════════════════════════════"
echo "  OPENING REMARKS — Pre-Run Housekeeping"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ ! -d "$RESEARCH_DIR" ]; then
    echo "  INFO: Research output directory not found: $RESEARCH_DIR"
    echo "  INFO: Skipping archive step (first run or directory not created yet)"
    echo ""
else
    # Ensure .mummies exists
    mkdir -p "$MUMMIES_DIR"

    # Find and move all run_* folders
    moved_count=0
    for run_dir in "$RESEARCH_DIR"/run_*; do
        # Check it's actually a directory (glob may not match anything)
        if [ -d "$run_dir" ]; then
            run_name="$(basename "$run_dir")"

            # If a folder with the same name already exists in .mummies, add timestamp suffix
            if [ -d "$MUMMIES_DIR/$run_name" ]; then
                timestamp=$(date +%H%M%S)
                dest="$MUMMIES_DIR/${run_name}_archived_${timestamp}"
            else
                dest="$MUMMIES_DIR/$run_name"
            fi

            mv "$run_dir" "$dest"
            echo "  ARCHIVED: $run_name → .mummies/$(basename "$dest")"
            moved_count=$((moved_count + 1))
        fi
    done

    if [ "$moved_count" -eq 0 ]; then
        echo "  INFO: No previous run folders found — workspace is clean"
    else
        echo ""
        echo "  TOTAL ARCHIVED: $moved_count folder(s) moved to .mummies/"
    fi
fi

echo ""

# ==============================================================================
# TASK 2: Emit strict remarks to the Project Lead
# ==============================================================================

echo "═══════════════════════════════════════════════════════"
echo "  OPENING REMARKS — Directives for Project Lead"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  STRICT OUTPUT FOLDER NAMING CONVENTION:"
echo "  ────────────────────────────────────────"
echo "  The output folder MUST be created at:"
echo ""
echo "    agent_outputs/trading research/run_DDMMYYYY/"
echo ""
echo "  Where DDMMYYYY is the current date in day-month-year format."
echo "  Example: run_27032026 for March 27, 2026."
echo ""
echo "  ✗ WRONG: run_20260327, run_2703, output_2703, run_27Mar"
echo "  ✓ RIGHT: run_27032026"
echo ""
echo "  This convention is NON-NEGOTIABLE. The downstream executor"
echo "  system parses this exact format to locate the latest research."
echo ""
echo "  Previous run artifacts have been archived to .mummies/."
echo "  The trading research/ folder is now clean for this run."
echo "═══════════════════════════════════════════════════════"

exit 0
