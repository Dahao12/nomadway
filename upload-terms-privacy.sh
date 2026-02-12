#!/bin/bash

# Upload terms e privacy pages to FTP
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
BASE_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Uploading terms and privacy pages..."
echo ""

# Upload PT terms
echo "📄 → /pt/terms/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/pt/terms/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/pt/terms/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""
echo "📄 → /pt/privacy/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/pt/privacy/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/pt/privacy/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""
echo "📄 → /en/terms/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/en/terms/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/en/terms/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""
echo "📄 → /en/privacy/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/en/privacy/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/en/privacy/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""
echo "✅ All pages uploaded!"
echo "🌐 Site: https://nomadway.com.br"
echo ""
echo "📝 New pages:"
echo "   • /pt/terms | /en/terms"
echo "   • /pt/privacy | /en/privacy"