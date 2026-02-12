#!/bin/bash

# Upload pricing pages only (faster)
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484a@@"
BASE_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Starting PRICING PAGES upgrade..."
echo ""

# Upload PT pricing
echo "📄 → /pt/pricing/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/pt/pricing/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/pt/pricing/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ PT pricing uploaded"

echo ""
echo "📄 → /en/pricing/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/en/pricing/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/en/pricing/index.html" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ EN pricing uploaded"

echo ""
echo "✅ Pricing pages updated!"
echo "🌐 Check: https://nomadway.com.br/pt/pricing"