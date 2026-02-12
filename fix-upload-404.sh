#!/bin/bash

# Complete sync of _next/static to fix missing chunks
# This overwrites ALL static assets with new build

FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_HOST="nomadway.com"
FTP_PATH="/public_html/_next/static"
LOCAL_PATH="/Users/clowd/.openclaw/workspace/nomadway/out/_next/static"

echo "🚨 Emergency: Uploading ALL _next/static files to fix 404 errors"
echo "📁 Source: $LOCAL_PATH"
echo "📍 Target: ${FTP_HOST}${FTP_PATH}"
echo ""

# Upload all chunks recursively
find "$LOCAL_PATH/chunks" -type f -name "*.js" | while read file; do
    rel_path="${file#$LOCAL_PATH/}"
    echo "📦 Uploading: $rel_path"
    curl -T "$file" -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST$FTP_PATH/$rel_path" --ftp-create-dirs
done

echo ""
echo "✅ All chunks uploaded!"
echo "🌐 Check site: https://nomadway.com.br"