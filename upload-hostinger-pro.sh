#!/bin/bash

# Upload NomadWay para Hostinger via FTP

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
FTP_BASE="domains/nomadway.com.br/public_html"
LOCAL_BASE="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Upload NomadWay → Hostinger"
echo "================================"

COUNT=0
SUCCESS=0
FAIL=0

# Função para criar diretórios recursivamente
create_remote_dirs() {
    local path="$1"
    local parts=(${path//\// })
    local build_path=""

    for part in "${parts[@]}"; do
        if [[ -n "$part" && "$part" != "." && "$part" != ".." ]]; then
            build_path="$build_path/$part"
            curl -s -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST$build_path/" --mkd 2>/dev/null || true
        fi
    done
}

# Upload de arquivo individual
upload_file() {
    local local_file="$1"
    local remote_path="$2"

    ((COUNT++))
    local rel_path="${local_file#$LOCAL_BASE/}"
    echo -ne "\r[$COUNT] ⬆️  $rel_path..."

    # Criar diretórios se necessário
    local dir=$(dirname "$rel_path")
    if [[ "$dir" != "." ]]; then
        create_remote_dirs "$dir"
    fi

    # Upload arquivo
    if curl -s -u "$FTP_USER:$FTP_PASS" -T "$local_file" "ftp://$FTP_HOST/$FTP_BASE/$rel_path" > /dev/null 2>&1; then
        ((SUCCESS++))
        echo -ne "\r[$COUNT] ✅ $rel_path   \n"
    else
        ((FAIL++))
        echo -ne "\r[$COUNT] ❌ $rel_path   \n"
    fi
}

export -f upload_file create_remote_dirs
export FTP_HOST FTP_USER FTP_PASS FTP_BASE LOCAL_BASE SUCCESS FAIL

# Encontrar e upload de todos os arquivos
echo ""
echo "📁 Encontrando e enviando arquivos..."
echo ""

cd "$LOCAL_BASE"
find . -type f -not -path '*/./' | while read file; do
    upload_file "$LOCAL_BASE/${file#./}" "$FTP_BASE"
done

echo ""
echo "================================"
echo "📊 Upload concluído!"
echo "✅ Sucesso: $SUCCESS"
echo "❌ Falha: $FAIL"
echo "🔄 Total: $COUNT"
echo ""
echo "🌐 Acesse: https://nomadway.com.br"