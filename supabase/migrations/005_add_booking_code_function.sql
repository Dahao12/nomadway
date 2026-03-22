-- Migration: Add generate_booking_code function
-- Created: 2026-03-07

-- Generate unique booking code (NW-BOOK-XXXXXX)
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT;
  exists BOOLEAN;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate code
    code := 'NW-BOOK-';
    FOR i IN 1..6 LOOP
      code := code || SUBSTRING(chars FROM FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER FOR 1);
    END LOOP;
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_code = code) INTO exists;
    
    -- If unique, return
    IF NOT exists THEN
      RETURN code;
    END IF;
    
    -- Safety limit
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique booking code after 100 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification function if not exists
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_type TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_client_id UUID DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL,
  p_form_id UUID DEFAULT NULL,
  p_recipient_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    recipient_type,
    type,
    title,
    message,
    client_id,
    booking_id,
    form_id,
    recipient_id,
    created_at
  ) VALUES (
    p_recipient_type,
    p_type,
    p_title,
    p_message,
    p_client_id,
    p_booking_id,
    p_form_id,
    p_recipient_id,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create timeline event function if not exists
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
  INSERT INTO timeline_events (
    client_id,
    event_type,
    title,
    description,
    actor_name,
    actor_type,
    metadata,
    created_at
  ) VALUES (
    p_client_id,
    p_event_type,
    p_title,
    p_description,
    p_actor_name,
    p_actor_type,
    p_metadata,
    NOW()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;