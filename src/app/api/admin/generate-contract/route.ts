import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

// GET - Get booking data for contract generation
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const bookingCode = searchParams.get('booking_code');

  if (!bookingCode) {
    return NextResponse.json({ error: 'booking_code é obrigatório' }, { status: 400 });
  }

  try {
    // Fetch booking
    const bookingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?booking_code=eq.${bookingCode}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const bookings = await bookingRes.json();
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'Booking não encontrado' }, { status: 404 });
    }

    const booking = bookings[0];

    // Calculate values with discount
    const originalCents = booking.price_cents || 0;
    const discountPercent = booking.discount_percent;
    const discountValue = booking.discount_value;

    let discountCents = 0;
    if (discountPercent) {
      discountCents = Math.round(originalCents * (discountPercent / 100));
    } else if (discountValue) {
      discountCents = discountValue;
    }

    const finalCents = Math.max(0, originalCents - discountCents);

    // Try to fetch client form for more data
    let clientForm = null;
    try {
      const formRes = await fetch(
        `${SUPABASE_URL}/rest/v1/client_forms?booking_code=eq.${bookingCode}&select=*&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const forms = await formRes.json();
      if (forms && forms.length > 0) {
        clientForm = forms[0];
      }
    } catch (e) {
      // Ignore form fetch errors
    }

    // Response with complete client data
    return NextResponse.json({
      booking: {
        code: booking.booking_code,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        service_name: booking.service_name,
        status: booking.status,
        lead_temperature: booking.lead_temperature,
        created_at: booking.created_at,
      },
      client: clientForm ? {
        // Dados pessoais
        full_name: clientForm.full_name,
        email: clientForm.email,
        phone: clientForm.phone,
        nationality: clientForm.nationality,
        birth_date: clientForm.birth_date,
        cpf: clientForm.cpf,
        rg: clientForm.rg,
        
        // Passaporte
        passport_number: clientForm.passport_number,
        passport_expiry_date: clientForm.passport_expiry_date,
        
        // Endereço completo
        address: clientForm.address,
        city: clientForm.city,
        state: clientForm.state,
        country: clientForm.country,
        postal_code: clientForm.postal_code,
      } : null,
      values: {
        original_cents: originalCents,
        original_eur: originalCents / 100,
        discount_cents: discountCents,
        discount_eur: discountCents / 100,
        discount_percent: discountPercent || null,
        final_cents: finalCents,
        final_eur: finalCents / 100,
      },
      contract_data: {
        client_name: clientForm?.full_name || booking.customer_name,
        service: booking.service_name,
        value_total: finalCents / 100,
        currency: 'EUR',
        date: new Date().toLocaleDateString('pt-BR'),
        booking_code: booking.booking_code,
      }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

// POST - Generate contract PDF
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { booking_code, template = 'contrato-nomadway-final.html' } = body;

    if (!booking_code) {
      return NextResponse.json({ error: 'booking_code é obrigatório' }, { status: 400 });
    }

    // Fetch booking data (reuse GET logic)
    const bookingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?booking_code=eq.${booking_code}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY!,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const bookings = await bookingRes.json();
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'Booking não encontrado' }, { status: 404 });
    }

    const booking = bookings[0];

    // Calculate values
    const originalCents = booking.price_cents || 0;
    const discountPercent = booking.discount_percent;
    const discountValue = booking.discount_value;

    let discountCents = 0;
    if (discountPercent) {
      discountCents = Math.round(originalCents * (discountPercent / 100));
    } else if (discountValue) {
      discountCents = discountValue;
    }

    const finalCents = Math.max(0, originalCents - discountCents);
    const finalEur = finalCents / 100;

    // Fetch client form
    let clientForm = null;
    try {
      const formRes = await fetch(
        `${SUPABASE_URL}/rest/v1/client_forms?booking_code=eq.${booking_code}&select=*&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const forms = await formRes.json();
      if (forms && forms.length > 0) {
        clientForm = forms[0];
      }
    } catch (e) {
      // Ignore
    }

    // Generate contract data
    const clientName = clientForm?.full_name || booking.customer_name;
    const safeName = clientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Return data for frontend to generate PDF
    // ALL fields from client_forms table mapped to contract fields
    return NextResponse.json({
      success: true,
      contract: {
        filename: `contrato-${safeName}.pdf`,
        template: template,
        data: {
          // Dados pessoais
          client_name: clientName,
          client_email: clientForm?.email || booking.customer_email || '',
          client_phone: clientForm?.phone || booking.customer_phone || '',
          client_nationality: clientForm?.nationality || 'Brasileira',
          client_birth_date: clientForm?.birth_date || '',
          client_cpf: clientForm?.cpf || '',
          client_rg: clientForm?.rg || '',
          
          // Passaporte
          client_passport: clientForm?.passport_number || '',
          client_passport_expiry: clientForm?.passport_expiry_date || '',
          
          // Endereço completo
          client_address: clientForm?.address || '',
          client_city: clientForm?.city || '',
          client_state: clientForm?.state || '',
          client_country: clientForm?.country || 'Brasil',
          client_cep: clientForm?.postal_code || '',
          
          // Serviço
          service_name: booking.service_name,
          value_original_eur: originalCents / 100,
          value_discount_eur: discountCents / 100,
          value_discount_percent: discountPercent || null,
          value_final_eur: finalEur,
          currency: 'EUR',
          booking_code: booking.booking_code,
          date: new Date().toLocaleDateString('pt-BR'),
          date_extenso: new Date().toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
        }
      }
    });

  } catch (error) {
    console.error('Error generating contract:', error);
    return NextResponse.json({ error: 'Erro ao gerar contrato' }, { status: 500 });
  }
}