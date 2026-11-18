from __future__ import annotations

import msvcrt
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PORT = 4173
URL = f"http://127.0.0.1:{PORT}/arena/"
LOCK_PATH = Path(__file__).with_name("arena-launch.lock")
CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)


def edge_executable() -> Path | None:
    candidates = (
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))
        / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
        / "Microsoft" / "Edge" / "Application" / "msedge.exe",
    )
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def acquire_launch_lock():
    handle = LOCK_PATH.open("a+b")
    if LOCK_PATH.stat().st_size == 0:
        handle.write(b"0")
        handle.flush()
    handle.seek(0)
    try:
        msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        handle.close()
        return None
    return handle


def local_page_is_ready() -> bool:
    try:
        with urllib.request.urlopen(URL, timeout=3) as response:
            page = response.read(8192).decode("utf-8", errors="replace")
            return response.status == 200 and "FIGHTROOM ARENA" in page
    except (OSError, urllib.error.URLError, TimeoutError):
        return False


def port_is_open() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", PORT), timeout=0.5):
            return True
    except OSError:
        return False


def start_local_server() -> None:
    subprocess.Popen(
        [
            sys.executable,
            "-m",
            "http.server",
            str(PORT),
            "--bind",
            "127.0.0.1",
        ],
        cwd=PROJECT_ROOT,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=CREATE_NO_WINDOW,
        close_fds=True,
    )


def arena_app_already_open() -> bool:
    query = (
        "$p=Get-CimInstance Win32_Process -Filter \"Name='msedge.exe'\" "
        "| Where-Object { $_.CommandLine -and "
        "$_.CommandLine.Contains('--app=http://127.0.0.1:4173/arena/') }; "
        "if($p){'FIGHTROOM_APP_RUNNING'}"
    )
    try:
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command", query],
            capture_output=True,
            text=True,
            timeout=5,
            creationflags=CREATE_NO_WINDOW,
            check=False,
        )
        return "FIGHTROOM_APP_RUNNING" in result.stdout
    except (OSError, subprocess.TimeoutExpired):
        return False


def main() -> int:
    if not (PROJECT_ROOT / "arena" / "index.html").is_file():
        print(f"Canonical game page is missing under: {PROJECT_ROOT}")
        return 1

    lock = acquire_launch_lock()
    if lock is None:
        return 0

    try:
        if not local_page_is_ready():
            if port_is_open():
                print(
                    f"Port {PORT} is already used by another service. "
                    "No duplicate server was started."
                )
                return 1

            start_local_server()
            for _ in range(10):
                time.sleep(1)
                if local_page_is_ready():
                    break

        if not local_page_is_ready():
            print("The local FIGHTROOM server did not become ready.")
            return 1

        if arena_app_already_open():
            print("FIGHTROOM ARENA is already open; no second window was created.")
            return 0

        edge = edge_executable()
        if edge is None:
            print("Microsoft Edge was not found.")
            return 1

        subprocess.Popen(
            [str(edge), f"--app={URL}", "--no-first-run"],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=CREATE_NO_WINDOW,
            close_fds=True,
        )
        print(f"FIGHTROOM ARENA opened at {URL}")
        return 0
    finally:
        try:
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
        finally:
            lock.close()


if __name__ == "__main__":
    raise SystemExit(main())
