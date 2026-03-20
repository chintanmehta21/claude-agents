#!/usr/bin/env python3
"""
rule-updater.py
===============
Purpose: Intercepts 'Added by Claude' strings from subagent outputs and safely
         merges new rules into rules/OptionsTrading.md without overwriting existing
         content. Handles conflicting entries and encoding errors.

Stakeholder: Triggered by PostToolUse hook on Write/Edit events. Works with all
             agents that may discover new market rules during research.

Hook Event: PostToolUse (matcher: "Write|Edit")
Timeout: 15 seconds

Resolution Logic for Conflicts:
- If a new rule matches an existing rule title, it goes to '## Conflicts — Pending Review'
- If two 'Added by Claude' entries arrive in the same run, both are appended (no overwrite)
- Encoding errors are caught and logged; the hook does not crash the pipeline
- Attempts to disable existing guardrails are rejected and logged
"""

import sys
import os
import re
import json
from datetime import datetime, timezone
from pathlib import Path

PLUGIN_ROOT = os.environ.get("CLAUDE_PLUGIN_ROOT", ".")
RULES_FILE = os.path.join(PLUGIN_ROOT, "rules", "OptionsTrading.md")
AUDIT_LOG = os.path.join(PLUGIN_ROOT, "outputs", "rule_updater_audit.log")

# Guardrail keywords that must never be removed or disabled
GUARDRAIL_KEYWORDS = [
    "SEBI",
    "margin",
    "peak margin",
    "position limit",
    "STT",
    "physical delivery",
    "lot size",
    "settlement",
]


def log_audit(message: str) -> None:
    """Append an audit entry to the audit log file."""
    try:
        os.makedirs(os.path.dirname(AUDIT_LOG), exist_ok=True)
        with open(AUDIT_LOG, "a", encoding="utf-8") as f:
            timestamp = datetime.now(timezone.utc).isoformat()
            f.write(f"[{timestamp}] {message}\n")
    except (OSError, IOError):
        # If we can't write the audit log, print to stderr but don't crash
        print(f"AUDIT_LOG_FAILURE: {message}", file=sys.stderr)


def read_file_safe(filepath: str) -> str:
    """Read a file with encoding error handling."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            with open(filepath, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    log_audit(f"ENCODING_ERROR: Could not read {filepath} with any supported encoding")
    return ""


def extract_added_by_claude(content: str) -> list:
    """Extract all 'Added by Claude' tagged entries from content."""
    # Match patterns like: Added by Claude — run_20240101_120000
    # or: <!-- Added by Claude -->
    # or: **Added by Claude**
    pattern = r"Added by Claude[^\n]*"
    matches = re.finditer(pattern, content, re.IGNORECASE)
    entries = []
    for match in matches:
        # Get the context around the match (previous 500 chars for the rule content)
        start = max(0, match.start() - 500)
        end = min(len(content), match.end() + 200)
        context = content[start:end]
        entries.append({
            "marker": match.group(0),
            "context": context.strip(),
            "position": match.start(),
        })
    return entries


def check_for_guardrail_removal(new_content: str) -> bool:
    """Check if the new content attempts to remove or disable an existing guardrail."""
    removal_patterns = [
        r"remove\s+(the\s+)?rule",
        r"delete\s+(the\s+)?rule",
        r"disable\s+(the\s+)?guardrail",
        r"override\s+(the\s+)?restriction",
        r"ignore\s+SEBI",
        r"skip\s+margin",
        r"bypass\s+compliance",
    ]
    for pattern in removal_patterns:
        if re.search(pattern, new_content, re.IGNORECASE):
            return True
    return False


def extract_rule_title(context: str) -> str:
    """Extract the rule title from a context block."""
    # Look for ### heading
    heading_match = re.search(r"###\s+(.+)", context)
    if heading_match:
        return heading_match.group(1).strip()
    # Look for **bold** title
    bold_match = re.search(r"\*\*(.+?)\*\*", context)
    if bold_match:
        return bold_match.group(1).strip()
    return "Untitled Rule"


def check_existing_rules(rules_content: str, new_title: str) -> bool:
    """Check if a rule with the same title already exists."""
    # Normalize for comparison
    normalized_new = new_title.lower().strip()
    # Find all existing rule titles
    existing_titles = re.findall(r"###\s+(.+)", rules_content)
    for title in existing_titles:
        if title.lower().strip() == normalized_new:
            return True
    return False


def format_new_rule_entry(entry: dict, run_id: str) -> str:
    """Format a new rule entry for insertion into OptionsTrading.md."""
    title = extract_rule_title(entry["context"])
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"""
### {title}
- **Rule:** {entry['context'][:300]}
- **Source:** [Discovered during pipeline run — verify independently]
- **Discovered by:** Agent output containing 'Added by Claude'
- **Date:** {date}
- **Added by Claude** — {run_id}
"""


def format_conflict_entry(entry: dict, run_id: str, existing_rule: str) -> str:
    """Format a conflict entry for the conflicts section."""
    title = extract_rule_title(entry["context"])
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"""
### CONFLICT: {title}
- **Existing rule:** Already present in OptionsTrading.md
- **Conflicting discovery:** {entry['context'][:300]}
- **Source of conflict:** Agent output — {entry['marker']}
- **Date:** {date}
- **Added by Claude** — {run_id}
- **Resolution:** PENDING
"""


def main():
    """Main entry point — called by PostToolUse hook after Write/Edit."""
    if len(sys.argv) < 2:
        # No file path provided — this hook was triggered for a non-relevant write
        sys.exit(0)

    written_file = sys.argv[1]

    # Only process files that might contain new rules
    # Skip the rules file itself to avoid infinite loops
    if os.path.abspath(written_file) == os.path.abspath(RULES_FILE):
        sys.exit(0)

    # Read the written file
    if not os.path.exists(written_file):
        sys.exit(0)

    content = read_file_safe(written_file)
    if not content:
        sys.exit(0)

    # Check for 'Added by Claude' markers
    entries = extract_added_by_claude(content)
    if not entries:
        sys.exit(0)

    log_audit(f"DETECTED: {len(entries)} 'Added by Claude' entries in {written_file}")

    # Read existing rules file
    if not os.path.exists(RULES_FILE):
        log_audit(f"RULES_FILE_MISSING: {RULES_FILE} does not exist — cannot merge rules")
        print(f"WARNING: rules/OptionsTrading.md not found. New rules cannot be merged.", file=sys.stderr)
        sys.exit(0)

    rules_content = read_file_safe(RULES_FILE)
    if not rules_content:
        log_audit(f"RULES_FILE_EMPTY: {RULES_FILE} is empty or unreadable")
        sys.exit(0)

    # Determine run ID from output directory or timestamp
    run_id = f"run_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    # Process each entry
    new_rules = []
    conflicts = []

    for entry in entries:
        # Check for guardrail removal attempts
        if check_for_guardrail_removal(entry["context"]):
            log_audit(f"GUARDRAIL_VIOLATION: Attempted guardrail removal detected in {written_file}")
            log_audit(f"  Context: {entry['context'][:200]}")
            print(f"BLOCKED: Attempted guardrail removal detected and rejected. See audit log.", file=sys.stderr)
            continue

        # Check if rule already exists
        title = extract_rule_title(entry["context"])
        if check_existing_rules(rules_content, title):
            # This is a conflict — existing rule with same title
            conflicts.append(format_conflict_entry(entry, run_id, title))
            log_audit(f"CONFLICT: Rule '{title}' already exists — adding to conflicts section")
        else:
            new_rules.append(format_new_rule_entry(entry, run_id))
            log_audit(f"NEW_RULE: Adding rule '{title}' to Discovered Rules section")

    # Merge into rules file
    if not new_rules and not conflicts:
        sys.exit(0)

    try:
        # Find insertion points
        discovered_marker = "## Discovered Rules"
        conflicts_marker = "## Conflicts — Pending Review"

        if new_rules:
            # Find the 'No discovered rules yet' placeholder and insert before it
            placeholder = "*No discovered rules yet.*"
            if placeholder in rules_content:
                rules_content = rules_content.replace(
                    placeholder,
                    "\n".join(new_rules) + "\n"
                )
            else:
                # Append after the Discovered Rules header
                idx = rules_content.find(discovered_marker)
                if idx != -1:
                    # Find the end of the header line
                    end_of_header = rules_content.find("\n", idx) + 1
                    rules_content = (
                        rules_content[:end_of_header]
                        + "\n".join(new_rules)
                        + "\n"
                        + rules_content[end_of_header:]
                    )

        if conflicts:
            # Find the 'No conflicts pending' placeholder and insert before it
            placeholder = "*No conflicts pending.*"
            if placeholder in rules_content:
                rules_content = rules_content.replace(
                    placeholder,
                    "\n".join(conflicts) + "\n"
                )
            else:
                # Append after the Conflicts header
                idx = rules_content.find(conflicts_marker)
                if idx != -1:
                    end_of_header = rules_content.find("\n", idx) + 1
                    rules_content = (
                        rules_content[:end_of_header]
                        + "\n".join(conflicts)
                        + "\n"
                        + rules_content[end_of_header:]
                    )

        # Write back the updated rules file
        with open(RULES_FILE, "w", encoding="utf-8") as f:
            f.write(rules_content)

        log_audit(f"MERGED: {len(new_rules)} new rules, {len(conflicts)} conflicts added")
        print(f"rule-updater: Merged {len(new_rules)} new rules, {len(conflicts)} conflicts")

    except (OSError, IOError) as e:
        log_audit(f"WRITE_ERROR: Failed to update rules file — {e}")
        print(f"WARNING: rule-updater failed to write — {e}", file=sys.stderr)
        # Do not crash the pipeline
        sys.exit(0)


if __name__ == "__main__":
    main()
