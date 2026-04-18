#!/usr/bin/env python3
"""
Tool Scout Tracker
Tracks tools already suggested in GitHub issues (label: tool-scout)
so the daily scout never repeats a suggestion.

Usage:
  python tool-scout-tracker.py list
  python tool-scout-tracker.py check <tool-name> [tool-name ...]
  python tool-scout-tracker.py add <tool-name> [tool-name ...] --issue <number>
  python tool-scout-tracker.py sync [--token <github-token>]

Environment:
  GITHUB_TOKEN  Personal access token (used by sync if --token not provided)
  GITHUB_REPO   Defaults to chintanmehta21/claude-agents
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

STORE = Path(__file__).parent / "tool-scout-seen.json"
REPO  = os.getenv("GITHUB_REPO", "chintanmehta21/claude-agents")
LABEL = "tool-scout"


def _load() -> dict:
    if STORE.exists():
        return json.loads(STORE.read_text())
    return {"version": "1.0.0", "last_synced": None, "suggested_tools": []}


def _save(data: dict) -> None:
    STORE.write_text(json.dumps(data, indent=2))


def _seen_names(data: dict) -> set:
    return {t["name"].lower() for t in data["suggested_tools"]}


# ── commands ────────────────────────────────────────────────────────────────

def cmd_list(args):
    data = _load()
    tools = data["suggested_tools"]
    if not tools:
        print("No tools tracked yet. Run `sync` to pull from GitHub issues.")
        return
    print(f"{'Tool':<30} {'Issue':>6}  {'Date'}")
    print("-" * 55)
    for t in sorted(tools, key=lambda x: x["name"]):
        print(f"{t['name']:<30} #{t['issue']:>5}  {t['date']}")
    print(f"\nTotal: {len(tools)} tools tracked.")


def cmd_check(args):
    data  = _load()
    seen  = _seen_names(data)
    found = [n for n in args.names if n.lower() in seen]
    new   = [n for n in args.names if n.lower() not in seen]
    if found:
        print(f"ALREADY SUGGESTED: {', '.join(found)}")
    if new:
        print(f"NOT YET SUGGESTED: {', '.join(new)}")
    # exit 1 if ALL requested tools were already seen (useful in shell scripts)
    sys.exit(0 if new else 1)


def cmd_add(args):
    data  = _load()
    seen  = _seen_names(data)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    added = []
    for name in args.names:
        if name.lower() in seen:
            print(f"  skip (already tracked): {name}")
            continue
        data["suggested_tools"].append({
            "name":  name.lower(),
            "issue": args.issue,
            "date":  today,
        })
        added.append(name)
    _save(data)
    if added:
        print(f"Added {len(added)} tool(s) to tracker: {', '.join(added)}")


def cmd_sync(args):
    token = args.token or os.getenv("GITHUB_TOKEN", "")
    owner, repo = REPO.split("/", 1)

    headers = {"Accept": "application/vnd.github+json",
               "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    page, total_new = 1, 0
    data = _load()
    seen = _seen_names(data)

    print(f"Syncing tool-scout issues from {REPO} …")

    while True:
        url = (f"https://api.github.com/repos/{owner}/{repo}/issues"
               f"?labels={LABEL}&state=all&per_page=50&page={page}")
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                issues = json.loads(resp.read())
        except urllib.error.HTTPError as e:
            print(f"GitHub API error {e.code}: {e.reason}", file=sys.stderr)
            if e.code == 401:
                print("Set GITHUB_TOKEN or pass --token.", file=sys.stderr)
            sys.exit(1)

        if not issues:
            break

        for issue in issues:
            number = issue["number"]
            body   = issue.get("body") or ""
            date   = issue["created_at"][:10]

            # Extract "### Tool N: <Name>" headings
            for match in re.finditer(r"###\s+Tool\s+\d+:\s+(.+)", body):
                raw_name = match.group(1).strip()
                # Normalise: "Stripe MCP Server" → "stripe"
                name = raw_name.lower().split()[0]
                if name not in seen:
                    data["suggested_tools"].append(
                        {"name": name, "issue": number, "date": date})
                    seen.add(name)
                    total_new += 1

        page += 1

    data["last_synced"] = datetime.now(timezone.utc).isoformat()
    _save(data)
    print(f"Sync complete. {total_new} new tool(s) added. "
          f"Total tracked: {len(data['suggested_tools'])}.")


# ── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="Print all tracked tools")

    p_check = sub.add_parser("check", help="Check if tool(s) were already suggested")
    p_check.add_argument("names", nargs="+", metavar="tool-name")

    p_add = sub.add_parser("add", help="Mark tool(s) as suggested")
    p_add.add_argument("names", nargs="+", metavar="tool-name")
    p_add.add_argument("--issue", type=int, required=True, metavar="N",
                       help="GitHub issue number where the tool was suggested")

    p_sync = sub.add_parser("sync",
                             help="Pull tool names from all tool-scout GitHub issues")
    p_sync.add_argument("--token", default="", metavar="TOKEN",
                        help="GitHub personal access token (or set GITHUB_TOKEN)")

    args = parser.parse_args()
    {"list": cmd_list, "check": cmd_check, "add": cmd_add, "sync": cmd_sync}[args.cmd](args)


if __name__ == "__main__":
    main()
