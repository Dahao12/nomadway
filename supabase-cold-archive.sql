-- Migration: Add cold_since and archived status
-- Date: 2026-03-07

-- Add cold_since column to track when lead became cold
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cold_since TIMESTAMPTZ DEFAULT NULL;

-- Add archived status check constraint (if not exists)
-- Status options: pending, confirmed, form_sent, completed, cancelled, archived
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'form_sent', 'completed', 'cancelled', 'archived'));

-- Add archived_at column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archive_reason column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archive_reason VARCHAR(50) DEFAULT NULL;

-- Create index for faster cold lead queries
CREATE INDEX IF NOT EXISTS idx_bookings_cold_since ON bookings(cold_since) WHERE cold_since IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Function to archive cold leads after 7 days
CREATE OR REPLACE FUNCTION archive_cold_leads()
RETURNS TABLE (id UUID, booking_code VARCHAR, customer_name VARCHAR, days_cold INT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE bookings
  SET 
    status = 'archived',
    archived_at = NOW(),
    archive_reason = 'cold_7_days'
  WHERE 
    lead_temperature = 'cold'
    AND cold_since IS NOT NULL
    AND cold_since < NOW() - INTERVAL '7 days'
    AND status != 'archived'
  RETURNING 
    bookings.id,
    bookings.booking_code,
    bookings.customer_name,
    (EXTRACT(DAY FROM NOW() - bookings.cold_since))::INT;
END;
$$;

-- Function to reset cold_since when temperature changes away from cold
CREATE OR REPLACE FUNCTION update_cold_since()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If temperature changed TO cold, set cold_since
  IF NEW.lead_temperature = 'cold' AND OLD.lead_temperature != 'cold' THEN
    NEW.cold_since := NOW();
  -- If temperature changed FROM cold, clear cold_since
  ELSIF NEW.lead_temperature != 'cold' AND OLD.lead_temperature = 'cold' THEN
    NEW.cold_since := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically update cold_since
DROP TRIGGER IF EXISTS trigger_update_cold_since ON bookings;
CREATE TRIGGER trigger_update_cold_since
BEFORE UPDATE OF lead_temperature ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_cold_since();