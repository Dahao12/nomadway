#!/bin/bash

FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_HOST="nomadway.com"
BASE_PATH="/Users/clowd/.openclaw/workspace/nomadway/out/_next/static/chunks/app"

echo "🚨 Uploading [lang] folder (CRITICAL)"

# Upload layout
echo "→ layout-1ac380bea73ec035.js"
curl -T "$BASE_PATH"/[lang]/layout-1ac380bea73ec035.js \
  -u "$FTP_USER:$FTP_PASS" \
  "ftp://$FTP_HOST/public_html/_next/static/chunks/app/%5Blang%5D/layout-1ac380bea73ec035.js" \
  --ftp-create-dirs

# Upload page
echo "→ page-260d1e2366448401.js"
curl -T "$BASE_PATH"/[lang]/page-260d1e2366448401.js \
  -u "$FTP_USER:$FTP_PASS" \
  "ftp://$FTP_HOST/public_html/_next/static/chunks/app/%5Blang%5D/page-260d1e2366448401.js"

# Upload subfolder pages
for folder in contact pricing privacy services terms; do
  if ls "$BASE_PATH"/[lang]/$folder/page-*.js 2>/dev/null; then
    FILE=$(ls "$BASE_PATH"/[lang]/$folder/page-*.js | head -1)
    FILENAME=$(basename "$FILE")

    echo "→ $folder/$FILENAME"
    curl -T "$FILE" \
      -u "$FTP_USER:$FTP_PASS" \
      "ftp://$FTP_HOST/public_html/_next/static/chunks/app/%5Blang%5D/$folder/$FILENAME" \
      --ftp-create-dirs
  fi
done

echo ""
echo "✅ [lang] folder uploaded!"