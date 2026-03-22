-- WhatsApp Leads Capture Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(255),
  group_name VARCHAR(255),
  keywords TEXT[],
  first_message TEXT,
  last_message TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 1,
  source VARCHAR(50) DEFAULT 'whatsapp_group',
  sender_jid VARCHAR(255),
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to partner_leads or clients when converted
  partner_lead_id UUID REFERENCES partner_leads(id),
  client_id UUID REFERENCES clients(id),
  
  -- Metadata
  notes TEXT
);

-- Index for fast phone lookup
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_phone ON whatsapp_leads(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status ON whatsapp_leads(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_keywords ON whatsapp_leads USING GIN(keywords);

-- Enable Row Level Security
ALTER TABLE whatsapp_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role can do everything" ON whatsapp_leads
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read
CREATE POLICY "Authenticated users can read" ON whatsapp_leads
  FOR SELECT TO authenticated
  USING (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_whatsapp_leads_updated_at
  BEFORE UPDATE ON whatsapp_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_leads_updated_at();

-- Comments
COMMENT ON TABLE whatsapp_leads IS 'Leads captured from WhatsApp group conversations';
COMMENT ON COLUMN whatsapp_leads.phone IS 'Phone number with country code (+55)';
COMMENT ON COLUMN whatsapp_leads.keywords IS 'Keywords that identified this person as a lead';
COMMENT ON COLUMN whatsapp_leads.status IS 'new, contacted, converted, lost';