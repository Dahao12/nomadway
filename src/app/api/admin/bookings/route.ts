import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const NOMADWAY_API = 'https://nomadway-api.vercel.app';

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

// GET - List bookings
export async function GET(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  
  try {
    // Build Supabase query directly
    let query = `${SUPABASE_URL}/rest/v1/bookings?select=*`;
    
    if (status && status !== 'all') {
      query += `&status=eq.${status}`;
    } else {
      // Exclude archived from default view (only show if explicitly requested)
      query += `&status=neq.archived`;
    }
    
    if (date) {
      query += `&booking_date=eq.${date}`;
    }
    
    query += `&order=created_at.desc`;
    
    const res = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    const data = await res.json();
    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Erro ao carregar agendamentos' }, { status: 500 });
  }
}

// PUT - Update booking status or temperature
export async function PUT(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { bookingCode, booking_id, status, lead_temperature } = body;
    
    // Build update object
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (lead_temperature) updateData.lead_temperature = lead_temperature;
    
    // Track cold_since when temperature changes to cold
    if (lead_temperature === 'cold') {
      updateData.cold_since = new Date().toISOString();
    } else if (lead_temperature && lead_temperature !== 'cold') {
      // Clear cold_since when temperature changes away from cold
      updateData.cold_since = null;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }
    
    // Determine query - prefer id, fallback to booking_code
    let query = '';
    if (booking_id) {
      query = `id=eq.${booking_id}`;
    } else if (bookingCode) {
      query = `booking_code=eq.${bookingCode}`;
    } else {
      return NextResponse.json({ error: 'booking_id ou booking_code é obrigatório' }, { status: 400 });
    }
    
    // Update directly in Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?${query}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase error:', errorText);
      return NextResponse.json({ error: 'Erro ao atualizar', details: errorText }, { status: 500 });
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

// DELETE - Delete booking permanently
export async function DELETE(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, booking_code } = body;
    
    if (!id && !booking_code) {
      return NextResponse.json({ error: 'id ou booking_code é obrigatório' }, { status: 400 });
    }
    
    // Delete from Supabase
    const query = id ? `id=eq.${id}` : `booking_code=eq.${booking_code}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?${query}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete booking');
    }
    
    return NextResponse.json({ success: true, message: 'Agendamento deletado' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Erro ao deletar agendamento' }, { status: 500 });
  }
}