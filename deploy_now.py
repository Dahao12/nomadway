#!/usr/bin/env python3
"""Simple FTP deploy for NomadWay"""
import os
from ftplib import FTP

FTP_HOST = '185.245.180.59'
FTP_USER = 'u608840078'
FTP_PASS = '5676484aS@@'
REMOTE_DIR = '/public_html'
LOCAL_DIR = '/Users/clowd/.openclaw/workspace/nomadway-site/out'

def upload_dir(ftp, local_dir, remote_dir):
    """Upload directory recursively"""
    for item in os.listdir(local_dir):
        if item.startswith('.'):
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            print(f"📤 {item}")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
        elif os.path.isdir(local_path):
            try:
                ftp.mkd(remote_path)
            except:
                pass
            upload_dir(ftp, local_path, remote_path)

def main():
    print(f"🚀 Connecting to {FTP_HOST}...")
    ftp = FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("✅ Connected!")
    
    # List and delete remote files first
    print("🧹 Cleaning remote directory...")
    try:
        for item in ftp.nlst(REMOTE_DIR):
            if item not in ['.', '..']:
                try:
                    ftp.delete(item)
                except:
                    try:
                        ftp.rmd(item)
                    except:
                        pass
    except Exception as e:
        print(f"   Note: {e}")
    
    print("📤 Uploading files...")
    upload_dir(ftp, LOCAL_DIR, REMOTE_DIR)
    
    ftp.quit()
    print("✅ Done!")

if __name__ == "__main__":
    main()