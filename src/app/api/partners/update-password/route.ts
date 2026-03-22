import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hash password using SubtleCrypto (browser/edge compatible)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  const data = encoder.encode(password + supabaseUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST - Update partner password (public, requires code)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, password } = body;

    if (!code || !password) {
      return NextResponse.json({ error: 'Código e senha são obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Update partner
    const { error } = await supabase
      .from('partners')
      .update({ password_hash })
      .eq('code', code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}