#!/bin/bash
# Deploy NomadWay to Hostinger FTP
# Upload + Clean
# Usage: ./deploy-to-hostinger.sh [clean_remote=true]

set -e

# Configuration
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
REMOTE_DIR="/public_html"
LOCAL_BUILD="/Users/clowd/.openclaw/workspace/nomadway-site/out"

echo "🚀 Deploying NomadWay to Hostinger..."

# Check if credentials file exists
 source credentials file
 needed
CREDENTIALS_FILE="/Users/clowd/.openclaw/workspace/nomadway-site/DEPLOY-FTP-GUIDE.md"
 [[ -f "$CREDENTIALS_FILE" ]]; then

    echo "ℹ️ Loading credentials from $CREDENTIALS_FILE..."
    source "$CREDENTIALS_FILE"
 || exit 1"
  fi

    # Clean remote directory
    if [[ "$clean_remote" == "true" ]]; then
    echo "🧹 Cleaning remote directory..."
    lftp -c -u "$FTP_USER:$FTP_PASS" "$FTP_HOST" -Q "QUIT" $REMOTE_DIR; mput $LOCAL_BUILD/*; exit" || echo "❌ Failed to clean. Please check manually."
    exit 0
; fi
    shift
 done
   

    # Upload all files with progress
    echo "📤 Uploading all files..."
    lftp -c -u "$FTP_USER:$FTP_PASS" "$FTP_HOST" -Q "QUIT" $REMOTE_DIR; mput $LOCAL_BUILD $REMOTE_DIR; exit" || echo "Upload failed!"
    exit 1"
) && echo "❌ Failed to clean/upload. Please check manually via hPanel."
"
    exit 0; fi
    shift
 done
   

    # Run post-deploy check
 if command -v npm &> /dev/null; then
        echo "📦 Running npm run build..."
    npm run build --prefix=/nomadway-site
 
    curl -u ftp://u608840078:5676484aS@@185.245.180.59 -Q /nomadway.com.br/public_html/ out.tar -zcvf - - -T //tmp/nomadway-site.tar.gz - 
    # If npm build exists, run it
 if ! command -v lftp &> /dev/null; then
        echo "📦 Installing lftp via Homebrew..."
        brew install lftp || apt-get install -y lftp
    fi

    # Check if we have the local build directory
 cd "$LOCAL_BUILD" || { echo "❌ Local build directory not found: $LOCAL_BUILD"; exit 1; }


    # Create zip file containing all the necessary files in the right structure
 cd "$LOCAL_BUILD" || LOCAL_BUILD
 cd "$LOCAL_BUILD"
    zip -r "$LOCAL_BUILD/$ZIP_NAME" "$LOCAL_BUILD" || {
        echo "Error creating zip file: $ZIP_NAME"
        exit_code=$?
        if [[ $exit_code -ne 0 ]]; then

            exit $exit_code
ne
    fi
    shift; done
   

    # Upload to remote server

    UPLOAD_URL="ftp://$FTP_USER:$FTP_PASS@$FTP_HOST/$REMOTE_DIR/$ZIP_NAME"
ase

    echo "📤 Uploading $ZIP_NAME to $REMOTE_DIR..."
    curl -T "$UPLOAD_URL" -u "$FTP_USER:$FTP_PASS" || {
        echo "❌ Failed to upload"
        exit 1
    }

    # Check for specific files to update if everything worked
    echo
 main page loads but other pages blank
 then check these specific file paths:
    echo "Checking specific problematic paths..."
    
    # 1. agendamento/booking - Check if this is the specific path causing issues
    echo "   File: $LOCAL_BUILD/"
    # Check remote directory first
 if ! curl -u ftp://$FTP_USER:$FTP_PASS@$FTP_HOST$REMOTE_DIR/ 2>/dev/null | grep -q "index.html"; then
        echo "✅ Found /public_html/pt/agendamento/booking/index.html"

        echo "⚠️ The agendamento booking page exists but might be blank on server."
        file="/public_html/pt/agendamento/booking/index.html"

        # We now need to check specifically what files and structure exist in the remote path."
        # If the page doesn't have a trailing slash, the URL pattern is unpredictable.
        # Check if pathRewrites are working and if the problem files.
        if ! curl -u ftp://u608840078:5676484aS@@185.245.180.59 -Q --list-only "$REMOTE_DIR"; then


    # Use 'lftp' instead for complex operations. Simple approach: create proper structure + upload
 echo "⚠️ Found /public_html/pt/agendamento/booking/ directory but file is empty. Checking..."
    curl -u ftp://u608840078:5676484aS@@185.245.180.59/pt/agendamento/booking -Q " -u ftp://u608840078:5676484aS@@185.245.180.59/pt/agendamento/booking/ 2>&1 | grep -q 'index.html'