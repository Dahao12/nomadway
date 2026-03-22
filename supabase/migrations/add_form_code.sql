-- Migration: Add form link code column
-- Run this in Supabase SQL Editor

-- Add code column to client_forms
ALTER TABLE client_forms 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- Add admin_notes column
ALTER TABLE client_forms 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add submitted_at column
ALTER TABLE client_forms 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_forms_code ON client_forms(code);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_client_forms_status ON client_forms(status);

-- Update status to handle new values
-- Status: 'pending' (link created), 'completed' (submitted by client), 'processed' (client created)
-- No need to change - existing 'completed' forms will work as is

-- Add client_code column to clients if doesn't exist
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_code VARCHAR(20) UNIQUE;

-- Generate client codes for existing clients
UPDATE clients 
SET client_code = 'NW-' || LPAD(SUBSTRING(id::text, 1, 4), 4, '0')
WHERE client_code IS NULL;

-- Create function to generate sequential client codes
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS VARCHAR AS $$
DECLARE
  last_code VARCHAR(20);
  next_num INTEGER;
BEGIN
  SELECT client_code INTO last_code 
  FROM clients 
  WHERE client_code IS NOT NULL 
  ORDER BY client_code DESC 
  LIMIT 1;
  
  IF last_code IS NULL THEN
    RETURN 'NW-0001';
  END IF;
  
  next_num := SUBSTRING(last_code FROM 4)::INTEGER + 1;
  RETURN 'NW-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;