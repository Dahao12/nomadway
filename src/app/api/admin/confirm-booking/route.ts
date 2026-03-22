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

// POST - Confirm booking and create client automatically
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { booking_code } = body;

    if (!booking_code) {
      return NextResponse.json({ error: 'booking_code é obrigatório' }, { status: 400 });
    }

    // Buscar o booking primeiro para verificar se tem partner_code
    const bookingRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?booking_code=eq.${booking_code}&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    const bookings = await bookingRes.json();
    const booking = bookings?.[0];

    // Call Supabase function to confirm booking and create client
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_confirm_booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ p_booking_code: booking_code }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Error confirming booking:', data);
      return NextResponse.json(
        { error: data.message || 'Erro ao confirmar agendamento' },
        { status: 500 }
      );
    }

    // Parse result (Supabase returns an array from functions)
    const result = Array.isArray(data) ? data[0] : data;

    // Se o booking tem partner_code, criar comissão automaticamente
    if (booking?.partner_code) {
      try {
        // Buscar parceiro
        const partnerRes = await fetch(`${SUPABASE_URL}/rest/v1/partners?code=eq.${booking.partner_code}&status=eq.active&select=*`, {
          headers: {
            'apikey': SUPABASE_KEY!,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        });
        const partners = await partnerRes.json();
        const partner = partners?.[0];

        if (partner) {
          // Calcular comissão (€100 para 1-9 clientes, €150 para 10+)
          const commissionAmount = partner.total_clients < 9 ? 10000 : 15000; // em centavos

          // Criar comissão
          await fetch(`${SUPABASE_URL}/rest/v1/commissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              partner_id: partner.id,
              booking_id: booking.id,
              client_name: booking.customer_name,
              client_email: booking.customer_email,
              service_type: booking.service_name,
              amount_cents: commissionAmount,
              status: 'pending',
              source: booking.referral_source || 'referral_link',
            }),
          });

          console.log(`✅ Comissão criada para parceiro ${partner.code}: €${commissionAmount / 100}`);

          // Atualizar total de clientes e ganhos do parceiro
          await fetch(`${SUPABASE_URL}/rest/v1/partners?id=eq.${partner.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              total_clients: partner.total_clients + 1,
              total_earnings_cents: partner.total_earnings_cents + commissionAmount,
            }),
          });

          // Atualizar lead para "converted"
          await fetch(`${SUPABASE_URL}/rest/v1/partner_leads?partner_id=eq.${partner.id}&booking_id=eq.${booking.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY!,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              status: 'converted',
              converted_to_client: true,
            }),
          });
        }
      } catch (err) {
        console.error('Erro ao criar comissão:', err);
        // Não falha a confirmação se a comissão falhar
      }
    }

    return NextResponse.json({
      success: true,
      client_id: result.client_id,
      client_code: result.client_code,
      form_code: result.form_code,
      form_url: result.form_url,
      message: 'Agendamento confirmado e cliente criado!'
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar agendamento' },
      { status: 500 }
    );
  }
}