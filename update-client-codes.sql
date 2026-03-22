-- Atualizar códigos duplicados para códigos únicos
-- Execute no SQL Editor do Supabase

-- Primeiro, ver quantos clientes têm código duplicado
SELECT client_code, COUNT(*) as total 
FROM clients 
GROUP BY client_code 
HAVING COUNT(*) > 1;

-- Atualizar TODOS os clientes com códigos únicos baseados em timestamp
-- Execute esta parte para corrigir todos os códigos
UPDATE clients
SET client_code = 'NW-' || UPPER(SUBSTRING(MD5(id::text || RANDOM()::text) FROM 1 FOR 8))
WHERE id IS NOT NULL;

-- Verificar resultado
SELECT id, client_code, name FROM clients ORDER BY created_at DESC;