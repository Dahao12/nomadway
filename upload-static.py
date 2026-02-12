#!/usr/bin/env python3

import os
import subprocess
from pathlib import Path

# Configuration
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
FTP_HOST = "nomadway.com"
FTP_BASE = "/public_html/_next/static"
LOCAL_BASE = Path("/Users/clowd/.openclaw/workspace/nomadway/out/_next/static")

def upload_file(local_path, remote_path):
    """Upload a single file using curl"""
    cmd = [
        "curl",
        "-T", str(local_path),
        "-u", f"{FTP_USER}:{FTP_PASS}",
        f"ftp://{FTP_HOST}{remote_path}",
        "--ftp-create-dirs"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def recursive_upload(src_prefix, dest_prefix):
    """Recursively upload all JS files"""
    count = 0
    for js_file in src_prefix.rglob("*.js"):
        rel_path = js_file.relative_to(src_prefix)
        remote_path = f"{dest_prefix}/{rel_path}"

        print(f"📦 Uploading {rel_path}...")
        success = upload_file(js_file, remote_path)

        if success:
            count += 1
            print(f"   ✅ {count}")
        else:
            print(f"   ❌ Failed: {js_file}")

    return count

def main():
    print("🚨 Uploading ALL JS chunks to fix 404 errors\n")

    # Update webpack
    print("📦 Uploading webpack chunks...")
    webpack_count = recursive_upload(
        LOCAL_BASE / "chunks",
        FTP_BASE + "/chunks"
    )

    # Update app chunks
    print("\n📦 Uploading app chunks...")
    app_count = recursive_upload(
        LOCAL_BASE / "chunks" / "app",
        FTP_BASE + "/chunks/app"
    )

    total = webpack_count + app_count
    print(f"\n✅ Total uploaded: {total} files")
    print(f"🌐 Check: https://nomadway.com.br")

if __name__ == "__main__":
    main()