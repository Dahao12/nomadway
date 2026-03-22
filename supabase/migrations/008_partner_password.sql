-- Adicionar campo de senha para parceiros
ALTER TABLE partners ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Criar índice para buscas por código e email
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);