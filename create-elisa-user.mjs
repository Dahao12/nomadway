import crypto from 'crypto';

const SUPABASE_URL = 'https://ymmdygffzkpduxudsfls.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3ODM4OCwiZXhwIjoyMDUxMDU0Mzg4fQ.dqXqzJd2kC2r6c5cT5vP_2jF3nK4qM1pL_5rS6cT7vU';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function createOperationalUser() {
  const userData = {
    email: 'elisa@nomadway.com.br',
    password: hashPassword('Elisanomad26'),
    name: 'Elisa Boaventura',
    role: 'operacional',
    created_at: new Date().toISOString(),
  };

  try {
    // Check if email already exists
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?id=eq.email&select=id`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    console.log('🔍 Verificando se email já existe...');

    // Create user via REST API
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/admin_users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(userData),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('❌ Erro ao criar usuário:', createRes.status, errorText);

      if (errorText.includes('duplicate key') || errorText.includes('already exists')) {
        console.log('\n⚠️  Email já cadastrado no banco.');
      }
      return;
    }

    const user = await createRes.json();
    const createdUser = user[0];

    console.log('✅ Usuário criado com sucesso!');
    console.log('');
    console.log('📋 Dados do usuário:');
    console.log('  Nome:', createdUser.name);
    console.log('  Email:', createdUser.email);
    console.log('  Cargo:', createdUser.role);
    console.log('  ID:', createdUser.id);
    console.log('  Criado em:', new Date(createdUser.created_at).toLocaleString('pt-BR'));
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log('  Email:', userData.email);
    console.log('  Senha:', 'Elisanomad26');
    console.log('');
    console.log('🌐 Login: https://nomadway-portal.vercel.app/admin/login');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createOperationalUser();