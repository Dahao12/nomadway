-- =====================================================
-- NOMADWAY FINANCE MODULE - Supabase Schema
-- =====================================================

-- Categories for transactions
CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  emoji VARCHAR(10),
  color VARCHAR(20) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories
INSERT INTO finance_categories (name, type, emoji, color) VALUES
  -- Income categories
  ('Visto Digital Nomad', 'income', '🛂', '#10B981'),
  ('Consulta', 'income', '💬', '#3B82F6'),
  ('Pacote Completo', 'income', '📦', '#8B5CF6'),
  ('Serviço Extra', 'income', '⚡', '#F59E0B'),
  ('Outros', 'income', '💰', '#6B7280'),
  
  -- Expense categories
  ('Marketing', 'expense', '📢', '#EF4444'),
  ('Software', 'expense', '💻', '#3B82F6'),
  ('Impostos', 'expense', '📄', '#F59E0B'),
  ('Viagens', 'expense', '✈️', '#EC4899'),
  ('Escritório', 'expense', '🏢', '#6B7280'),
  ('Pessoal', 'expense', '👤', '#8B5CF6'),
  ('Outros', 'expense', '💸', '#94A3B8')
ON CONFLICT DO NOTHING;

-- Transactions (income/expenses)
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  
  -- Amount and currency
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  amount_eur DECIMAL(12, 2), -- Converted to EUR for reporting
  
  -- Details
  description TEXT,
  category_id UUID REFERENCES finance_categories(id),
  
  -- Link to client (optional)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Date
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Payment info
  payment_method VARCHAR(50),
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval VARCHAR(20), -- monthly, yearly, etc.
  
  -- Metadata
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON finance_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON finance_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON finance_transactions(category_id);

-- =====================================================
-- BLOCKED SLOTS (for schedule management)
-- =====================================================

CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time VARCHAR(10), -- HH:MM format, null = all day
  end_time VARCHAR(10), -- HH:MM format
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(start_date, end_date);

-- View for monthly summary
CREATE OR REPLACE VIEW finance_monthly_summary AS
SELECT 
  DATE_TRUNC('month', transaction_date) AS month,
  currency,
  COUNT(*) FILTER (WHERE type = 'income') AS income_count,
  COUNT(*) FILTER (WHERE type = 'expense') AS expense_count,
  COALESCE(SUM(amount_eur) FILTER (WHERE type = 'income'), 0) AS total_income_eur,
  COALESCE(SUM(amount_eur) FILTER (WHERE type = 'expense'), 0) AS total_expense_eur,
  COALESCE(SUM(amount_eur) FILTER (WHERE type = 'income'), 0) - 
  COALESCE(SUM(amount_eur) FILTER (WHERE type = 'expense'), 0) AS profit_eur
FROM finance_transactions
GROUP BY DATE_TRUNC('month', transaction_date), currency
ORDER BY month DESC;

-- Function to get category totals
CREATE OR REPLACE FUNCTION get_category_totals(
  p_start_date DATE,
  p_end_date DATE,
  p_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  category_id UUID,
  category_name VARCHAR,
  category_emoji VARCHAR,
  total_eur DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.emoji,
    COALESCE(SUM(t.amount_eur), 0)::DECIMAL AS total_eur,
    COUNT(t.id) AS transaction_count
  FROM finance_categories c
  LEFT JOIN finance_transactions t ON t.category_id = c.id
    AND t.transaction_date >= p_start_date
    AND t.transaction_date <= p_end_date
  WHERE p_type IS NULL OR c.type = p_type
  GROUP BY c.id, c.name, c.emoji
  ORDER BY total_eur DESC;
END;
$$ LANGUAGE plpgsql;