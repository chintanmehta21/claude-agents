#!/usr/bin/env python3
"""
file-write-lock.py
==================
Purpose: Implements file-level mutex locking for all shared output files to
         prevent write collisions during parallel scout execution. Handles
         lock timeout (30 seconds) and deadlock detection.

Stakeholder: Triggered by PreToolUse (acquire) and PostToolUse (release) hooks
             on Write/Edit events. Protects all agents writing to shared files.

Hook Event: PreToolUse (acquire), PostToolUse (release)
Timeout: 35 seconds (acquire), 10 seconds (release)

Usage:
    python file-write-lock.py acquire <file_path>
    python file-write-lock.py release <file_path>

Lock Mechanism:
- Creates a .lock file adjacent to the target file
- Lock file contains: PID, timestamp, agent context
- Acquire: waits up to 30s, retries every 1s
- Deadlock detection: if lock file is older than 60s, force-release
"""

import sys
import os
import time
import json
from datetime import datetime, timezone
from pathlib import Path

LOCK_TIMEOUT_SECONDS = 30
LOCK_POLL_INTERVAL = 1
DEADLOCK_THRESHOLD_SECONDS = 60
PLUGIN_ROOT = os.environ.get("CLAUDE_PLUGIN_ROOT", ".")


def get_lock_path(file_path: str) -> str:
    """Get the lock file path for a given file."""
    return file_path + ".lock"


def read_lock_info(lock_path: str) -> dict:
    """Read lock information from a lock file."""
    try:
        with open(lock_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def write_lock_info(lock_path: str, info: dict) -> None:
    """Write lock information to a lock file."""
    with open(lock_path, "w", encoding="utf-8") as f:
        json.dump(info, f)


def is_lock_stale(lock_info: dict) -> bool:
    """Check if a lock is stale (older than deadlock threshold)."""
    if "timestamp" not in lock_info:
        return True
    try:
        lock_time = datetime.fromisoformat(lock_info["timestamp"])
        now = datetime.now(timezone.utc)
        age_seconds = (now - lock_time).total_seconds()
        return age_seconds > DEADLOCK_THRESHOLD_SECONDS
    except (ValueError, TypeError):
        return True


def acquire_lock(file_path: str) -> bool:
    """
    Attempt to acquire a lock on the given file.
    Waits up to LOCK_TIMEOUT_SECONDS, polling every LOCK_POLL_INTERVAL.
    Detects and breaks stale locks (deadlock detection).
    """
    lock_path = get_lock_path(file_path)
    start_time = time.time()
    retry_count = 0

    while time.time() - start_time < LOCK_TIMEOUT_SECONDS:
        # Check if lock file exists
        if os.path.exists(lock_path):
            lock_info = read_lock_info(lock_path)

            # Deadlock detection: force-release stale locks
            if is_lock_stale(lock_info):
                holder = lock_info.get("holder", "unknown")
                print(
                    f"file-write-lock: DEADLOCK_DETECTED — stale lock on {os.path.basename(file_path)} "
                    f"(held by {holder}). Force-releasing.",
                    file=sys.stderr,
                )
                try:
                    os.remove(lock_path)
                except OSError:
                    pass
                # Fall through to acquire
            else:
                # Lock is active — wait and retry
                retry_count += 1
                if retry_count == 1:
                    holder = lock_info.get("holder", "unknown")
                    print(
                        f"file-write-lock: Waiting for lock on {os.path.basename(file_path)} "
                        f"(held by {holder})",
                        file=sys.stderr,
                    )
                time.sleep(LOCK_POLL_INTERVAL)
                continue

        # Attempt to create lock file (atomic-ish on most filesystems)
        try:
            lock_info = {
                "holder": f"pid_{os.getpid()}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "file": file_path,
                "plugin_root": PLUGIN_ROOT,
            }
            # Use exclusive creation flag where possible
            fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            with os.fdopen(fd, "w") as f:
                json.dump(lock_info, f)
            return True
        except FileExistsError:
            # Race condition — another process created the lock between our check and create
            time.sleep(LOCK_POLL_INTERVAL)
            continue
        except OSError as e:
            # Directory doesn't exist or permissions issue
            print(f"file-write-lock: Cannot create lock — {e}", file=sys.stderr)
            return True  # Don't block the pipeline on lock infrastructure failure

    # Timeout — could not acquire lock
    print(
        f"file-write-lock: TIMEOUT — could not acquire lock on {os.path.basename(file_path)} "
        f"after {LOCK_TIMEOUT_SECONDS}s. Attempting force-acquire.",
        file=sys.stderr,
    )

    # Force acquire after timeout (last resort)
    try:
        if os.path.exists(lock_path):
            os.remove(lock_path)
        lock_info = {
            "holder": f"pid_{os.getpid()}_forced",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "file": file_path,
            "forced": True,
        }
        write_lock_info(lock_path, lock_info)
        return True
    except OSError:
        return True  # Don't block pipeline


def release_lock(file_path: str) -> bool:
    """Release the lock on the given file."""
    lock_path = get_lock_path(file_path)
    try:
        if os.path.exists(lock_path):
            os.remove(lock_path)
        return True
    except OSError as e:
        print(f"file-write-lock: Cannot release lock — {e}", file=sys.stderr)
        return False


def main():
    if len(sys.argv) < 3:
        print("Usage: file-write-lock.py <acquire|release> <file_path>", file=sys.stderr)
        sys.exit(0)

    action = sys.argv[1].lower()
    file_path = sys.argv[2]

    # Only lock files in the outputs directory (don't lock plugin source files)
    if "outputs" not in file_path and "rules" not in file_path:
        sys.exit(0)

    if action == "acquire":
        success = acquire_lock(file_path)
        if not success:
            print(f"file-write-lock: Failed to acquire lock on {file_path}", file=sys.stderr)
            # Exit 0 anyway — don't block the pipeline
    elif action == "release":
        release_lock(file_path)
    else:
        print(f"file-write-lock: Unknown action '{action}'", file=sys.stderr)

    sys.exit(0)


if __name__ == "__main__":
    main()
