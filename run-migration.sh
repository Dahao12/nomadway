#!/bin/bash
# Run this script to apply the unified schema migration
# Usage: ./run-migration.sh

echo "🚀 Running NomadWay Unified Schema Migration..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local not found"
  echo "   Please create .env.local with your Supabase credentials:"
  echo "   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co"
  echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  exit 1
fi

# Source environment variables
source .env.local 2>/dev/null || true

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

echo "📋 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY:0:10}..."
echo ""

# Get the SQL file
MIGRATION_FILE="supabase/migrations/003_unified_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Running migration: $MIGRATION_FILE"
echo ""

# Use Supabase API to run SQL
# Extract project ID from URL
PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|https://([a-z0-9-]+)\.supabase\.co|\1|')

echo "📦 Project ID: $PROJECT_ID"
echo ""

# Read SQL file
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Execute via REST API
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
  2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Migration applied successfully!"
  echo ""
  echo "📊 Tables created/updated:"
  echo "   - bookings"
  echo "   - clients"
  echo "   - client_forms"
  echo "   - process_stages"
  echo "   - documents"
  echo "   - messages"
  echo "   - timeline_events"
  echo "   - notifications"
  echo ""
  echo "🔗 Next steps:"
  echo "   1. Update your API routes to use the new schema"
  echo "   2. Test the unified booking flow"
  echo "   3. Deploy changes to production"
else
  echo "❌ Migration failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  echo ""
  echo "💡 Try running the SQL manually in Supabase Dashboard:"
  echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql"
fi