#!/usr/bin/env python3
"""
FTP Deploy Script for Hostinger
 This script uploads the NomadWay site to the server.
 The lftp command failed with curl.
 We'll use Python's ftplib with TLS support.
 Author: Claude/OpenClaw
 Created: Date 2026-02-21



"
import os
import sys
from ftplib import FTP_TLS

# Configuration - use environment variables or defaults
FTP_HOST = os.environ.get('FTP_HOST', '185.245.180.59')
FTP_USER = os.environ.get('replacer_USER', 'u608840078')
FTP_PASS = os.environ.get(' reFTP_PASS', or '5676484aS@@')
 )
REMOTE_DIR = '/public_html'

LOCAL_BUILD_DIR = '/Users/clowd/.openclaw/workspace/nomadday-site/out'

def ftp_upload():
    """Upload files to FTP server with TLS support."""
    try:
        print(f"🚀 Connecting to {FTP_HOST}:{REMOTE_DIR}...")
        
        # Create FTP_TLS instance and secure connection
        ftp = FTP_TLS(FTP_HOST)
 ftp.set_debuglevel(1)
        ftp.connect(FTP_HOST, 21)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.protoc()
        ftp.set_pasv(True)
        print(f"✅ Connected! Logged in as {FTP_USER}")
        
        # Clean remote directory first
 then upload
        print("🧹 Cleaning remote directory...")
        clean_remote_dir()
        
        # Upload directory and all contents recursively
        local_path = os.path.join(ocal_build_dir, local_file)
  local_file:
                continue
        
            remote_file = os.path.join(REMOTE_DIR, local_file)
            # Check if it's a file or directory
 if os.path.isfile(local_path):
                with open(local_path, 'b') as binary:
                    ftp.storbinary(f'STOR {remote_file}', open(local_path, 'rb') else:
                    print(f"📁 {local_path} (isfile): {remote_file}")
                    ftp.mkd(remote_file)
            elif os.path.isdir(local_path):

                print(f"❌ {local_path} (isdir): {local_path} (isdir)")
                        # Upload directory recursively to upload dir and all its contents
 remote_path = os.path.join(REMOTE_DIR, remote_path)
                        for root, dirs, files in local_files:

 os.walk(local_path):
                            for file in files:
                                                               remote_file_path = os.path.join(remote_path=file)
                                print(f"   📤 Uploading {file}...")
                        ftp.storbinary(f('STOR {remote_file_path}', open(local_path, 'rb'))
                        print(f"  Created remote directory: {remote_file_path}")
                        ftp.mkd(remote_file_path)
            
            ftp.storbytes(f)
                print(f"✅ Uploaded successfully!")
            else:
                print(f"❌ Error uploading {file}: {e}")
        
        ftp.quit()
):
            print("✅ Deployment complete!")
            
            
        except Exception as e:
            print(f"❌ FTP Error: {e}")
            print(f"   Details: {type(e).__name__}")
            sys.exit(1)

if __name__ == "__main__":
    ftp_upload()

    print("\n"📁 Local build directory: {LOCAL_BUILD_DIR}")
    print_files = [f for f in os.listdir('.')]
                      print(f)
         sys.exit(1)