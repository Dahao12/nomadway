-- Auto-leads: Leads capturados automaticamente de grupos WhatsApp
-- Created: 2026-03-14

CREATE TABLE IF NOT EXISTS auto_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Origem
    group_id VARCHAR(255) NOT NULL,
    group_name VARCHAR(255),
    
    -- Contato detectado
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_jid VARCHAR(255),
    
    -- Mensagem
    message TEXT NOT NULL,
    message_id VARCHAR(255),
    message_timestamp TIMESTAMP,
    
    -- Análise
    keywords_matched TEXT[],
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    category VARCHAR(50) DEFAULT 'general', -- 'visa', 'housing', 'work', 'general'
    
    -- Status
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, converted, discarded
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    assigned_to VARCHAR(255),
    notes TEXT,
    
    -- Conversão (quando vira cliente)
    converted_to_client UUID REFERENCES clients(id),
    converted_to_booking UUID REFERENCES bookings(id),
    converted_at TIMESTAMP,
    
    -- Contexto
    conversation_context TEXT,
    
    -- Timestamps
    detected_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_auto_leads_status ON auto_leads(status);
CREATE INDEX IF NOT EXISTS idx_auto_leads_group ON auto_leads(group_id);
CREATE INDEX IF NOT EXISTS idx_auto_leads_date ON auto_leads(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_leads_priority ON auto_leads(priority);

-- RLS (Row Level Security)
ALTER TABLE auto_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin to manage auto_leads" ON auto_leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_auto_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_leads_updated_at
    BEFORE UPDATE ON auto_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_auto_leads_updated_at();

-- Comentários
COMMENT ON TABLE auto_leads IS 'Leads capturados automaticamente de grupos WhatsApp';
COMMENT ON COLUMN auto_leads.confidence_score IS 'Pontuação de confiança: 0.00 (ruído) a 1.00 (lead certeza)';
COMMENT ON COLUMN auto_leads.category IS 'Categoria do lead: visa, housing, work, general';
COMMENT ON COLUMN auto_leads.converted_to_client IS 'Referência ao cliente quando convertido';
COMMENT ON COLUMN auto_leads.converted_to_booking IS 'Referência ao agendamento quando convertido';