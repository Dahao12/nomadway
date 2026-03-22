import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - List clients with filters
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const temperature = searchParams.get('temperature');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build base query for count
  let countQuery = supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .not('status', 'in', '(deleted,cancelled)');

  if (status && status !== 'all') {
    countQuery = countQuery.eq('status', status);
  }

  if (temperature) {
    countQuery = countQuery.eq('lead_temperature', temperature);
  }

  if (search) {
    countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,client_code.ilike.%${search}%`);
  }

  const { count } = await countQuery;

  // Build main query
  let query = supabase
    .from('clients')
    .select(`
      *,
      process_stages (
        id,
        stage_type,
        stage_name,
        stage_order,
        status,
        progress_percent,
        notes_client
      )
    `)
    .not('status', 'in', '(deleted,cancelled)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (temperature) {
    query = query.eq('lead_temperature', temperature);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,client_code.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ clients: data, total: count });
}

// POST - Create client from booking
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { booking_code, full_name, email, phone, visa_type, service_value } = body;

  if (!booking_code) {
    return NextResponse.json({ error: 'booking_code is required' }, { status: 400 });
  }

  // Use SQL function to create client
  const { data, error } = await supabase
    .rpc('create_client_from_booking', { p_booking_code: booking_code });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    client_id: data?.[0]?.client_id,
    client_code: data?.[0]?.client_code,
    form_code: data?.[0]?.form_code,
    workspace_slug: data?.[0]?.workspace_slug
  });
}

// PUT - Update client status
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { client_id, status, lead_temperature, notes } = body;

  if (!client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (status) updateData.status = status;
  if (lead_temperature) updateData.lead_temperature = lead_temperature;
  if (notes !== undefined) updateData.notes = notes;

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', client_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, client: data });
}

// PATCH - Update client fields (including discount)
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { client_id, discount_percent, discount_value, service_value, notes, status, lead_temperature } = body;

  if (!client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (discount_percent !== undefined) updateData.discount_percent = discount_percent;
  if (discount_value !== undefined) updateData.discount_value = discount_value;
  if (service_value !== undefined) updateData.service_value = service_value;
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;
  if (lead_temperature !== undefined) updateData.lead_temperature = lead_temperature;

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', client_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, client: data });
}

// DELETE - Archive client (soft delete by changing status)
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get('client_id');

  if (!client_id) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('clients')
    .update({ status: 'cancelled' })
    .eq('id', client_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}