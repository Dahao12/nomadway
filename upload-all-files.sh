#!/bin/bash

# Upload all necessary files to fix formatting
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
BASE_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Uploading ALL files needed for site to work..."
echo ""

# Upload CSS
echo "📋 Uploading CSS files..."
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/css/11024a0f41efdf16.css" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/css/11024a0f41efdf16.css" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ CSS uploaded"

# Upload all chunks (except special char ones)
echo ""
echo "📦 Uploading JS chunks..."
find "$BASE_DIR/_next/static/chunks" -name "*.js" ! -path "*\[lang\]*" -print0 | while IFS= read -r -d '' file; do
  rel_path="${file#$BASE_DIR/}"
  echo "   → $rel_path"
  curl -s --ftp-create-dirs -T "$file" \
    --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/$rel_path" \
    --user "$FTP_USER:$FTP_PASS"
done

echo ""
echo "✅ All files uploaded!"
echo "🌐 Site should work now: https://nomadway.com.br"