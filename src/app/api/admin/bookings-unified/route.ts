import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { bookingCreateSchema, bookingUpdateSchema } from '@/lib/validation';
import { getUrls, generateWhatsAppMessage } from '@/lib/utils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// POST - Create new booking with auto-generated codes (using SQL functions)
export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    
    // Validate input
    const validation = bookingCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // 1. Generate booking code using SQL function (atomic)
    const { data: bookingCodeResult, error: bookingCodeError } = await supabase
      .rpc('generate_booking_code');
    
    if (bookingCodeError || !bookingCodeResult) {
      return NextResponse.json(
        { error: 'Erro ao gerar código de agendamento' },
        { status: 500 }
      );
    }
    const bookingCode = bookingCodeResult;
    
    // 2. Generate client code using SQL function (atomic)
    const { data: clientCodeResult, error: clientCodeError } = await supabase
      .rpc('generate_client_code');
    
    if (clientCodeError || !clientCodeResult) {
      return NextResponse.json(
        { error: 'Erro ao gerar código de cliente' },
        { status: 500 }
      );
    }
    const clientCode = clientCodeResult;
    
    // 3. Generate form code using SQL function (atomic)
    const { data: formCodeResult, error: formCodeError } = await supabase
      .rpc('generate_form_code');
    
    if (formCodeError || !formCodeResult) {
      return NextResponse.json(
        { error: 'Erro ao gerar código de formulário' },
        { status: 500 }
      );
    }
    const formCode = formCodeResult;
    
    // 4. Generate workspace slug
    const baseSlug = data.customer_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20)
      .replace(/^-|-$/g, '');
    const workspaceSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    
    // 5. Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_code: clientCode,
        workspace_slug: workspaceSlug,
        full_name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone || null,
        visa_type: data.service_name || 'digital_nomad',
        service_value: data.service_price || 1499.90,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.error('Error creating client:', clientError);
      return NextResponse.json(
        { error: 'Erro ao criar cliente', details: clientError.message },
        { status: 500 }
      );
    }
    
    // 6. Create form record
    const { data: form, error: formError } = await supabase
      .from('client_forms')
      .insert({
        code: formCode,
        status: 'pending',
        full_name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone || null,
        visa_type: data.service_name || 'digital_nomad',
        service_value: String(data.service_price || 1499.90),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (formError) {
      console.error('Error creating form:', formError);
      // Continue without form - not critical
    }
    
    // 7. Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || null,
        service_name: data.service_name || 'Digital Nomad Visa',
        service_price: data.service_price || 1499.90,
        booking_date: data.booking_date || new Date().toISOString().split('T')[0],
        booking_time: data.booking_time || '10:00',
        status: 'pending',
        client_id: client.id,
        form_id: form?.id || null,
        notes: data.notes || null,
        source: data.source || 'website',
        created_at: new Date().toISOString()
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
    
    // 8. Update client and form with booking reference
    await supabase
      .from('clients')
      .update({ 
        source_booking_id: booking.id,
        source_form_id: form?.id || null
      })
      .eq('id', client.id);
    
    if (form) {
      await supabase
        .from('client_forms')
        .update({ booking_id: booking.id })
        .eq('id', form.id);
    }
    
    // 9. Create timeline event (fire and forget)
    void (async () => {
      try {
        await supabase.rpc('create_timeline_event', {
          p_client_id: client.id,
          p_event_type: 'created',
          p_title: 'Cliente criado',
          p_description: `Agendamento ${bookingCode} criado via ${data.source || 'website'}`,
          p_actor_name: 'Sistema',
          p_actor_type: 'system',
          p_metadata: { booking_code: bookingCode, form_code: formCode }
        });
      } catch {}
    })();
    
    // 10. Create notification for admin (fire and forget)
    void (async () => {
      try {
        await supabase.rpc('create_notification', {
          p_recipient_type: 'admin',
          p_type: 'new_booking',
          p_title: 'Novo agendamento',
          p_message: `${data.customer_name} agendou para ${data.booking_date || 'hoje'}`,
          p_client_id: client.id,
          p_booking_id: booking.id,
          p_form_id: form?.id || null
        });
      } catch {}
    })();
    
    // Build URLs
    const urls = getUrls(formCode, workspaceSlug, client.id);
    
    // Return all created records
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_code: booking.booking_code,
        status: booking.status
      },
      client: {
        id: client.id,
        client_code: client.client_code,
        workspace_slug: client.workspace_slug
      },
      form: form ? {
        id: form.id,
        code: form.code
      } : null,
      links: {
        form_url: `${APP_URL}/form/${formCode}`,
        portal_url: `${APP_URL}/portal/${workspaceSlug}`,
        admin_url: `${APP_URL}/admin/clients/${client.id}`
      },
      whatsapp_message: generateWhatsAppMessage(
        data.customer_name,
        `${APP_URL}/form/${formCode}`
      )
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - List bookings with filters
export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'read');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabase();
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:clients(id, client_code, full_name, email, phone, status),
        form:client_forms(id, code, status)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (date) {
      query = query.eq('booking_date', date);
    }
    
    if (search) {
      // Sanitize search input to prevent injection
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      query = query.or(`customer_name.ilike.%${sanitizedSearch}%,customer_email.ilike.%${sanitizedSearch}%,booking_code.ilike.%${sanitizedSearch}%`);
    }
    
    const { data: bookings, error } = await query;
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar agendamentos' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      bookings,
      page,
      limit,
      hasMore: bookings?.length === limit
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Update booking status
export async function PUT(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    
    // Debug log
    console.log('PUT bookings-unified received:', { booking_id: body.booking_id, status: body.status });
    
    // Validate input
    const validation = bookingUpdateSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', validation.error.issues);
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { booking_id, status, notes } = validation.data;
    
    if (!booking_id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      );
    }
    
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes) updateData.notes = notes;
    
    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id);
    
    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar agendamento', details: error.message },
        { status: 500 }
      );
    }
    
    // Create timeline event (fire and forget)
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, client:clients(id)')
      .eq('id', booking_id)
      .single();
    
    if (booking?.client_id) {
      // Fire and forget timeline event
      void (async () => {
        try {
          await supabase.rpc('create_timeline_event', {
            p_client_id: booking.client_id,
            p_event_type: 'status_changed',
            p_title: 'Status atualizado',
            p_description: `Status do agendamento alterado para: ${status}`,
            p_actor_name: 'Admin',
            p_actor_type: 'admin'
          });
        } catch {}
      })();
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}