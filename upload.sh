#!/bin/bash
# Upload NomadWay Site via FTP

HOST="185.245.180.59"
USER="u608840078"
PASS='5676484aS@@'
LOCAL="/Users/clowd/.openclaw/workspace/nomadway-site/out"

echo "🚀 Fazendo upload do site NomadWay..."
echo ""

# Arquivos principais
echo "📤 Arquivos principais..."
curl -s -T "$LOCAL/index.html" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/favicon.png" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/favicon.svg" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/logo.png" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/logo2.png" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/robots.txt" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/sitemap.xml" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/404.html" --user "$USER:$PASS" "ftp://$HOST/"
curl -s -T "$LOCAL/manifest.json" --user "$USER:$PASS" "ftp://$HOST/"
echo "  ✅ Arquivos raiz"

# Pasta pt
echo "📤 Pasta pt/..."
curl -s --ftp-create-dirs -T "$LOCAL/pt/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/"
curl -s --ftp-create-dirs -T "$LOCAL/pt/contact/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/contact/"
curl -s --ftp-create-dirs -T "$LOCAL/pt/services/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/services/"
curl -s --ftp-create-dirs -T "$LOCAL/pt/pricing/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/pricing/"
curl -s --ftp-create-dirs -T "$LOCAL/pt/privacy/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/privacy/"
curl -s --ftp-create-dirs -T "$LOCAL/pt/terms/index.html" --user "$USER:$PASS" "ftp://$HOST/pt/terms/"
echo "  ✅ pt/"

# Pasta en
echo "📤 Pasta en/..."
curl -s --ftp-create-dirs -T "$LOCAL/en/index.html" --user "$USER:$PASS" "ftp://$HOST/en/"
curl -s --ftp-create-dirs -T "$LOCAL/en/contact/index.html" --user "$USER:$PASS" "ftp://$HOST/en/contact/"
curl -s --ftp-create-dirs -T "$LOCAL/en/services/index.html" --user "$USER:$PASS" "ftp://$HOST/en/services/"
curl -s --ftp-create-dirs -T "$LOCAL/en/pricing/index.html" --user "$USER:$PASS" "ftp://$HOST/en/pricing/"
curl -s --ftp-create-dirs -T "$LOCAL/en/privacy/index.html" --user "$USER:$PASS" "ftp://$HOST/en/privacy/"
curl -s --ftp-create-dirs -T "$LOCAL/en/terms/index.html" --user "$USER:$PASS" "ftp://$HOST/en/terms/"
echo "  ✅ en/"

echo ""
echo "🎉 Upload completo!"
echo "🌐 Teste: https://nomadway.com.br"