#!/usr/bin/env bash
# ==============================================================================
# pre-run-environment-check.sh
# ==============================================================================
# Purpose: Verifies that the plugin environment is correctly set up before
#          the pipeline spends tokens on agent spawning. Checks for required
#          files, output directory accessibility, and tool availability.
#
# Stakeholder: Triggered at SessionStart by hooks.json. Reports to Project Lead.
#
# Hook Event: SessionStart (matcher: "startup")
# Timeout: 15 seconds
# ==============================================================================

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-.}"
ERRORS=()
WARNINGS=()

# --- 1. Check required agent files ---
REQUIRED_FILES=(
    "agents/lead.md"
    "agents/ScoutLeader.md"
    "agents/scout.md"
    "agents/orchestrator.md"
    "agents/verifier.md"
    "rules/OptionsTrading.md"
    "commands/run_research_agent.md"
    "README.md"
    "AGENT_FLOW.dot"
)

for file in "${REQUIRED_FILES[@]}"; do
    filepath="$PLUGIN_ROOT/$file"
    if [ ! -f "$filepath" ]; then
        ERRORS+=("MISSING_FILE: $file not found at $filepath")
    elif [ ! -s "$filepath" ]; then
        ERRORS+=("EMPTY_FILE: $file exists but is empty at $filepath")
    fi
done

# --- 2. Check output directory accessibility ---
OUTPUT_DIR="$PLUGIN_ROOT/outputs"
if [ ! -d "$OUTPUT_DIR" ]; then
    # Attempt to create it
    if mkdir -p "$OUTPUT_DIR" 2>/dev/null; then
        echo "INFO: Created outputs/ directory at $OUTPUT_DIR"
    else
        ERRORS+=("OUTPUT_DIR: Cannot create outputs/ directory at $OUTPUT_DIR")
    fi
fi

# Check write permissions on output directory
if [ -d "$OUTPUT_DIR" ] && [ ! -w "$OUTPUT_DIR" ]; then
    ERRORS+=("OUTPUT_DIR_PERMISSIONS: outputs/ directory is not writable")
fi

# --- 3. Check for stale run data ---
if [ -d "$OUTPUT_DIR" ]; then
    STALE_RUNS=$(find "$OUTPUT_DIR" -maxdepth 1 -name "run_*" -type d 2>/dev/null | wc -l)
    if [ "$STALE_RUNS" -gt 0 ]; then
        WARNINGS+=("STALE_RUNS: Found $STALE_RUNS previous run directories in outputs/. New runs will create fresh directories.")
    fi
fi

# --- 4. Check required tools availability ---
# Check for Python (needed by hooks)
if ! command -v python &>/dev/null && ! command -v python3 &>/dev/null; then
    ERRORS+=("PYTHON_MISSING: Python is required for rule-updater.py, file-write-lock.py, and output-integrity-validator.py hooks")
fi

# --- 5. Check skill files ---
REQUIRED_SKILLS=(
    "skills/bravesearch-mcp/SKILL.md"
    "skills/web-fetch-analyzer/SKILL.md"
    "skills/techno-fundamental-parser/SKILL.md"
    "skills/options-chain-fetcher/SKILL.md"
    "skills/iv-regime-classifier/SKILL.md"
    "skills/expiry-calendar-validator/SKILL.md"
    "skills/correlation-deduplicator/SKILL.md"
)

MISSING_SKILLS=0
for skill in "${REQUIRED_SKILLS[@]}"; do
    if [ ! -f "$PLUGIN_ROOT/$skill" ]; then
        MISSING_SKILLS=$((MISSING_SKILLS + 1))
        WARNINGS+=("MISSING_SKILL: $skill not found — pipeline may have reduced capability")
    fi
done

# --- 6. Check hooks are present ---
REQUIRED_HOOKS=(
    "hooks/rule-updater.py"
    "hooks/scout-health-monitor.sh"
    "hooks/context-window-monitor.sh"
    "hooks/file-write-lock.py"
    "hooks/output-integrity-validator.py"
    "hooks/iv-environment-pre-check.sh"
)

for hook in "${REQUIRED_HOOKS[@]}"; do
    if [ ! -f "$PLUGIN_ROOT/$hook" ]; then
        WARNINGS+=("MISSING_HOOK: $hook not found — pipeline may lack automated checks")
    fi
done

# --- 7. Report results ---
echo "═══════════════════════════════════════════"
echo "  Pre-Run Environment Check"
echo "═══════════════════════════════════════════"
echo ""

if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "STATUS: PASS — Environment is ready"
else
    echo "STATUS: FAIL — ${#ERRORS[@]} critical error(s) found"
    echo ""
    echo "ERRORS:"
    for err in "${ERRORS[@]}"; do
        echo "  ✗ $err"
    done
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo ""
    echo "WARNINGS:"
    for warn in "${WARNINGS[@]}"; do
        echo "  ⚠ $warn"
    done
fi

echo ""
echo "Agent files: $(( ${#REQUIRED_FILES[@]} - $(echo "${ERRORS[@]}" | grep -c "MISSING_FILE\|EMPTY_FILE" 2>/dev/null || echo 0) ))/${#REQUIRED_FILES[@]} present"
echo "Skills: $(( ${#REQUIRED_SKILLS[@]} - MISSING_SKILLS ))/${#REQUIRED_SKILLS[@]} present"
echo "═══════════════════════════════════════════"

# Exit with error code if critical errors found
if [ ${#ERRORS[@]} -gt 0 ]; then
    exit 1
fi

exit 0
