#!/bin/bash

# Script para upload do NomadWay para Hostinger via FTP com curl

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_PATH="domains/nomadway.com.br/public_html"
LOCAL_PATH="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Iniciando upload para Hostinger..."
echo "Host: $FTP_HOST"
echo "Path: $FTP_PATH"
echo "Local: $LOCAL_PATH"
echo ""

# Contador
SUCCESS=0
FAILED=0

# Função para upload arquivo único
upload_file() {
    local file="$1"
    local remote_path="$2"

    local rel_path="${file#$LOCAL_PATH/}"
    local full_remote_path="$FTP_PATH/$rel_path"

    # Criar diretórios remotos se necessário
    local dir=$(dirname "$rel_path")
    if [[ "$dir" != "." ]]; then
        # Criar diretório remoto
        curl -s -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST/$FTP_PATH/$dir" --mkd 2>/dev/null || true
    fi

    echo -n "⬆️  Upload: $rel_path ... "
    if curl -s -u "$FTP_USER:$FTP_PASS" -T "$file" "ftp://$FTP_HOST/$FTP_PATH/$rel_path" > /dev/null 2>&1; then
        echo "✅"
        ((SUCCESS++))
    else
        echo "❌"
        ((FAILED++))
    fi
}

# Upload recursivo
echo "📁 Encontrando arquivos..."
cd "$LOCAL_PATH"

# Upload todos os arquivos
find . -type f | while read file; do
    upload_file "$LOCAL_PATH/$file" "$FTP_PATH"
done

echo ""
echo "📊 Upload concluído!"
echo "✅ Sucesso: $SUCCESS"
echo "❌ Falha: $FAILED"
echo ""
echo "🌐 Acesse: https://nomadway.com.br"