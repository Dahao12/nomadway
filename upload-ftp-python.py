#!/usr/bin/env python3
import ftplib
import os
from pathlib import Path

FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
LOCAL_DIR = "/Users/clowd/.openclaw/workspace/nomadway/out"
REMOTE_DIR = "/domains/nomadway.com.br/public_html"

def upload_file(ftp, local_path, remote_path):
    with open(local_path, 'rb') as f:
        ftp.storbinary(f'STOR {remote_path}', f)
    print(f"  ✅ {remote_path}")

def ensure_dir(ftp, remote_dir):
    parts = remote_dir.split('/')
    current = ''
    for part in parts:
        if part:
            current = f"{current}/{part}" if current else part
            try:
                ftp.mkd(current)
            except:
                pass  # Directory might already exist

def upload_directory(ftp, local_dir, remote_dir, skip_lang=False):
    for root, dirs, files in os.walk(local_dir):
        # Skip [lang] directories if skip_lang is True (we'll handle specially)
        if skip_lang and '[lang]' in root:
            continue

        relative_path = os.path.relpath(root, local_dir)
        remote_path = f"{REMOTE_DIR}/{relative_path}".replace('//', '/') if relative_path else REMOTE_DIR

        # Ensure remote directory exists
        ensure_dir(ftp, remote_path)

        # Upload files
        for file in files:
            local_file = os.path.join(root, file)
            remote_file = f"{remote_path}/{file}".replace('//', '/')
            upload_file(ftp, local_file, remote_file)

print("🚀 Starting FTP upload with Python ftplib...")

try:
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)

    print("✅ Connected to FTP server")

    # Upload all directories except [lang] first
    print("\n📦 Uploading main files (excluding [lang] directories)...")
    upload_directory(ftp, LOCAL_DIR, REMOTE_DIR, skip_lang=True)

    # Now handle [lang] directories separately
    print("\n📦 Uploading [lang] directories...")
    lang_dir = os.path.join(LOCAL_DIR, '_next/static/chunks/app/[lang]')
    if os.path.exists(lang_dir):
        remote_lang_dir = f"{REMOTE_DIR}/_next/static/chunks/app/[lang]"
        ensure_dir(ftp, remote_lang_dir)

        upload_directory(ftp, lang_dir, remote_lang_dir, skip_lang=False)

    ftp.quit()
    print("\n✅ Upload complete!")
    print("🌐 Site: https://nomadway.com.br")

except Exception as e:
    print(f"❌ Error: {e}")