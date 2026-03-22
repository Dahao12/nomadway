-- =====================================================
-- NOMADWAY UNIFIED SCHEMA v2.0
-- Fluxo: Agendamento → Formulário → Cliente → Processo
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BOOKINGS (Agendamentos do site)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code TEXT UNIQUE NOT NULL,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Service info
  service_name TEXT NOT NULL,
  service_price DECIMAL(10, 2),
  
  -- Scheduling
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/Madrid',
  
  -- Status: pending → confirmed → form_sent → completed → cancelled
  status TEXT DEFAULT 'pending',
  
  -- Link to unified record
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  form_id UUID REFERENCES client_forms(id) ON DELETE SET NULL,
  
  -- Metadata
  notes TEXT,
  source TEXT DEFAULT 'website', -- website, whatsapp, manual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notification tracking
  confirmation_sent_at TIMESTAMPTZ,
  form_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ
);

-- =====================================================
-- 2. CLIENTS (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_code TEXT UNIQUE NOT NULL, -- NW-0001
  workspace_slug TEXT UNIQUE, -- joao-silva-ab12
  
  -- Personal info (populated from form)
  full_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Documents
  cpf TEXT,
  rg TEXT,
  passport_number TEXT,
  passport_expiry_date DATE,
  nationality TEXT DEFAULT 'Brasileira',
  birth_date DATE,
  
  -- Address
  country TEXT DEFAULT 'Brasil',
  city TEXT,
  address TEXT,
  
  -- Professional
  profession TEXT,
  company_name TEXT,
  monthly_income_range TEXT,
  has_foreign_link BOOLEAN DEFAULT false,
  is_freelancer BOOLEAN DEFAULT false,
  
  -- Service
  visa_type TEXT DEFAULT 'digital_nomad',
  service_value DECIMAL(10, 2) DEFAULT 1499.90,
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  
  -- Process status: new → documentation → analysis → submission → tracking → approved
  status TEXT DEFAULT 'new',
  status_changed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  admin_notes TEXT,
  
  -- Source tracking
  source_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  source_form_id UUID REFERENCES client_forms(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contract
  contract_generated_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ
);

-- =====================================================
-- 3. CLIENT_FORMS (Formulários de dados)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- NW-FORM-ABC123
  
  -- Link to booking (auto-created from booking)
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- All form fields
  full_name TEXT,
  birth_date DATE,
  nationality TEXT DEFAULT 'Brasileira',
  marital_status TEXT,
  
  cpf TEXT,
  rg TEXT,
  passport_number TEXT,
  passport_expiry_date DATE,
  
  phone TEXT,
  email TEXT,
  
  country TEXT DEFAULT 'Brasil',
  city TEXT,
  address TEXT,
  
  profession TEXT,
  company_name TEXT,
  monthly_income_range TEXT,
  has_foreign_link BOOLEAN DEFAULT false,
  is_freelancer BOOLEAN DEFAULT false,
  
  visa_type TEXT DEFAULT 'digital_nomad',
  service_value TEXT,
  payment_method TEXT DEFAULT 'pix',
  
  notes TEXT,
  admin_notes TEXT,
  
  -- Status: pending → completed → processed
  status TEXT DEFAULT 'pending',
  
  -- Link to created client (when processed)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  
  -- WhatsApp tracking
  whatsapp_link_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ
);

-- =====================================================
-- 4. PROCESS_STAGES (Etapas do processo)
-- =====================================================
CREATE TABLE IF NOT EXISTS process_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  stage_order INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  stage_key TEXT NOT NULL, -- documentation, analysis, submission, tracking, approval, delivery
  
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, blocked
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  notes_admin TEXT,
  notes_client TEXT,
  
  -- Estimated dates
  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default stages configuration
INSERT INTO process_stages (client_id, stage_order, stage_name, stage_key) VALUES
-- These will be created per client via trigger
-- 1. 'Documentação Inicial', 'documentation'
-- 2. 'Análise de Elegibilidade', 'analysis'
-- 3. 'Preparação do Pedido', 'preparation'
-- 4. 'Submissão Governamental', 'submission'
-- 5. 'Acompanhamento', 'tracking'
-- 6. 'Aprovação e Entrega', 'approval'
NULL;

-- =====================================================
-- 5. DOCUMENTS (Uploads)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  type TEXT, -- passport, cpf, rg, proof_income, etc.
  category TEXT, -- personal, financial, professional
  
  -- File info
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT, -- pdf, jpg, png
  
  -- Status: pending → uploaded → reviewing → approved → rejected
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  review_notes TEXT,
  
  -- Upload tracking
  uploaded_by TEXT, -- 'client' or 'admin'
  uploaded_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. MESSAGES (Chat admin↔cliente)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client', 'system')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Attachments
  attachment_url TEXT,
  attachment_name TEXT,
  
  -- Read status
  read_by_admin BOOLEAN DEFAULT false,
  read_by_client BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TIMELINE_EVENTS (Histórico)
-- =====================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL, -- created, status_changed, document_uploaded, message_sent, etc.
  title TEXT NOT NULL,
  description TEXT,
  
  actor_name TEXT,
  actor_type TEXT, -- admin, client, system
  
  metadata JSONB, -- additional data
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. NOTIFICATIONS (Sistema de notificações)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'client')),
  recipient_id TEXT, -- admin_id or client_id
  
  -- Notification
  type TEXT NOT NULL, -- new_booking, form_completed, document_uploaded, message_received, status_changed
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Reference
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  form_id UUID REFERENCES client_forms(id) ON DELETE CASCADE,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Delivery
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);

CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(client_code);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(workspace_slug);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

CREATE INDEX IF NOT EXISTS idx_forms_code ON client_forms(code);
CREATE INDEX IF NOT EXISTS idx_forms_status ON client_forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_booking ON client_forms(booking_id);
CREATE INDEX IF NOT EXISTS idx_forms_client ON client_forms(client_id);

CREATE INDEX IF NOT EXISTS idx_stages_client ON process_stages(client_id);
CREATE INDEX IF NOT EXISTS idx_stages_status ON process_stages(status);

CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_client ON timeline_events(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created ON timeline_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Generate client code (NW-0001, NW-0002, etc.)
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
  last_code TEXT;
  next_num INTEGER;
BEGIN
  SELECT client_code INTO last_code
  FROM clients
  WHERE client_code LIKE 'NW-%'
  ORDER BY client_code DESC
  LIMIT 1;
  
  IF last_code IS NULL THEN
    RETURN 'NW-0001';
  END IF;
  
  next_num := CAST(SUBSTRING(last_code FROM 4) AS INTEGER) + 1;
  RETURN 'NW-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate form code (NW-FORM-ABC123)
CREATE OR REPLACE FUNCTION generate_form_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'NW-FORM-';
    FOR i IN 1..6 LOOP
      code := code || SUBSTRING(chars FROM FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER FOR 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM client_forms WHERE code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate workspace slug (joao-silva-ab12)
CREATE OR REPLACE FUNCTION generate_workspace_slug(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  slug TEXT;
  suffix TEXT;
  counter INTEGER := 0;
  exists BOOLEAN;
BEGIN
  -- Remove special chars, lowercase, replace spaces with hyphens
  base_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := SUBSTRING(base_slug FROM 1 FOR 30);
  
  -- Generate random suffix
  suffix := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);
  slug := base_slug || '-' || suffix;
  
  -- Check if exists, retry if needed
  LOOP
    SELECT EXISTS(SELECT 1 FROM clients WHERE workspace_slug = slug) INTO exists;
    IF NOT exists THEN
      RETURN slug;
    END IF;
    
    counter := counter + 1;
    suffix := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);
    slug := base_slug || '-' || suffix;
    
    IF counter > 10 THEN
      slug := base_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
      RETURN slug;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create default stages for new client
CREATE OR REPLACE FUNCTION create_default_stages_for_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO process_stages (client_id, stage_order, stage_name, stage_key)
  VALUES
    (NEW.id, 1, 'Documentação Inicial', 'documentation'),
    (NEW.id, 2, 'Análise de Elegibilidade', 'analysis'),
    (NEW.id, 3, 'Preparação do Pedido', 'preparation'),
    (NEW.id, 4, 'Submissão Governamental', 'submission'),
    (NEW.id, 5, 'Acompanhamento', 'tracking'),
    (NEW.id, 6, 'Aprovação e Entrega', 'approval');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create timeline event
CREATE OR REPLACE FUNCTION create_timeline_event(
  p_client_id UUID,
  p_event_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_actor_name TEXT DEFAULT 'Sistema',
  p_actor_type TEXT DEFAULT 'system',
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO timeline_events (client_id, event_type, title, description, actor_name, actor_type, metadata)
  VALUES (p_client_id, p_event_type, p_title, p_description, p_actor_name, p_actor_type, p_metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_type TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_client_id UUID DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL,
  p_form_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notif_id UUID;
BEGIN
  INSERT INTO notifications (recipient_type, type, title, message, client_id, booking_id, form_id)
  VALUES (p_recipient_type, p_type, p_title, p_message, p_client_id, p_booking_id, p_form_id)
  RETURNING id INTO notif_id;
  
  RETURN notif_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Create stages when client is created
DROP TRIGGER IF EXISTS on_client_created ON clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages_for_client();

-- Trigger: Update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_timestamp ON clients;
CREATE TRIGGER update_clients_timestamp
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_forms_timestamp ON client_forms;
CREATE TRIGGER update_forms_timestamp
  BEFORE UPDATE ON client_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_bookings_timestamp ON bookings;
CREATE TRIGGER update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS
CREATE POLICY "Service role can do anything" ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON client_forms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON process_stages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON timeline_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can do anything" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Default booking statuses
COMMENT ON COLUMN bookings.status IS 'pending: novo agendamento | confirmed: confirmado | form_sent: form enviado | completed: completo | cancelled: cancelado';

-- Default client statuses
COMMENT ON COLUMN clients.status IS 'new: novo cliente | documentation: coletando docs | analysis: análise | submission: submissão | tracking: acompanhamento | approved: aprovado | delivered: entregue | paused: pausado | cancelled: cancelado';

-- Default form statuses
COMMENT ON COLUMN client_forms.status IS 'pending: aguardando preenchimento | completed: preenchido | processed: processado';

-- Default stage statuses
COMMENT ON COLUMN process_stages.status IS 'pending: aguardando | in_progress: em andamento | completed: completo | blocked: bloqueado';

-- Default document statuses
COMMENT ON COLUMN documents.status IS 'pending: aguardando upload | uploaded: enviado | reviewing: em revisão | approved: aprovado | rejected: rejeitado';