import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - pg types installed separately
import { Pool } from 'pg';

// Database connection - uses Vercel env vars or direct connection string
function getPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 
    'postgresql://postgres.ymmdygffzkpduxudsfls:SB_SECRET_vjUrYR-4W8F85vj4w-7qKQ_0w8u7mNS@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';
  
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
}

const MIGRATION_SQL = `
-- 1. Add columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';

-- 2. Add columns to clients  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Brasileira';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS visa_type TEXT DEFAULT 'digital_nomad';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS service_value DECIMAL(10, 2) DEFAULT 1499.90;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 3. Add booking_id to client_forms
ALTER TABLE client_forms ADD COLUMN IF NOT EXISTS booking_id UUID;

-- 4. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  read_by_admin BOOLEAN DEFAULT false,
  read_by_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Functions
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE last_code TEXT; next_num INTEGER;
BEGIN
  SELECT client_code INTO last_code FROM clients WHERE client_code LIKE 'NW-%' ORDER BY client_code DESC LIMIT 1;
  IF last_code IS NULL THEN RETURN 'NW-0001'; END IF;
  next_num := CAST(SUBSTRING(last_code FROM 4) AS INTEGER) + 1;
  RETURN 'NW-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_form_code()
RETURNS TEXT AS $$
DECLARE chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; code TEXT; ex BOOLEAN;
BEGIN
  LOOP
    code := 'NW-FORM-';
    FOR i IN 1..6 LOOP code := code || SUBSTRING(chars FROM FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER FOR 1); END LOOP;
    SELECT EXISTS(SELECT 1 FROM client_forms WHERE code = code) INTO ex;
    IF NOT ex THEN RETURN code; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_code ON clients(client_code) WHERE client_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
`;

export async function POST(request: NextRequest) {
  const pool = getPool();
  
  try {
    // Run migration
    await pool.query(MIGRATION_SQL);
    
    return NextResponse.json({
      success: true,
      message: 'Migration executed successfully!',
      tables_updated: ['bookings', 'clients', 'client_forms'],
      tables_created: ['messages', 'notifications'],
      functions_created: ['generate_client_code', 'generate_form_code']
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'If you see permission errors, the migration may have partially completed'
    }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function GET(request: NextRequest) {
  const pool = getPool();
  
  try {
    // Check current status
    const messages = await pool.query("SELECT to_regclass('public.messages') as exists");
    const clientsColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name IN ('client_code', 'full_name', 'service_value')
    `);
    
    return NextResponse.json({
      status: 'checked',
      messages_table_exists: !!messages.rows[0].exists,
      clients_new_columns: clientsColumns.rows.map(r => r.column_name),
      run_migration: 'POST to this endpoint to apply migration'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await pool.end();
  }
}