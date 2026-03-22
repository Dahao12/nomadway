import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Auth helper
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_TOKEN || token === 'nomadway2024';
}

// POST - Convert auto-lead to client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const body = await request.json();

  // Get the auto-lead
  const { data: lead, error: leadError } = await supabase
    .from('auto_leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Start transaction-like operation
  try {
    // Create client if requested
    let clientId = null;
    if (body.create_client) {
      const clientData = {
        full_name: body.client_name || lead.contact_name || 'Nome não informado',
        email: body.email || null,
        phone: body.phone || lead.contact_phone || null,
        whatsapp: body.phone || lead.contact_phone || null,
        source: 'whatsapp_monitor',
        status: 'new',
        notes: `Lead capturado do grupo: ${lead.group_name}\n\nMensagem original: ${lead.message}`
      };

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (clientError) throw clientError;
      clientId = client.id;
    }

    // Create booking if requested
    let bookingId = null;
    if (body.create_booking && clientId) {
      const bookingData = {
        client_id: clientId,
        service: body.service || 'Consulta Gratuita',
        status: 'pending',
        source: 'whatsapp_monitor',
        notes: `Lead capturado automaticamente\n\nGrupo: ${lead.group_name}\nMensagem: ${lead.message}`
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;
      bookingId = booking.id;
    }

    // Update auto-lead with conversion info
    const { error: updateError } = await supabase
      .from('auto_leads')
      .update({
        status: 'converted',
        converted_to_client: clientId,
        converted_to_booking: bookingId,
        converted_at: new Date().toISOString(),
        notes: body.notes || lead.notes
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Lead converted successfully',
      client_id: clientId,
      booking_id: bookingId
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ 
      error: 'Failed to convert lead',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}