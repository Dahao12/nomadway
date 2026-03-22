-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  visa_type TEXT DEFAULT 'Digital Nomad Visa',
  status TEXT DEFAULT 'active',
  workspace_slug TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Process stages table
CREATE TABLE IF NOT EXISTS process_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  progress_percent INTEGER DEFAULT 0,
  notes_admin TEXT,
  notes_client TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (SINGLE CHAT per client)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actor_name TEXT,
  actor_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_stages_client ON process_stages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_client ON timeline_events(client_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Policies for service role access (bypasses RLS)
CREATE POLICY "Service role full access on clients" ON clients FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on process_stages" ON process_stages FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on messages" ON messages FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on documents" ON documents FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access on timeline_events" ON timeline_events FOR ALL TO service_role USING (true);

-- Function to create default stages for new clients
CREATE OR REPLACE FUNCTION create_default_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO process_stages (client_id, stage_name, stage_order, status) VALUES
    (NEW.id, 'Documentação Inicial', 1, 'pending'),
    (NEW.id, 'Análise de Elegibilidade', 2, 'pending'),
    (NEW.id, 'Preparação do Pedido', 3, 'pending'),
    (NEW.id, 'Submissão Governamental', 4, 'pending'),
    (NEW.id, 'Acompanhamento', 5, 'pending'),
    (NEW.id, 'Aprovação e Entrega', 6, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create stages
DROP TRIGGER IF EXISTS on_client_created ON clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages();

-- Insert test client if not exists
INSERT INTO clients (name, email, visa_type, status, workspace_slug, notes)
SELECT 'Marlon Teste', 'marlon@teste.com', 'Digital Nomad Visa', 'active', 'marlon-5259xl', 'Cliente de teste'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE workspace_slug = 'marlon-5259xl');