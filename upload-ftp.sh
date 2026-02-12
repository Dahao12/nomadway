#!/bin/bash

# Script para upload do site NomadWay para Hostinger via FTP

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@"
FTP_PATH="public_html"
LOCAL_PATH="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "Iniciando upload para Hostinger..."
echo "Host: $FTP_HOST"
echo "Path: $FTP_PATH"
echo ""

# Criar script FTP temporário
FTP_SCRIPT="/tmp/ftp-upload-$$.txt"

cat << EOF > $FTP_SCRIPT
open $FTP_HOST
user $FTP_USER $FTP_PASS
cd $FTP_PATH
lcd $LOCAL_PATH
binary
prompt
mput -r *
by
EOF

# Executar FTP
ftp -n < $FTP_SCRIPT

# Limpar
rm $FTP_SCRIPT

echo ""
echo "Upload concluído!"
echo "Verifique: https://nomadway.com.br"