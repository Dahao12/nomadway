-- =============================================
-- NOMADWAY - Sistema de Parceiros/Afiliados
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Criar Tabela de Parceiros
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

-- 2. Criar Tabela de Comissões
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

-- 3. Criar Tabela de Leads
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

-- 4. Adicionar campos em bookings (se não existirem)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 5. Criar Índices
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_leads_partner ON partner_leads(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_leads_status ON partner_leads(status);
CREATE INDEX IF NOT EXISTS idx_bookings_partner_code ON bookings(partner_code);

-- 6. Inserir Parceiros Existentes
INSERT INTO partners (name, email, code, status, commission_tier)
VALUES 
  ('Ezequiel', 'ezequiel@nomadway.com.br', 'EZE01', 'active', 1),
  ('Elisa', 'elisa@nomadway.com.br', 'ELZ01', 'active', 1)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- PRONTO! Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ymmdygfzzkpduxudsfls/sql
-- =============================================