#!/bin/bash
# Upload _next assets via FTP

HOST="185.245.180.59"
USER="u608840078"
PASS='5676484aS@@'
LOCAL="/Users/clowd/.openclaw/workspace/nomadway-site/out"

echo "🚀 Upload dos assets _next..."

# CSS
echo "📤 CSS..."
for f in "$LOCAL/_next/static/css/"*.css; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  curl -s --ftp-create-dirs -T "$f" --user "$USER:$PASS" "ftp://$HOST/_next/static/css/$name" &
done
wait
echo "  ✅ CSS"

# Chunks
echo "📤 Chunks JS..."
for f in "$LOCAL/_next/static/chunks/"*.js; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  curl -s --ftp-create-dirs -T "$f" --user "$USER:$PASS" "ftp://$HOST/_next/static/chunks/$name" &
done
wait
echo "  ✅ Chunks"

# Media (fonts)
echo "📤 Media/Fonts..."
for f in "$LOCAL/_next/static/media/"*; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  curl -s --ftp-create-dirs -T "$f" --user "$USER:$PASS" "ftp://$HOST/_next/static/media/$name" &
done
wait
echo "  ✅ Media"

# pasta HOCBmJOizlBTR0QEq19PR (chunks adicionais)
echo "📤 Chunks adicionais..."
for f in "$LOCAL/_next/static/HOCBmJOizlBTR0QEq19PR/"*.js 2>/dev/null; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  curl -s --ftp-create-dirs -T "$f" --user "$USER:$PASS" "ftp://$HOST/_next/static/HOCBmJOizlBTR0QEq19PR/$name" &
done
wait
echo "  ✅ Chunks adicionais"

echo ""
echo "🎉 Todos os assets enviados!"
echo "🌐 Teste: https://nomadway.com.br"