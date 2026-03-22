// Script para criar tabelas do sistema de parceiros
// Execute com: npx ts-node scripts/create-tables.ts

async function createTables() {
  const SUPABASE_URL = 'https://ymmdygfzzkpduxudsfls.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjMzMywiZXhwIjoyMDg2ODQ4MzMzfQ.UTXH90Uci9Fo8U9qKzGyd9UdGOcTvaF-daWpMWMoHe0';

  const SQL = `
-- Tabela de Parceiros
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  commission_tier INTEGER DEFAULT 1,
  total_clients INTEGER DEFAULT 0,
  total_earnings_cents INTEGER DEFAULT 0,
  total_paid_cents INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_info JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Comissões
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT,
  service_type TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  converted_to_client BOOLEAN DEFAULT false,
  booking_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alterar bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);

-- Inserir parceiros
INSERT INTO partners (name, email, code, status, commission_tier)
VALUES 
  ('Ezequiel', 'ezequiel@nomadway.com.br', 'EZE01', 'active', 1),
  ('Elisa', 'elisa@nomadway.com.br', 'ELZ01', 'active', 1)
ON CONFLICT (code) DO NOTHING;
`;

  // Dividir em instruções individuais
  const statements = SQL.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executando ${statements.length} comandos SQL...\n`);

  for (const statement of statements) {
    if (!statement.trim()) continue;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzIzMzMsImV4cCI6MjA4Njg0ODMzM30.ukQM-KDF8J4g5R9Kqhji-Fmxqv6-QMMXcHzDOD--hTw',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: statement }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${statement.substring(0, 50)}...`);
      } else {
        console.log(`⚠️ ${statement.substring(0, 50)}... - ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error}`);
    }
  }

  console.log('\n🎉 Concluído!');
}

createTables();