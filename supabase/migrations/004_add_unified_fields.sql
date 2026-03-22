-- =====================================================
-- NOMADWAY MIGRATION - Add unified schema fields
-- Run in Supabase SQL Editor
-- =====================================================

-- ==========================================
-- 1. BOOKINGS - Add new columns
-- ==========================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS form_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS form_sent_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Create unique index on booking_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code) WHERE booking_code IS NOT NULL;

-- ==========================================
-- 2. CLIENTS - Add new columns
-- ==========================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Brasileira';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS passport_expiry_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_income_range TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS has_foreign_link BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_freelancer BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS visa_type TEXT DEFAULT 'digital_nomad';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS service_value DECIMAL(10, 2) DEFAULT 1499.90;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_booking_id UUID;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_form_id UUID;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_generated_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;

-- Create unique index on client_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_code ON clients(client_code) WHERE client_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_slug ON clients(workspace_slug) WHERE workspace_slug IS NOT NULL;

-- ==========================================
-- 3. CLIENT_FORMS - Add booking link
-- ==========================================
ALTER TABLE client_forms ADD COLUMN IF NOT EXISTS booking_id UUID;
ALTER TABLE client_forms ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- ==========================================
-- 4. MESSAGES - Create if not exists
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES process_stages(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client', 'system')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  read_by_admin BOOLEAN DEFAULT false,
  read_by_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ==========================================
-- 5. TIMELINE_EVENTS - Add if not exists columns
-- ==========================================
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS actor_name TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS actor_type TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ==========================================
-- 6. NOTIFICATIONS - Create table
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'client')),
  recipient_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  booking_id UUID,
  form_id UUID,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ==========================================
-- 7. FUNCTIONS - Generate codes
-- ==========================================
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

CREATE OR REPLACE FUNCTION generate_workspace_slug(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  slug TEXT;
  suffix TEXT;
  counter INTEGER := 0;
  exists BOOLEAN;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := SUBSTRING(base_slug FROM 1 FOR 30);
  
  suffix := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);
  slug := base_slug || '-' || suffix;
  
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

-- ==========================================
-- 8. TRIGGERS - Update timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_timestamp ON bookings;
CREATE TRIGGER update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ==========================================
-- 9. RLS POLICIES - Service role can do anything
-- ==========================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass" ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON client_forms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON process_stages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON timeline_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- DONE!
-- ==========================================
-- Run this SQL in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/ymmdygffzkpduxudsfls/sql/new