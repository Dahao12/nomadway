#!/bin/bash

# Upload critical JS and CSS files
FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484a@@"
BASE_DIR="/Users/clowd/.openclaw/workspace/nomadway/out"

echo "🚀 Uploading critical JS and CSS files..."
echo ""

# Upload CSS
echo "📄 → _next/static/css/39fdb2c86f66184e.css"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/css/39fdb2c86f66184e.css" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/css/39fdb2c86f66184e.css" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

# Upload critical JS chunks
echo "📄 → _next/static/chunks/webpack-2fe324e030a6ee36.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/webpack-2fe324e030a6ee36.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/webpack-2fe324e030a6ee36.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/fd9d1056-534a3af521b04580.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/fd9d1056-534a3af521b04580.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/fd9d1056-534a3af521b04580.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/69-27caf53f3844fcdd.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/69-27caf53f3844fcdd.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/69-27caf53f3844fcdd.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/main-app-37c9a2238b1c304c.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/main-app-37c9a2238b1c304c.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/main-app-37c9a2238b1c304c.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/8e1d74a4-37730e95329c3519.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/8e1d74a4-37730e95329c3519.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/8e1d74a4-37730e95329c3519.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/250-5ea11ac6ae7fbab6.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/250-5ea11ac6ae7fbab6.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/250-5ea11ac6ae7fbab6.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/278-ec3d5aad8fe95091.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/278-ec3d5aad8fe95091.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/278-ec3d5aad8fe95091.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""

echo "📄 → _next/static/chunks/polyfills-c67a75d1b6f99dc8.js"
curl -s --ftp-create-dirs -T "$BASE_DIR/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js" \
  --url "ftp://$FTP_HOST/domains/nomadway.com.br/public_html/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js" \
  --user "$FTP_USER:$FTP_PASS"
echo "   ✅ Uploaded"

echo ""
echo "✅ All critical files uploaded!"
echo "🌐 Try refreshing the page: https://nomadway.com.br/pt/terms"