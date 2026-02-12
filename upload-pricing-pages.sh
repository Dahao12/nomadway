#!/bin/bash

# Upload files directly to NomadWay FTP
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
BASE_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Starting direct file upload..."
echo ""

# Upload pricing pages (português and english)
echo "📄 Uploading pricing pages..."

echo "   → /pt/pricing/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/pt/pricing/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/pt/pricing/index.html" \
  --user "$FTP_USER:$FTP_PASS"
if [ $? -eq 0 ]; then
    echo "   ✅ pt/pricing/index.html uploaded"
else
    echo "   ❌ pt/pricing/index.html FAILED"
fi

echo ""
echo "   → /en/pricing/index.html"
curl -s --ftp-create-dirs -T "$BASE_DIR/en/pricing/index.html" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/en/pricing/index.html" \
  --user "$FTP_USER:$FTP_PASS"
if [ $? -eq 0 ]; then
    echo "   ✅ en/pricing/index.html uploaded"
else
    echo "   ❌ en/pricing/index.html FAILED"
fi

echo ""
echo "✅ Upload complete!"
echo "🌐 Site: https://nomadway.com.br"
echo ""
echo "📝 Changes applied:"
echo "   • Consultoria Inicial: €297 → GRATUITA"
echo "   • Sessão: 90min → 30min"
echo "   • Suporte por email (7 dias) → Plano de ação inicial"