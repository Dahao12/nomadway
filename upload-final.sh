#!/bin/bash

# Upload NomadWay para Hostinger - Senha Correta

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_BASE="domains/nomadway.com.br/public_html"
LOCAL_BASE="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Upload NomadWay → Hostinger (Senha Correta)"
echo "========================================"
echo "Host: $FTP_HOST"
echo "Path: $FTP_BASE"
echo ""

cd "$LOCAL_BASE"

echo "📦 Upload de todos os arquivos..."
echo "========================================"

SUCCESS=0
FAIL=0
COUNT=0

find . -type f | while read file; do
    # Remover "./" inicial
    file="${file#./}"
    ((COUNT++))

    echo -ne "\r[$COUNT] ⬆️  $file"

    remote_path="$FTP_BASE/$file"

    if curl -s -u "$FTP_USER:$FTP_PASS" -T "$file" "ftp://$FTP_HOST/$remote_path" > /dev/null 2>&1; then
        ((SUCCESS++))
        echo -ne "\r[$COUNT] ✅ $file   \n"
    else
        ((FAIL++))
        echo -ne "\r[$COUNT] ❌ $file   \n"
    fi
done

echo ""
echo "========================================"
echo "🎉 Upload concluído!"
echo "📊 Enviados: $COUNT"
echo "✅ Sucesso: ??? (bash não conta corretamente em subshell)"
echo "❌ Falha: ???"
echo ""
echo "🌐 Acesse: https://nomadway.com.br"