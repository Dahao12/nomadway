import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar comissões (com filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partner_id = searchParams.get('partner_id');
    const status = searchParams.get('status');
    const booking_id = searchParams.get('booking_id');

    let query = supabase
      .from('commissions')
      .select(`
        *,
        partner:partners(id, name, code)
      `)
      .order('created_at', { ascending: false });

    if (partner_id) {
      query = query.eq('partner_id', partner_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (booking_id) {
      query = query.eq('booking_id', booking_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ commissions: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar nova comissão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, booking_id, client_name, client_email, service_type, amount_cents, source, notes } = body;

    const { data, error } = await supabase
      .from('commissions')
      .insert([{
        partner_id,
        booking_id,
        client_name,
        client_email,
        service_type,
        amount_cents,
        status: 'pending',
        source,
        notes
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Atualizar total de ganhos do parceiro
    await supabase.rpc('update_partner_earnings', { p_partner_id: partner_id });

    return NextResponse.json({ commission: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}