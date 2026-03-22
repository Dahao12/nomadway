import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Buscar parceiro por ID ou código
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Buscar por ID ou código
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .or(`id.eq.${id},code.eq.${id}`)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ partner: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Atualizar parceiro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, phone, status, commission_tier, payment_method, payment_info, notes, total_clients, total_earnings_cents, total_paid_cents, password } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (commission_tier !== undefined) updateData.commission_tier = commission_tier;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (payment_info !== undefined) updateData.payment_info = payment_info;
    if (notes !== undefined) updateData.notes = notes;
    if (total_clients !== undefined) updateData.total_clients = total_clients;
    if (total_earnings_cents !== undefined) updateData.total_earnings_cents = total_earnings_cents;
    if (total_paid_cents !== undefined) updateData.total_paid_cents = total_paid_cents;
    
    // Hash da senha se fornecida
    if (password && password.length >= 6) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + process.env.NEXT_PUBLIC_SUPABASE_URL!);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      updateData.password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const { data, error } = await supabase
      .from('partners')
      .update(updateData)
      .or(`id.eq.${id},code.eq.${id}`)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ partner: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Excluir parceiro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('partners')
      .delete()
      .or(`id.eq.${id},code.eq.${id}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}