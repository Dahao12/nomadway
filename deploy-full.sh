#!/bin/bash

# Deploy completo do NomadWay para Hostinger
# Sincroniza todo o diretório out/ com o servidor FTP

set -e

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
REMOTE_DIR="/public_html"
LOCAL_DIR="/Users/clowd/.openclaw/workspace/nomadway-site/out"

echo "=== Iniciando deploy completo do NomadWay ==="
echo "Diretório local: $LOCAL_DIR"
echo "Diretório remoto: $REMOTE_DIR"
echo ""

# Criar arquivo de comandos lftp
cat > /tmp/lftp_deploy.txt << EOF
set ftp:ssl-allow no
set ftp:passive-mode on
set net:timeout 60
set net:reconnect-interval-base 5
set net:max-retries 5
set ftp:use-mdtm no
set ftp:use-size no
set ftp:list-options "-a"
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $REMOTE_DIR
mirror -R -v --only-newer --parallel=4 --no-perms --no-umask --exclude-glob ".DS_Store" --exclude-glob "*.bak" $LOCAL_DIR .
quit
EOF

echo "Enviando arquivos..."
lftp -f /tmp/lftp_deploy.txt

echo ""
echo "=== Deploy completo! ==="
echo "Verificando site..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "https://nomadway.com.br/"

rm -f /tmp/lftp_deploy.txt