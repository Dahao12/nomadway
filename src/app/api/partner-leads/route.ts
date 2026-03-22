import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar leads (com filtros)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partner_id = searchParams.get('partner_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('partner_leads')
      .select(`
        *,
        partner:partners(id, name, code)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (partner_id) {
      query = query.eq('partner_id', partner_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads: data, total: count });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar novo lead (quando alguém acessa com código de parceiro)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_code, client_name, client_email, client_phone, source, referral_url } = body;

    // Buscar parceiro pelo código
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, code')
      .eq('code', partner_code)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado ou inativo' }, { status: 404 });
    }

    // Criar lead
    const { data, error } = await supabase
      .from('partner_leads')
      .insert([{
        partner_id: partner.id,
        client_name,
        client_email,
        client_phone,
        source: source || 'referral_link',
        status: 'new',
        notes: referral_url ? `URL: ${referral_url}` : null
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // TODO: Notificar parceiro via WhatsApp sobre novo lead
    // TODO: Notificar admin sobre novo lead

    return NextResponse.json({ lead: data, partner_code: partner.code }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}