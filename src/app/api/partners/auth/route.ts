import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificar senha do parceiro
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hash;
}

// POST - Login de parceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email, password } = body;

    // Aceitar tanto código quanto email para login
    const identifier = email || code;

    if (!identifier) {
      return NextResponse.json({ error: 'Email ou código é obrigatório' }, { status: 400 });
    }

    // Buscar parceiro por email ou código
    const query = supabase
      .from('partners')
      .select('*');

    const { data: partner, error } = email
      ? await query.ilike('email', email.toLowerCase()).single()
      : await query.eq('code', code.toUpperCase()).single();

    if (error || !partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    // Verificar status
    if (partner.status !== 'active') {
      return NextResponse.json({ error: 'Parceiro inativo' }, { status: 403 });
    }

    // Se tem senha, verificar
    if (partner.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
      }

      const valid = await verifyPassword(password, partner.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
      }
    }

    // Atualizar último login
    await supabase
      .from('partners')
      .update({ last_login: new Date().toISOString() })
      .eq('id', partner.id);

    // Definir cookie de sessão (usar código para manter compatibilidade)
    const cookieStore = await cookies();
    cookieStore.set('partner_code', partner.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 dias
    });

    return NextResponse.json({ 
      success: true, 
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        code: partner.code
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET - Verificar sessão do parceiro
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const partnerCode = cookieStore.get('partner_code')?.value;

    if (!partnerCode) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('code', partnerCode)
      .single();

    if (error || !partner) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        code: partner.code,
        status: partner.status
      }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE - Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('partner_code');
  return NextResponse.json({ success: true });
}