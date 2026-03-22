-- Migration: Add discount fields to bookings
-- Date: 2026-03-09

-- Add discount_percent column (e.g., 10 for 10%)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100);

-- Add discount_value column in cents (e.g., 5000 for €50)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_value INTEGER DEFAULT NULL CHECK (discount_value >= 0);

-- Create index for queries with discounts
CREATE INDEX IF NOT EXISTS idx_bookings_discount ON bookings(discount_percent, discount_value) WHERE discount_percent IS NOT NULL OR discount_value IS NOT NULL;