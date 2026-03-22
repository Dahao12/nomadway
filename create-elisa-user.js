const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ymmdygffzkpduxudsfls.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3ODM4OCwiZXhwIjoyMDUxMDU0Mzg4fQ.dqXqzJd2kC2r6c5cT5vP_2jF3nK4qM1pL_5rS6cT7vU';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function createOperationalUser() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const userData = {
    email: 'elisa@nomadway.com.br',
    password: hashPassword('Elisanomad26'),
    name: 'Elisa Boaventura',
    role: 'operacional',
    created_at: new Date().toISOString(),
  };

  try {
    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', userData.email.toLowerCase())
      .single();

    if (existing) {
      console.log('❌ Email já cadastrado:', userData.email);
      return;
    }

    // Create user
    const { data: user, error } = await supabase
      .from('admin_users')
      .insert(userData)
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return;
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('📋 Dados do usuário:');
    console.log('  Nome:', user.name);
    console.log('  Email:', user.email);
    console.log('  Cargo:', user.role);
    console.log('  ID:', user.id);
    console.log('  Criado em:', new Date(user.created_at).toLocaleString('pt-BR'));
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log('  Email:', userData.email);
    console.log('  Senha:', 'Elisanomad26');
    console.log('');
    console.log('🌐 Login:', 'https://nomadway-portal.vercel.app/admin/login');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createOperationalUser();