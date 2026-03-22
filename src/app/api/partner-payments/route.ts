import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Listar pagamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partner_id = searchParams.get('partner_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('partner_payments')
      .select(`
        *,
        partner:partners(id, name, code)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (partner_id) {
      query = query.eq('partner_id', partner_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Criar novo pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, amount_cents, payment_method, payment_reference, status = 'paid', notes } = body;

    if (!partner_id || !amount_cents) {
      return NextResponse.json({ error: 'partner_id e amount_cents são obrigatórios' }, { status: 400 });
    }

    // Criar pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('partner_payments')
      .insert([{
        partner_id,
        amount_cents,
        status,
        payment_method,
        payment_reference: payment_reference || payment_method === 'pix' ? 'PIX' : payment_method === 'wise' ? 'Wise' : payment_method === 'paypal' ? 'PayPal' : 'Bank',
        notes,
        processed_at: status === 'paid' ? new Date().toISOString() : null,
      }])
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    // Atualizar total pago do parceiro
    if (status === 'paid') {
      await supabase.rpc('update_partner_totals', { p_partner_id: partner_id });
      
      // Fallback se a função não existir
      const { data: partner } = await supabase
        .from('partners')
        .select('total_paid_cents')
        .eq('id', partner_id)
        .single();
      
      if (partner) {
        await supabase
          .from('partners')
          .update({ total_paid_cents: (partner.total_paid_cents || 0) + amount_cents })
          .eq('id', partner_id);
      }
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}