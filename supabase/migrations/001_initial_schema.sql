-- NomadWay Portal Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country_origin TEXT DEFAULT 'Brasil',
  visa_type TEXT DEFAULT 'Digital Nomad',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  assigned_to UUID,
  workspace_slug TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Process Stages Table
CREATE TABLE IF NOT EXISTS process_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_type TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'awaiting_client', 'in_review', 'blocked', 'completed')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  notes_internal TEXT,
  notes_client TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'approved', 'rejected')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by TEXT CHECK (uploaded_by IN ('client', 'admin')),
  uploaded_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actor_name TEXT,
  actor_type TEXT CHECK (actor_type IN ('client', 'admin')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage Messages Table
CREATE TABLE IF NOT EXISTS stage_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'refunded')),
  description TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_workspace_slug ON clients(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_process_stages_client ON process_stages(client_id);
CREATE INDEX IF NOT EXISTS idx_process_stages_status ON process_stages(status);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_timeline_events_client ON timeline_events(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_created ON timeline_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stage_messages_stage ON stage_messages(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_messages_created ON stage_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER process_stages_updated_at
  BEFORE UPDATE ON process_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to create default stages for new client
CREATE OR REPLACE FUNCTION create_default_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO process_stages (client_id, stage_type, stage_name, stage_order)
  VALUES
    (NEW.id, 'onboarding', 'Onboarding', 1),
    (NEW.id, 'profile', 'Análise de Perfil', 2),
    (NEW.id, 'strategy', 'Planejamento Estratégico', 3),
    (NEW.id, 'documentation', 'Documentação', 4),
    (NEW.id, 'translations', 'Traduções', 5),
    (NEW.id, 'apostille', 'Apostilamento', 6),
    (NEW.id, 'review', 'Revisão Jurídica', 7),
    (NEW.id, 'application', 'Aplicação do Visto', 8),
    (NEW.id, 'follow_up', 'Acompanhamento', 9),
    (NEW.id, 'approval', 'Aprovação', 10),
    (NEW.id, 'post_approval', 'Pós-Aprovação', 11),
    (NEW.id, 'relocation', 'Mudança para Espanha', 12);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_client_stages
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages();

-- Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for clients (they can only see their own data)
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (true); -- For now, allow all. Adjust with auth later.

CREATE POLICY "Clients can view own stages" ON process_stages
  FOR SELECT USING (true);

CREATE POLICY "Clients can view own documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Clients can view own timeline" ON timeline_events
  FOR SELECT USING (true);

CREATE POLICY "Clients can view own messages" ON stage_messages
  FOR SELECT USING (true);

CREATE POLICY "Clients can view own payments" ON payments
  FOR SELECT USING (true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;