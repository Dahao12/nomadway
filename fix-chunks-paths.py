#!/usr/bin/env python3
"""
Fix chunks paths for Hostinger deployment.
1. Upload chunks to /_next/static/chunks/app/lang/ (without brackets)
2. Update HTML files to reference app/lang/ instead of app/%5Blang%5D/
"""

import ftplib
import os
import re

FTP_HOST = "185.245.180.59"
FTP_USER = "u608840078"
FTP_PASS = "5676484aS@@"
REMOTE_DIR = "/public_html"
LOCAL_OUT = "/Users/clowd/.openclaw/workspace/nomadway-site/out"

def connect_ftp():
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    return ftp

def ensure_dir(ftp, path):
    """Ensure directory exists on FTP server"""
    dirs = path.strip('/').split('/')
    current = ""
    for d in dirs:
        current += "/" + d
        try:
            ftp.cwd(current)
        except:
            try:
                ftp.mkd(current)
            except:
                pass

def upload_chunks(ftp):
    """Upload all chunks from [lang] to lang"""
    src_dir = f"{LOCAL_OUT}/_next/static/chunks/app/[lang]"
    
    if not os.path.exists(src_dir):
        print(f"Source directory not found: {src_dir}")
        return
    
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            if f.endswith('.js'):
                local_path = os.path.join(root, f)
                # Get relative path from [lang]
                rel_path = os.path.relpath(local_path, src_dir)
                remote_path = f"{REMOTE_DIR}/_next/static/chunks/app/lang/{rel_path}"
                
                # Ensure directory exists
                remote_dir = os.path.dirname(remote_path)
                ensure_dir(ftp, remote_dir)
                
                # Upload file
                with open(local_path, 'rb') as fp:
                    try:
                        ftp.storbinary(f'STOR {remote_path}', fp)
                        print(f"✓ Uploaded: {rel_path}")
                        count += 1
                    except Exception as e:
                        print(f"✗ Failed: {rel_path} - {e}")
    
    print(f"\nUploaded {count} chunk files")

def update_html_files(ftp):
    """Update HTML files to reference app/lang/ instead of app/%5Blang%5D/"""
    html_dirs = [
        f"{LOCAL_OUT}/pt",
        f"{LOCAL_OUT}/en"
    ]
    
    count = 0
    for html_dir in html_dirs:
        for root, dirs, files in os.walk(html_dir):
            for f in files:
                if f == 'index.html':
                    local_path = os.path.join(root, f)
                    with open(local_path, 'r', encoding='utf-8') as fp:
                        content = fp.read()
                    
                    # Replace %5Blang%5D with lang
                    new_content = content.replace('app/%5Blang%5D/', 'app/lang/')
                    
                    if new_content != content:
                        with open(local_path, 'w', encoding='utf-8') as fp:
                            fp.write(new_content)
                        
                        # Upload to FTP
                        rel_path = os.path.relpath(local_path, LOCAL_OUT)
                        remote_path = f"{REMOTE_DIR}/{rel_path}"
                        
                        with open(local_path, 'rb') as fp:
                            try:
                                ftp.storbinary(f'STOR {remote_path}', fp)
                                print(f"✓ Updated: {rel_path}")
                                count += 1
                            except Exception as e:
                                print(f"✗ Failed: {rel_path} - {e}")
    
    print(f"\nUpdated {count} HTML files")

def verify_deployment():
    """Verify the deployed site works"""
    import urllib.request
    
    test_url = "https://nomadway.com.br/_next/static/chunks/app/lang/agendamento/booking/page-cac32c89eaa8974c.js"
    try:
        response = urllib.request.urlopen(test_url, timeout=10)
        print(f"\n✓ Chunk accessible: {response.status}")
        return True
    except Exception as e:
        print(f"\n✗ Chunk not accessible: {e}")
        return False

if __name__ == "__main__":
    print("=== Fixing chunks paths for Hostinger ===\n")
    
    ftp = connect_ftp()
    print("Connected to FTP\n")
    
    print("1. Uploading chunks to app/lang/...")
    upload_chunks(ftp)
    
    print("\n2. Updating HTML files...")
    update_html_files(ftp)
    
    ftp.quit()
    print("\nDisconnected from FTP")
    
    print("\n3. Verifying deployment...")
    verify_deployment()
    
    print("\n=== Done ===")