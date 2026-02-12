#!/bin/bash

# Upload NomadWay para Hostinger - Estratégia: Diretórios Primeiro, Depois Arquivos

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_BASE="domains/nomadway.com.br/public_html"
LOCAL_BASE="/Users/clowd/.openclaw/workspace/nomadway/out"
CURL_U="$FTP_USER:$FTP_PASS"

echo "🚀 Upload NomadWay → Hostinger"
echo "========================================"

cd "$LOCAL_BASE"

# Etapa 1: Criar todos os diretórios
echo ""
echo "📁 PASSO 1: Criando estrutura de diretórios..."

find . -type d | sort | while read dir; do
    # Remover "./" inicial
    dir="${dir#./}"

    if [[ "$dir" != "." ]]; then
        remote_path="$FTP_BASE/$dir"
        echo -ne "\r📂 $dir"

        # Tentar criar diretório (com cURL)
        curl -s -u "$CURL_U" "ftp://$FTP_HOST/$remote_path/" --mkd 2>/dev/null || true
    fi
done

echo ""
echo "✅ Diretórios criados"

# Etapa 2: Upload de todos os arquivos
echo ""
echo "📦 PASSO 2: Upload de arquivos..."
echo "========================================"

SUCCESS=0
FAIL=0
COUNT=0

find . -type f | while read file; do
    # Remover "./" inicial
    file="${file#./}"
    ((COUNT++))

    rel_path="$file"
    echo -ne "\r[$COUNT] ⬆️  $rel_path"

    remote_path="$FTP_BASE/$rel_path"

    if curl -s -u "$CURL_U" -T "$file" "ftp://$FTP_HOST/$remote_path" > /dev/null 2>&1; then
        echo -ne "\r[$COUNT] ✅ $rel_path   \n"
    else
        echo -ne "\r[$COUNT] ❌ $rel_path   \n"
    fi
done

echo ""
echo "========================================"
echo "🎉 Upload concluído!"
echo ""
echo "🌐 Acesse: https://nomadway.com.br"