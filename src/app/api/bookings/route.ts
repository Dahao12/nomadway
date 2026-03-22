import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { rateLimitMiddleware } from '@/lib/rate-limit';

// GET - Get all bookings with filters
export async function GET(request: NextRequest) {
  // Rate limit: 200 req/min for reads
  const rateLimitResponse = rateLimitMiddleware(request, 'read');
  if (rateLimitResponse) return rateLimitResponse;
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const temperature = searchParams.get('temperature');

  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    // Support comma-separated status values
    const statuses = status.split(',');
    if (statuses.length > 1) {
      query = query.in('status', statuses);
    } else {
      query = query.eq('status', status);
    }
  }

  if (date) {
    query = query.eq('booking_date', date);
  }

  if (temperature && temperature !== 'all') {
    query = query.eq('lead_temperature', temperature);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

// POST - Create booking (called from website)
export async function POST(request: NextRequest) {
  // Rate limit: 10 req/hour for form submissions (public endpoint)
  const rateLimitResponse = rateLimitMiddleware(request, 'form');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerClient();
  const body = await request.json();

  // Support both old format (from site) and new format
  const customer_name = body.customer_name || body.name;
  const customer_email = body.customer_email || body.email;
  const customer_phone = body.customer_phone || body.phone;
  const customer_notes = body.customer_notes || body.notes || '';
  const booking_date = body.booking_date || body.date;
  const booking_time = body.booking_time || body.time;
  const service_name = body.service_name || 'Consulta Gratuita';
  const service_id = body.service_id || body.serviceId || 'consultation';
  const service_duration = body.service_duration || body.duration || 30;
  const price_cents = body.price_cents || (body.price ? body.price * 100 : 0);
  const language = body.language || body.lang || 'pt';
  const partner_code = body.partner_code || body.ref || null;
  const referral_source = body.referral_source || body.source || null;

  if (!customer_name || !customer_email || !customer_phone || !booking_date || !booking_time) {
    return NextResponse.json({
      error: 'Missing required fields',
      required: ['customer_name', 'customer_email', 'customer_phone', 'booking_date', 'booking_time']
    }, { status: 400 });
  }

  // Generate booking code
  const booking_code = 'NW' + 
    new Date().toISOString().slice(5, 10).replace('-', '') +
    Math.random().toString(36).substring(2, 6).toUpperCase();

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      booking_code,
      customer_name,
      customer_email,
      customer_phone,
      customer_notes,
      booking_date,
      booking_time,
      service_name,
      service_id,
      service_duration,
      price_cents,
      status: 'pending',
      lead_temperature: 'warm',
      language,
      partner_code,
      referral_source
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Se tem código de parceiro, criar lead automaticamente
  if (partner_code) {
    try {
      // Buscar parceiro pelo código
      const { data: partner } = await supabase
        .from('partners')
        .select('id, code')
        .eq('code', partner_code)
        .eq('status', 'active')
        .single();

      if (partner) {
        // Criar lead para o parceiro
        await supabase
          .from('partner_leads')
          .insert({
            partner_id: partner.id,
            client_name: customer_name,
            client_email: customer_email,
            client_phone: customer_phone,
            source: referral_source || 'referral_link',
            status: 'new',
            booking_id: booking.id
          });

        console.log(`✅ Lead criado para parceiro ${partner.code}`);
      }
    } catch (err) {
      console.error('Erro ao criar lead:', err);
      // Não falha o booking se o lead falhar
    }
  }

  return NextResponse.json({ success: true, booking });
}

// PUT - Update booking status or temperature
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { booking_code, status, lead_temperature } = body;

  if (!booking_code) {
    return NextResponse.json({ error: 'booking_code is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (status) updateData.status = status;
  if (lead_temperature) updateData.lead_temperature = lead_temperature;

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('booking_code', booking_code)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking: data });
}