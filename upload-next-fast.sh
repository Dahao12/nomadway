#!/bin/bash

FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_HOST="nomadway.com"
LOCAL_BASE="/Users/clowd/.openclaw/workspace/nomadway/out/_next/static"
REMOTE_BASE="/public_html/_next/static"

echo "🚨 Uploading JS chunks with optimized uploads"
echo ""

# Count files
TOTAL=$(find "$LOCAL_BASE" -name "*.js" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL JS files"
echo ""

COUNTER=0

# Upload all JS files
find "$LOCAL_BASE" -name "*.js" | while read file; do
    rel_path="${file#$LOCAL_BASE/}"
    remote_url="ftp://${FTP_HOST}:${FTP_PASS}@${FTP_HOST}${REMOTE_BASE}/${rel_path}"

    COUNTER=$((COUNTER + 1))
    printf "\r📦 [%d/%d] Uploading %s" "$COUNTER" "$TOTAL" "$rel_path"

    curl -s -T "$file" "$remote_url" --ftp-create-dirs --connect-timeout 5 --max-time 30

    if [ $? -eq 0 ]; then
        printf " ✅"
    else
        printf " ❌"
    fi
done

echo ""
echo ""
echo "✅ Upload complete!"
echo "🌐 Check: https://nomadway.com.br"