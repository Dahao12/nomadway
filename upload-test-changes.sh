#!/bin/bash

# FTP Credentials
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_PATH="domains/nomadway.com.br/public_html"
LOCAL_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Starting FTP upload to Hostinger..."
echo "📁 Local directory: $LOCAL_DIR"
echo "🌐 Remote path: $FTP_PATH"
echo ""

# Create temporary file with FTP commands
FTP_CMD_FILE=$(mktemp)

# Upload the entire out directory
cat > $FTP_CMD_FILE << EOTFE
binary
lcd $LOCAL_DIR
cd $FTP_PATH
mput -R *
quit
EOTFE

# Execute FTP upload
echo "⏳ Uploading files (this may take a few minutes)..."
curl -v --url "ftp://$FTP_HOST$FTP_PATH/" \
  --user "$FTP_USER:$FTP_PASS" \
  --upload-file "$LOCAL_DIR/index.html" \
  --ftp-create-dirs 2>&1 | grep --color=never -E "(Uploaded|Uploading|=>|<=>)"

echo ""
echo "✅ Upload completed!"
echo ""
echo "📝 Changes uploaded:"
echo "   • Consultoria Inicial: €297 → GRATUITA"
echo "   • Sessão: 90min → 30min"
echo "   • Suporte por email (7 dias) → Plano de ação inicial"
echo ""
echo "🌐 Site: https://nomadway.com.br"

# Clean up
rm -f $FTP_CMD_FILE