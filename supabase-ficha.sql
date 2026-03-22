-- Tabela para fichas cadastrais
CREATE TABLE IF NOT EXISTS client_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  full_name TEXT NOT NULL,
  birth_date DATE,
  nationality TEXT DEFAULT 'Brasileira',
  marital_status TEXT,
  cpf TEXT,
  rg TEXT,
  email TEXT,
  phone TEXT,
  
  -- Passaporte
  passport_number TEXT,
  passport_issue_date DATE,
  passport_expiry_date DATE,
  passport_country TEXT DEFAULT 'Brasil',
  
  -- Endereço
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Brasil',
  
  -- Dados Profissionais
  profession TEXT,
  work_type TEXT,
  company_name TEXT,
  cnpj TEXT,
  work_area TEXT,
  experience_years TEXT,
  monthly_income_range TEXT,
  linkedin_url TEXT,
  
  -- Clientes/Fontes de Renda
  client1_name TEXT,
  client1_value TEXT,
  client2_name TEXT,
  client2_value TEXT,
  client3_name TEXT,
  client3_value TEXT,
  
  -- Visto
  visa_type TEXT DEFAULT 'digital_nomad',
  destination_city TEXT,
  planned_move_date DATE,
  has_previous_visa BOOLEAN DEFAULT FALSE,
  
  -- Acompanhantes (JSONB)
  companions JSONB DEFAULT '[]',
  
  -- Documentos
  has_passport BOOLEAN DEFAULT FALSE,
  has_cpf BOOLEAN DEFAULT FALSE,
  has_rg BOOLEAN DEFAULT FALSE,
  has_marriage_cert BOOLEAN DEFAULT FALSE,
  has_birth_cert BOOLEAN DEFAULT FALSE,
  has_income_proof BOOLEAN DEFAULT FALSE,
  has_work_contract BOOLEAN DEFAULT FALSE,
  has_resume BOOLEAN DEFAULT FALSE,
  has_diploma BOOLEAN DEFAULT FALSE,
  has_health_insurance BOOLEAN DEFAULT FALSE,
  has_criminal_record BOOLEAN DEFAULT FALSE,
  has_address_proof BOOLEAN DEFAULT FALSE,
  
  -- Observações
  notes TEXT,
  source TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_forms_client ON client_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_forms_email ON client_forms(email);

-- RLS
ALTER TABLE client_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on client_forms" ON client_forms FOR ALL TO service_role USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_form_updated ON client_forms;
CREATE TRIGGER on_form_updated
  BEFORE UPDATE ON client_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();