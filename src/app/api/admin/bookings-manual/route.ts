import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

// Middleware to check admin authentication
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

// Generate booking code
function generateBookingCode() {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '').slice(2);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NW${dateStr}${random}`;
}

// POST - Create manual booking (from admin)
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { 
      customer_name, 
      customer_email, 
      customer_phone,
      service_name,
      service_price,
      notes
    } = body;

    // Validate required fields
    if (!customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Generate booking code
    const booking_code = generateBookingCode();

    // Create booking directly in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_code,
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        service_name: service_name || 'Visto Nômade Digital',
        service_id: 'manual',
        service_duration: 60,
        price_cents: Math.round((service_price || 1499) * 100),
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '09:00',
        status: 'confirmed',
        source: 'admin',
        customer_notes: notes || null,
        language: 'pt'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Erro ao criar agendamento', details: bookingError.message },
        { status: 500 }
      );
    }

    // Generate client code
    const clientCode = 'NW-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const workspaceSlug = customer_name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30) + '-' + Math.random().toString(36).slice(2, 6);

    // Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_code: clientCode,
        workspace_slug: workspaceSlug,
        full_name: customer_name,
        name: customer_name,
        email: customer_email,
        phone: customer_phone || null,
        visa_type: service_name || 'Digital Nomad Visa',
        status: 'new',
        service_value: service_price || 1499.90,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client:', clientError);
      // Don't fail - booking was created successfully
      return NextResponse.json({
        success: true,
        booking,
        message: 'Lead criado! (cliente não criado automaticamente)'
      });
    }

    // Generate form code
    const formCode = 'FORM-' + Math.random().toString(36).toUpperCase().slice(2, 8);

    // Create form for this client
    const { error: formError } = await supabase
      .from('client_forms')
      .insert({
        code: formCode,
        client_id: client.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (formError) {
      console.error('Error creating form:', formError);
      // Don't fail - client was created successfully
    }

    // Link booking to client
    await supabase
      .from('bookings')
      .update({
        client_id: client.id,
        form_id: formCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id);

    return NextResponse.json({
      success: true,
      booking,
      client,
      form_code: formCode,
      message: 'Lead criado com sucesso!'
    });

  } catch (error) {
    console.error('Error creating manual booking:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    );
  }
}