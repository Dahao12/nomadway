import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  // Check admin auth
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS whatsapp_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone VARCHAR(30) UNIQUE NOT NULL,
      name VARCHAR(255),
      group_name VARCHAR(255),
      keywords TEXT[],
      first_message TEXT,
      last_message TEXT,
      first_seen TIMESTAMPTZ DEFAULT NOW(),
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      message_count INTEGER DEFAULT 1,
      source VARCHAR(50) DEFAULT 'whatsapp_group',
      sender_jid VARCHAR(255),
      status VARCHAR(20) DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      partner_lead_id UUID,
      client_id UUID,
      notes TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_phone ON whatsapp_leads(phone);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status ON whatsapp_leads(status);
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createTableSQL }),
    });

    const result = await response.text();
    
    return NextResponse.json({
      success: true,
      message: 'Table created (or already exists)',
      result: result || 'No output'
    });
  } catch (error) {
    // If exec_sql doesn't work, try direct insert approach
    // Create table by inserting first record
    try {
      // Try to insert a test record (will fail if table exists)
      await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          phone: '+00000000000',
          name: 'SCHEMA_INIT',
          source: 'schema_init',
          status: 'deleted'
        }),
      });
    } catch {
      // Table already exists, that's fine
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table creation attempted. Run this SQL in Supabase Dashboard:'
    });
  }
}

// Provide SQL for manual creation
export async function GET() {
  const sql = `
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(255),
  group_name VARCHAR(255),
  keywords TEXT[],
  first_message TEXT,
  last_message TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 1,
  source VARCHAR(50) DEFAULT 'whatsapp_group',
  sender_jid VARCHAR(255),
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  partner_lead_id UUID,
  client_id UUID,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_phone ON whatsapp_leads(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status ON whatsapp_leads(status);

ALTER TABLE whatsapp_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything" ON whatsapp_leads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
`;

  return new Response(sql, {
    headers: { 'Content-Type': 'text/plain' }
  });
}