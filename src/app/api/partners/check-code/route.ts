import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Check if partner code exists (PUBLIC - no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
    }

    // Case-insensitive search
    const { data, error } = await supabase
      .from('partners')
      .select('id, name, email, code, status')
      .ilike('code', code.toUpperCase())
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Código não encontrado' }, { status: 404 });
    }

    // Check if partner has password
    const { data: fullData } = await supabase
      .from('partners')
      .select('password_hash')
      .eq('id', data.id)
      .single();

    return NextResponse.json({
      partner: {
        id: data.id,
        name: data.name,
        email: data.email,
        code: data.code,
        hasPassword: !!fullData?.password_hash
      }
    });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}