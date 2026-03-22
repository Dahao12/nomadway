-- =====================================================
-- NOMADWAY UNIFIED SCHEMA - Big Tech Style
-- Execute no Supabase SQL Editor
-- =====================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS E TIPOS
-- =====================================================

-- Status do lead/cliente (State Machine)
CREATE TYPE client_status AS ENUM (
  'new',           -- Novo lead
  'documentation', -- Aguardando documentos
  'analysis',      -- Em análise
  'submission',    -- Submetido ao governo
  'approved',      -- Aprovado
  'rejected',      -- Rejeitado
  'cancelled'      -- Cancelado
);

-- Temperatura do lead
CREATE TYPE lead_temperature AS ENUM ('hot', 'warm', 'cold');

-- Status do booking
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'form_sent', 'completed', 'cancelled', 'no_show');

-- Status do documento
CREATE TYPE document_status AS ENUM ('pending', 'uploaded', 'approved', 'rejected');

-- Tipo de evento
CREATE TYPE event_type AS ENUM (
  'lead_created',
  'booking_confirmed',
  'form_created',
  'form_completed',
  'client_created',
  'status_changed',
  'document_uploaded',
  'document_approved',
  'document_rejected',
  'payment_received',
  'whatsapp_sent',
  'email_sent',
  'note_added',
  'deadline_reminder'
);

-- =====================================================
-- SEQUÊNCIAS
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS booking_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS client_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS form_code_seq START 1;

-- =====================================================
-- TABELA: BOOKINGS (Agendamentos)
-- Fonte única de verdade - não depende de API externa
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL DEFAULT ('NW' || TO_CHAR(NOW(), 'MMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))),
  
  -- Dados do serviço
  service_id VARCHAR(50) NOT NULL DEFAULT 'consultation',
  service_name VARCHAR(100) NOT NULL DEFAULT 'Consulta Gratuita',
  service_duration INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Dados do cliente
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_notes TEXT,
  customer_timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
  
  -- Agendamento
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
  
  -- Status e relacionamentos
  status booking_status DEFAULT 'pending',
  lead_temperature lead_temperature DEFAULT 'warm',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  form_id UUID REFERENCES client_forms(id) ON DELETE SET NULL,
  
  -- Metadados
  source VARCHAR(50) DEFAULT 'website',
  language VARCHAR(2) DEFAULT 'pt',
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Notificações
  email_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_lead_temperature ON bookings(lead_temperature);

-- =====================================================
-- TABELA: CLIENTS (Clientes)
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_code VARCHAR(20) UNIQUE NOT NULL DEFAULT ('NW-' || LPAD(NEXTVAL('client_code_seq')::TEXT, 4, '0')),
  workspace_slug VARCHAR(50) UNIQUE NOT NULL DEFAULT ('client-' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))),
  
  -- Dados pessoais
  full_name VARCHAR(200) NOT NULL,
  name VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  birth_date DATE,
  nationality VARCHAR(100),
  
  -- Dados do visto
  visa_type VARCHAR(100) DEFAULT 'Digital Nomad Visa',
  service_value DECIMAL(10, 2),
  payment_value DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending',
  
  -- Status (State Machine)
  status client_status DEFAULT 'new',
  lead_temperature lead_temperature DEFAULT 'warm',
  
  -- Endereço
  address_street TEXT,
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_country VARCHAR(100),
  address_postal_code VARCHAR(20),
  
  -- Observações
  notes TEXT,
  internal_notes TEXT,
  
  -- Metadados
  source_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(client_code);

-- =====================================================
-- TABELA: CLIENT_FORMS (Formulários)
-- =====================================================

CREATE TABLE IF NOT EXISTS client_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL DEFAULT ('FORM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))),
  
  -- Relacionamentos
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Dados do formulário
  full_name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  nationality VARCHAR(100),
  
  -- Endereço
  address_street TEXT,
  address_city VARCHAR(100),
  address_country VARCHAR(100),
  address_postal_code VARCHAR(20),
  
  -- Dados do visto
  visa_type VARCHAR(100),
  service_value DECIMAL(10, 2),
  
  -- Dados profissionais
  profession VARCHAR(100),
  company VARCHAR(200),
  income_range VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, approved
  completed_at TIMESTAMPTZ,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forms_code ON client_forms(code);
CREATE INDEX IF NOT EXISTS idx_forms_client ON client_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_forms_booking ON client_forms(booking_id);

-- =====================================================
-- TABELA: PROCESS_STAGES (Estágios do Processo)
-- =====================================================

CREATE TABLE IF NOT EXISTS process_stages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Ordem e nome
  stage_order INTEGER NOT NULL,
  stage_name VARCHAR(100) NOT NULL,
  stage_key VARCHAR(50) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, skipped
  
  -- Datas
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_days INTEGER,
  
  -- Notas
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id, stage_order)
);

CREATE INDEX IF NOT EXISTS idx_stages_client ON process_stages(client_id);
CREATE INDEX IF NOT EXISTS idx_stages_status ON process_stages(status);

-- Estágios padrão
INSERT INTO process_stages (stage_order, stage_name, stage_key) VALUES
(1, 'Documentação Inicial', 'documentation'),
(2, 'Análise de Elegibilidade', 'analysis'),
(3, 'Preparação do Pedido', 'preparation'),
(4, 'Submissão Governamental', 'submission'),
(5, 'Acompanhamento', 'tracking'),
(6, 'Aprovação e Entrega', 'approval')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABELA: DOCUMENTS (Documentos)
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Dados do arquivo
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL, -- passport, visa, bank_statement, etc.
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_mimetype VARCHAR(100),
  
  -- Status
  status document_status DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(100),
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- =====================================================
-- TABELA: TIMELINE_EVENTS (Eventos)
-- =====================================================

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Tipo e conteúdo
  event_type event_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Actor
  actor_name VARCHAR(100),
  actor_type VARCHAR(20) DEFAULT 'system', -- system, admin, client
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_client ON timeline_events(client_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_created ON timeline_events(created_at DESC);

-- =====================================================
-- TABELA: BLOCKED_SLOTS (Bloqueio de Horários)
-- =====================================================

CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(start_date, end_date);

-- =====================================================
-- TABELA: FINANCE_TRANSACTIONS (Transações)
-- =====================================================

CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Tipo
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  
  -- Valor
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  amount_eur DECIMAL(12, 2),
  
  -- Detalhes
  description TEXT,
  category_id UUID REFERENCES finance_categories(id),
  
  -- Relacionamento
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Data
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Pagamento
  payment_method VARCHAR(50),
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval VARCHAR(20),
  
  -- Metadados
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON finance_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON finance_transactions(client_id);

-- =====================================================
-- TABELA: FINANCE_CATEGORIES (Categorias)
-- =====================================================

CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  emoji VARCHAR(10),
  color VARCHAR(20) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias padrão
INSERT INTO finance_categories (name, type, emoji, color) VALUES
  ('Visto Digital Nomad', 'income', '🛂', '#10B981'),
  ('Consulta', 'income', '💬', '#3B82F6'),
  ('Pacote Completo', 'income', '📦', '#8B5CF6'),
  ('Serviço Extra', 'income', '⚡', '#F59E0B'),
  ('Outros (Receita)', 'income', '💰', '#6B7280'),
  ('Marketing', 'expense', '📢', '#EF4444'),
  ('Software', 'expense', '💻', '#3B82F6'),
  ('Impostos', 'expense', '📄', '#F59E0B'),
  ('Viagens', 'expense', '✈️', '#EC4899'),
  ('Escritório', 'expense', '🏢', '#6B7280'),
  ('Pessoal', 'expense', '👤', '#8B5CF6'),
  ('Outros (Despesa)', 'expense', '💸', '#94A3B8')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABELA: AUTOMATIONS (Automações)
-- =====================================================

CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger_event VARCHAR(50) NOT NULL, -- lead_created, form_completed, status_changed, etc.
  trigger_conditions JSONB,
  
  -- Actions
  actions JSONB NOT NULL, -- Array de ações
  
  -- Configuração
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_active ON automations(is_active);
CREATE INDEX IF NOT EXISTS idx_automations_trigger ON automations(trigger_event);

-- Automações padrão
INSERT INTO automations (name, description, trigger_event, actions) VALUES
  ('Novo Lead -> WhatsApp', 'Envia WhatsApp de boas-vindas quando novo lead agenda', 'lead_created', 
   '[{"type": "send_whatsapp", "template": "welcome_lead"}]'::jsonb),
  ('Form Completado -> Criar Cliente', 'Cria cliente automaticamente quando formulário é completado', 'form_completed',
   '[{"type": "create_client"}]'::jsonb),
  ('Status Mudou -> Timeline', 'Registra mudança de status na timeline', 'status_changed',
   '[{"type": "add_timeline_event"}]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABELA: NOTIFICATIONS (Notificações)
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Destinatário
  recipient_type VARCHAR(20) NOT NULL, -- admin, client
  recipient_id UUID,
  
  -- Conteúdo
  title VARCHAR(200) NOT NULL,
  message TEXT,
  
  -- Tipo
  type VARCHAR(50), -- reminder, alert, info
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Referência
  reference_type VARCHAR(50), -- booking, client, document
  reference_id UUID,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(read, created_at DESC);

-- =====================================================
-- TABELA: ADMIN_USERS (Usuários Admin)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  
  -- Permissões
  permissions JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- =====================================================
-- TABELA: WEBHOOK_LOG (Log de Webhooks)
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Origem
  source VARCHAR(50) NOT NULL, -- calendly, stripe, whatsapp
  event_type VARCHAR(100),
  
  -- Payload
  payload JSONB,
  
  -- Processamento
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_source ON webhook_log(source);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_log(processed);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas principais
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON client_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON process_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNÇÃO: Criar Cliente a partir do Booking
-- =====================================================

CREATE OR REPLACE FUNCTION create_client_from_booking(
  p_booking_code VARCHAR
)
RETURNS TABLE (
  client_id UUID,
  client_code VARCHAR,
  form_code VARCHAR,
  workspace_slug VARCHAR
) AS $$
DECLARE
  v_client_id UUID;
  v_client_code VARCHAR;
  v_form_code VARCHAR;
  v_workspace_slug VARCHAR;
  v_booking_id UUID;
  v_customer_name VARCHAR;
  v_customer_email VARCHAR;
  v_customer_phone VARCHAR;
  v_service_name VARCHAR;
  v_price INTEGER;
BEGIN
  -- Buscar dados do booking
  SELECT id, customer_name, customer_email, customer_phone,
         COALESCE(service_name, 'Digital Nomad Visa'),
         COALESCE(price_cents, 149900)
  INTO v_booking_id, v_customer_name, v_customer_email, v_customer_phone,
       v_service_name, v_price
  FROM bookings WHERE booking_code = p_booking_code;
  
  IF v_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking não encontrado: %', p_booking_code;
  END IF;
  
  -- Gerar códigos únicos
  v_client_code := 'NW-' || LPAD(NEXTVAL('client_code_seq')::TEXT, 4, '0');
  v_form_code := 'FORM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  v_workspace_slug := 'client-' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  
  -- Criar cliente
  INSERT INTO clients (
    client_code, workspace_slug, full_name, name, email, phone,
    visa_type, service_value, status, created_at
  )
  VALUES (
    v_client_code, v_workspace_slug, v_customer_name, v_customer_name,
    v_customer_email, v_customer_phone, v_service_name,
    (v_price::DECIMAL / 100)::DECIMAL(10, 2), 'new', NOW()
  )
  RETURNING id INTO v_client_id;
  
  -- Criar formulário
  INSERT INTO client_forms (
    code, client_id, booking_id, status, full_name, email, phone,
    visa_type, service_value, created_at
  )
  VALUES (
    v_form_code, v_client_id, v_booking_id, 'pending', v_customer_name,
    v_customer_email, v_customer_phone, v_service_name,
    (v_price::DECIMAL / 100)::DECIMAL(10, 2), NOW()
  );
  
  -- Criar estágios do processo
  INSERT INTO process_stages (client_id, stage_order, stage_name, stage_key, status, created_at)
  VALUES
    (v_client_id, 1, 'Documentação Inicial', 'documentation', 'pending', NOW()),
    (v_client_id, 2, 'Análise de Elegibilidade', 'analysis', 'pending', NOW()),
    (v_client_id, 3, 'Preparação do Pedido', 'preparation', 'pending', NOW()),
    (v_client_id, 4, 'Submissão Governamental', 'submission', 'pending', NOW()),
    (v_client_id, 5, 'Acompanhamento', 'tracking', 'pending', NOW()),
    (v_client_id, 6, 'Aprovação e Entrega', 'approval', 'pending', NOW());
  
  -- Atualizar booking
  UPDATE bookings
  SET client_id = v_client_id,
      status = 'form_sent',
      updated_at = NOW()
  WHERE id = v_booking_id;
  
  -- Criar evento na timeline
  INSERT INTO timeline_events (client_id, event_type, title, description, actor_name, actor_type, created_at)
  VALUES (v_client_id, 'client_created'::event_type, 'Cliente cadastrado',
          'Cliente criado a partir do agendamento ' || p_booking_code,
          'Sistema', 'system', NOW());
  
  -- Retornar dados
  RETURN QUERY SELECT v_client_id, v_client_code::VARCHAR, v_form_code::VARCHAR, v_workspace_slug::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Criar Form a partir do Booking
-- =====================================================

CREATE OR REPLACE FUNCTION create_form_from_booking(
  p_booking_code VARCHAR
)
RETURNS TABLE (
  form_id UUID,
  form_code VARCHAR,
  form_url VARCHAR
) AS $$
DECLARE
  v_form_id UUID;
  v_form_code VARCHAR;
  v_booking_id UUID;
  v_customer_name VARCHAR;
  v_customer_email VARCHAR;
  v_customer_phone VARCHAR;
BEGIN
  -- Buscar booking
  SELECT id, customer_name, customer_email, customer_phone
  INTO v_booking_id, v_customer_name, v_customer_email, v_customer_phone
  FROM bookings WHERE booking_code = p_booking_code;
  
  IF v_booking_id IS NULL THEN
    RAISE EXCEPTION 'Booking não encontrado: %', p_booking_code;
  END IF;
  
  -- Gerar código
  v_form_code := 'FORM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  
  -- Criar formulário
  INSERT INTO client_forms (
    code, booking_id, status, full_name, email, phone, created_at
  )
  VALUES (
    v_form_code, v_booking_id, 'pending', v_customer_name,
    v_customer_email, v_customer_phone, NOW()
  )
  RETURNING id INTO v_form_id;
  
  -- Atualizar booking
  UPDATE bookings
  SET form_id = v_form_id,
      status = 'form_sent',
      updated_at = NOW()
  WHERE id = v_booking_id;
  
  -- Retornar dados
  RETURN QUERY SELECT v_form_id, v_form_code::VARCHAR, 
               ('https://nomadway-portal.vercel.app/form/' || v_form_code)::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Notificar mudança de status
-- =====================================================

CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação
  INSERT INTO notifications (recipient_type, title, message, reference_type, reference_id)
  VALUES (
    'admin',
    'Status atualizado',
    'Cliente ' || COALESCE(NEW.full_name, NEW.client_code) || ' mudou para ' || NEW.status::TEXT,
    'client',
    NEW.id
  );
  
  -- Inserir evento na timeline
  INSERT INTO timeline_events (client_id, event_type, title, description, actor_name, actor_type, created_at)
  VALUES (
    NEW.id,
    'status_changed'::event_type,
    'Status atualizado',
    'Status mudou de ' || COALESCE(OLD.status::TEXT, 'novo') || ' para ' || NEW.status::TEXT,
    'Sistema',
    'system',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_client_status_change
  AFTER UPDATE OF status ON clients
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_status_change();

-- =====================================================
-- TRIGGER: Criar estágios automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO process_stages (client_id, stage_order, stage_name, stage_key, status, created_at)
  VALUES
    (NEW.id, 1, 'Documentação Inicial', 'documentation', 'pending', NOW()),
    (NEW.id, 2, 'Análise de Elegibilidade', 'analysis', 'pending', NOW()),
    (NEW.id, 3, 'Preparação do Pedido', 'preparation', 'pending', NOW()),
    (NEW.id, 4, 'Submissão Governamental', 'submission', 'pending', NOW()),
    (NEW.id, 5, 'Acompanhamento', 'tracking', 'pending', NOW()),
    (NEW.id, 6, 'Aprovação e Entrega', 'approval', 'pending', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_client_create
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_default_stages();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Clientes com estágio atual
CREATE OR REPLACE VIEW clients_with_stage AS
SELECT 
  c.*,
  ps.stage_name as current_stage,
  ps.stage_key as current_stage_key,
  ps.status as current_stage_status
FROM clients c
LEFT JOIN process_stages ps ON ps.client_id = c.id
  AND ps.stage_order = (
    SELECT MIN(stage_order) FROM process_stages 
    WHERE client_id = c.id AND status = 'pending'
  );

-- View: Estatísticas do Kanban
CREATE OR REPLACE VIEW kanban_stats AS
SELECT 
  status,
  lead_temperature,
  COUNT(*) as count
FROM clients
GROUP BY status, lead_temperature;

-- View: Dashboard financeiro
CREATE OR REPLACE VIEW finance_dashboard AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  type,
  currency,
  SUM(amount) as total,
  SUM(amount_eur) as total_eur,
  COUNT(*) as transaction_count
FROM finance_transactions
GROUP BY DATE_TRUNC('month', transaction_date), type, currency
ORDER BY month DESC, type;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

SELECT '✅ Schema unificado criado com sucesso!' AS status;