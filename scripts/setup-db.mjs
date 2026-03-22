import postgres from 'postgres';

// Supabase Connection String
// Formato: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

// NOTA: Você precisa da senha do banco. A senha foi definida quando criou o projeto.
// Encontre em: Supabase Dashboard > Project Settings > Database > Connection string

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);

-- Inserir parceiros existentes
INSERT INTO partners (name, email, code, status, commission_tier)
VALUES 
  ('Ezequiel', 'ezequiel@nomadway.com.br', 'EZE01', 'active', 1),
  ('Elisa', 'elisa@nomadway.com.br', 'ELZ01', 'active', 1)
ON CONFLICT (code) DO NOTHING;
`;

async function main() {
  if (!DATABASE_URL) {
    console.log('\n❌ DATABASE_URL não definida.');
    console.log('\nPara obter a connection string:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/ymmdygfzzkpduxudsfls/settings/database');
    console.log('2. Copie a "Connection string" (Mode: Session)');
    console.log('3. Adicione a senha no lugar de [YOUR-PASSWORD]');
    console.log('\nOu execute este SQL manualmente no SQL Editor do Supabase.');
    return;
  }

  const sql = postgres(DATABASE_URL);

  try {
    console.log('🔄 Criando tabelas...\n');
    
    await sql.unsafe(SQL);
    
    console.log('✅ Tabelas criadas com sucesso!');
    console.log('✅ Parceiros EZE01 e ELZ01 inseridos!');
    console.log('🎉 Banco configurado!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sql.end();
  }
}

main();