import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar todos os parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const code = searchParams.get('code');

    // Verificar se a tabela existe
    const { error: tableError } = await supabase
      .from('partners')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Erro ao acessar tabela partners:', tableError);
      // Tabela não existe - retornar lista vazia para demo
      if (tableError.message?.includes('does not exist') || tableError.message?.includes('relation')) {
        // Inserir parceiros demo se tabela não existe
        return NextResponse.json({ 
          partners: [
            { id: 'demo-1', name: 'Ezequiel', email: 'ezequiel@nomadway.com.br', code: 'EZE01', status: 'active', total_clients: 0, total_earnings_cents: 0, total_paid_cents: 0 },
            { id: 'demo-2', name: 'Elisa', email: 'elisa@nomadway.com.br', code: 'ELZ01', status: 'active', total_clients: 0, total_earnings_cents: 0, total_paid_cents: 0 }
          ],
          warning: 'Tabela partners não encontrada. Execute o SQL no Supabase.'
        });
      }
      return NextResponse.json({ error: tableError.message }, { status: 500 });
    }

    let query = supabase
      .from('partners')
      .select('id, name, email, phone, code, status, commission_tier, total_clients, total_earnings_cents, total_paid_cents, payment_method, notes, created_at, updated_at, last_login, password_hash')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (code) {
      // Case-insensitive search - convert both to uppercase
      query = query.ilike('code', code.toUpperCase());
    }

    const email = searchParams.get('email');
    if (email) {
      // Login por email - case insensitive
      query = query.ilike('email', email.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include has_password boolean but never the actual hash
    const partners = data?.map(partner => {
      const { password_hash, ...partnerData } = partner;
      return {
        ...partnerData,
        has_password: !!password_hash
      };
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar novo parceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, commission_tier = 1, payment_method, payment_info, notes, password } = body;

    // Gerar código único (formato: XXXNNN, ex: ABC12)
    let code = '';
    let attempts = 0;
    
    do {
      // Gerar código: 3 letras + 2 números
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      code = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('') +
             Array.from({ length: 2 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
      
      // Verificar se código já existe
      const { data: existing } = await supabase
        .from('partners')
        .select('code')
        .eq('code', code)
        .single();
      
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
    
    if (attempts >= 10) {
      return NextResponse.json({ error: 'Não foi possível gerar um código único. Tente novamente.' }, { status: 500 });
    }

    // Hash da senha se fornecida
    const password_hash = password ? await hashPassword(password) : null;

    const { data, error } = await supabase
      .from('partners')
      .insert([{
        name,
        email,
        phone,
        code,
        status: 'active',
        commission_tier,
        total_clients: 0,
        total_earnings_cents: 0,
        total_paid_cents: 0,
        payment_method,
        payment_info,
        notes,
        password_hash
      }])
      .select('id, name, email, phone, code, status, commission_tier, total_clients, total_earnings_cents, total_paid_cents, payment_method, notes, created_at, updated_at, last_login')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // NEVER return password_hash in response
    return NextResponse.json({ partner: data }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar parceiro:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Função para hash de senha (simples - em produção usar bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}