#!/usr/bin/env python3
"""
output-integrity-validator.py
=============================
Purpose: Post-completion hook that validates every agent output file against the
         required Strategy Output Schema. Flags malformed, empty, or schema-incomplete
         files before they propagate to the next tier.

Stakeholder: Triggered by PostToolUse hook after Write/Edit events on output files.
             Reports validation results to the parent agent.

Hook Event: PostToolUse (matcher: "Write|Edit")
Timeout: 20 seconds

Validation Checks:
1. File is non-empty
2. Contains at least 1 strategy (for scout outputs, need 5)
3. Each strategy has all required schema fields
4. Bias field matches expected values
5. Expiry category is valid
6. No fabricated backtest data (checks for suspicious patterns)
7. Source citations present or [VERIFY] tags used
"""

import sys
import os
import re
from pathlib import Path

PLUGIN_ROOT = os.environ.get("CLAUDE_PLUGIN_ROOT", ".")

# Required fields that must appear in each strategy block
REQUIRED_FIELDS = [
    "Bias:",
    "Expiry Category:",
    "Underlying:",
    "Structure:",
    "Entry Conditions",
    "Exit Conditions",
    "Edge Thesis",
    "Source",
    "Reasoning Chain",
]

# Optional but recommended fields
RECOMMENDED_FIELDS = [
    "Backtest",
    "Citations",
    "Risk-Reward",
    "Legs",
]

VALID_BIASES = {"BULLISH", "BEARISH"}
VALID_EXPIRY_CATEGORIES = {"WEEKLY", "MONTHLY", "QUARTERLY"}
VALID_UNDERLYINGS = {"NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX", "MIDCAP NIFTY"}

# Patterns that suggest fabricated backtest data
FABRICATION_PATTERNS = [
    r"\b\d{2,3}%\s*win\s*rate\b",        # "85% win rate" without source
    r"sharpe\s*ratio\s*[>:]\s*[2-9]",     # Unrealistically high Sharpe
    r"max\s*drawdown\s*[<:]\s*[0-2]%",    # Unrealistically low drawdown
    r"consistent\s*\d+%\s*monthly",        # "Consistent 15% monthly returns"
    r"guaranteed\s*(profit|return)",        # No guarantees in trading
    r"risk[- ]?free\s*(return|profit)",     # Nothing is risk-free
]


def validate_output_file(filepath: str) -> dict:
    """Validate a single output file against the strategy schema."""
    result = {
        "file": os.path.basename(filepath),
        "status": "PASS",
        "errors": [],
        "warnings": [],
        "strategy_count": 0,
    }

    # Check 1: File exists and is non-empty
    if not os.path.exists(filepath):
        result["status"] = "FAIL"
        result["errors"].append("FILE_NOT_FOUND")
        return result

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(filepath, "r", encoding="latin-1") as f:
                content = f.read()
        except Exception:
            result["status"] = "FAIL"
            result["errors"].append("ENCODING_ERROR: Cannot read file")
            return result

    if not content.strip():
        result["status"] = "FAIL"
        result["errors"].append("FILE_EMPTY: Output file has no content")
        return result

    # Check 2: Count strategies
    strategy_headers = re.findall(r"^###\s+Strategy\s+\d+", content, re.MULTILINE)
    # Also check for named strategies: ### Strategy: Name
    named_strategies = re.findall(r"^###\s+Strategy[:\s]", content, re.MULTILINE)
    # Also check verifier format: ### Strategy: [Name]
    verifier_strategies = re.findall(r"^###\s+\w+", content, re.MULTILINE)

    strategy_count = max(len(strategy_headers), len(named_strategies))
    result["strategy_count"] = strategy_count

    # Determine if this is a scout output (needs 5) or enriched/verified (variable)
    is_scout_output = "scouts" in filepath.lower() or "scout" in filepath.lower()
    if is_scout_output and strategy_count < 5:
        result["status"] = "WARN"
        result["warnings"].append(
            f"INSUFFICIENT_STRATEGIES: Found {strategy_count}, expected 5 for scout output"
        )

    if strategy_count == 0 and not any(
        marker in content.lower()
        for marker in ["confidence score", "verified", "enriched"]
    ):
        result["status"] = "WARN"
        result["warnings"].append(
            "NO_STRATEGIES_DETECTED: Could not find strategy headers in expected format"
        )

    # Check 3: Required schema fields
    missing_required = []
    for field in REQUIRED_FIELDS:
        if field.lower() not in content.lower():
            missing_required.append(field)

    if missing_required:
        if len(missing_required) > 3:
            result["status"] = "FAIL"
            result["errors"].append(
                f"SCHEMA_VIOLATION: Missing {len(missing_required)} required fields: "
                f"{', '.join(missing_required)}"
            )
        else:
            result["warnings"].append(
                f"SCHEMA_INCOMPLETE: Missing fields: {', '.join(missing_required)}"
            )

    # Check 4: Bias validation
    bias_matches = re.findall(r"Bias:\s*(\w+)", content, re.IGNORECASE)
    for bias in bias_matches:
        if bias.upper() not in VALID_BIASES:
            result["warnings"].append(
                f"INVALID_BIAS: Found '{bias}', expected BULLISH or BEARISH"
            )

    # Check 5: Expiry category validation
    expiry_matches = re.findall(r"Expiry\s*Category:\s*(\w+)", content, re.IGNORECASE)
    for expiry in expiry_matches:
        if expiry.upper() not in VALID_EXPIRY_CATEGORIES:
            result["warnings"].append(
                f"INVALID_EXPIRY: Found '{expiry}', expected WEEKLY, MONTHLY, or QUARTERLY"
            )

    # Check 6: Fabrication detection
    for pattern in FABRICATION_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            # Check if it's properly flagged as unverified
            context_window = 200
            for match_obj in re.finditer(pattern, content, re.IGNORECASE):
                start = max(0, match_obj.start() - context_window)
                end = min(len(content), match_obj.end() + context_window)
                surrounding = content[start:end].lower()
                if not any(
                    tag in surrounding
                    for tag in [
                        "[verify",
                        "[hypothesis",
                        "[no backtest",
                        "[synthesized",
                        "[stale",
                        "source:",
                        "citation",
                    ]
                ):
                    result["warnings"].append(
                        f"POSSIBLE_FABRICATION: '{match_obj.group()}' found without "
                        f"source citation or verification tag"
                    )

    # Check 7: Source citations
    verify_tags = len(re.findall(r"\[VERIFY:", content))
    citation_count = len(re.findall(r"(?:Source|Citation|Reference):", content, re.IGNORECASE))
    no_backtest_tags = len(re.findall(r"\[NO BACKTEST DATA", content))

    if citation_count == 0 and verify_tags == 0:
        result["warnings"].append(
            "NO_CITATIONS: No source citations or [VERIFY] tags found"
        )

    # Check for US instrument references
    us_refs = re.findall(r"\b(?:SPX|SPY|QQQ|NASDAQ|S&P\s*500|DOW)\b", content, re.IGNORECASE)
    translation_refs = re.findall(r"(?:translat|adapt|indian equivalent)", content, re.IGNORECASE)
    if us_refs and not translation_refs:
        result["warnings"].append(
            f"US_INSTRUMENTS: Found {len(us_refs)} US instrument references without "
            f"documented Indian translation"
        )

    # Determine final status
    if result["errors"]:
        result["status"] = "FAIL"
    elif result["warnings"]:
        result["status"] = "WARN"

    return result


def main():
    if len(sys.argv) < 2:
        sys.exit(0)

    filepath = sys.argv[1]

    # Only validate files in the outputs directory
    if "outputs" not in filepath:
        sys.exit(0)

    # Only validate .md files
    if not filepath.endswith(".md"):
        sys.exit(0)

    # Skip non-strategy files
    skip_files = ["run_state.json", "shared_context.json", "rule_updater_audit.log"]
    if os.path.basename(filepath) in skip_files:
        sys.exit(0)

    result = validate_output_file(filepath)

    # Report
    if result["status"] == "FAIL":
        print(f"output-integrity: FAIL — {result['file']}")
        for error in result["errors"]:
            print(f"  ✗ {error}")
        for warning in result["warnings"]:
            print(f"  ⚠ {warning}")
    elif result["status"] == "WARN":
        print(f"output-integrity: WARN — {result['file']} ({result['strategy_count']} strategies)")
        for warning in result["warnings"]:
            print(f"  ⚠ {warning}")
    # PASS is silent — don't clutter output

    sys.exit(0)


if __name__ == "__main__":
    main()
