import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Check admin auth
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

// Hash password with salt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password
function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// GET - List admin users
export async function GET() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    
    // Check if table exists, if not create it
    const { data: existing, error: tableError } = await supabase
      .from('admin_users')
      .select('id, email, name, role, created_at, last_login')
      .order('created_at', { ascending: false });

    if (tableError?.code === '42P01') {
      // Table doesn't exist, return empty array
      return NextResponse.json({ users: [], message: 'Tabela não existe. Crie o primeiro usuário.' });
    }

    if (tableError) {
      console.error('Error fetching users:', tableError);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    return NextResponse.json({ users: existing || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, senha e nome são obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const { data: user, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || 'admin',
        created_at: new Date().toISOString(),
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Delete admin user
export async function DELETE(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Export verify function for login
export { verifyPassword };