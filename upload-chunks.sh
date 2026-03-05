#!/bin/bash

# Upload Next.js chunks with special directory names to Hostinger
# The [lang] directory needs URL-encoded handling

FTP_HOST="185.245.180.59"
FTP_USER="u608840078"
FTP_PASS="5676484aS@@"
REMOTE_DIR="/public_html"

# Local base path
LOCAL_BASE="/Users/clowd/.openclaw/workspace/nomadway-site/out"

# Files to upload (from [lang] directory)
FILES=(
    "_next/static/chunks/app/[lang]/page-4ad61e65fd2d2db4.js"
    "_next/static/chunks/app/[lang]/contact/page-ecfc380e04981873.js"
    "_next/static/chunks/app/[lang]/portal/page-c02417f010679f84.js"
    "_next/static/chunks/app/[lang]/privacy/page-e016a17e899a3e5b.js"
    "_next/static/chunks/app/[lang]/agendamento/page-55113a532b9fda06.js"
    "_next/static/chunks/app/[lang]/agendamento/booking/page-cac32c89eaa8974c.js"
    "_next/static/chunks/app/[lang]/agendamento/manage/page-e983b57c45b73459.js"
    "_next/static/chunks/app/[lang]/booking/page-40e5cce414e377c8.js"
    "_next/static/chunks/app/[lang]/terms/page-0b24fd65779a1757.js"
    "_next/static/chunks/app/[lang]/layout-e2fb5f6b6d4aed77.js"
    "_next/static/chunks/app/[lang]/pricing/page-a5dafcfd59ecb29c.js"
    "_next/static/chunks/app/[lang]/services/page-1af6a599aa83d070.js"
)

echo "Creating directory structure and uploading files..."

# Create lftp command file
cat > /tmp/lftp_commands.txt << 'EOF'
set ftp:ssl-allow no
set ftp:passive-mode on
set net:timeout 30
set net:reconnect-interval-base 5
set net:max-retries 3
open -u u608840078,5676484aS@@ 185.245.180.59
cd /public_html
EOF

# Add mkdir commands for all directories
cat >> /tmp/lftp_commands.txt << 'EOF'
mkdir -p _next/static/chunks/app
EOF

# Upload each file
for FILE in "${FILES[@]}"; do
    LOCAL_FILE="$LOCAL_BASE/$FILE"
    if [ -f "$LOCAL_FILE" ]; then
        # Replace [lang] with %5Blang%5D for remote path
        REMOTE_FILE="${FILE//\[lang\]/%5Blang%5D}"
        echo "put -O '${REMOTE_FILE%/*}' '$LOCAL_FILE'" >> /tmp/lftp_commands.txt
        echo "Uploading: $FILE"
    else
        echo "WARNING: File not found: $LOCAL_FILE"
    fi
done

echo "quit" >> /tmp/lftp_commands.txt

# Execute lftp
lftp -f /tmp/lftp_commands.txt

echo "Upload complete!"