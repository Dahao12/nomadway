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

// GET - Get leads ready to be archived (cold for more than 7 days)
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    // Fetch cold leads with cold_since older than 7 days
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?lead_temperature=eq.cold&cold_since=lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&status=neq.archived&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase error:', errorText);
      return NextResponse.json({ error: 'Erro ao buscar leads frios' }, { status: 500 });
    }

    const leads = await res.json();
    
    // Calculate days cold for each lead
    const leadsWithDays = leads.map((lead: any) => ({
      ...lead,
      days_cold: Math.floor((Date.now() - new Date(lead.cold_since).getTime()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({ 
      count: leadsWithDays.length,
      leads: leadsWithDays 
    });
  } catch (error) {
    console.error('Error fetching cold leads:', error);
    return NextResponse.json({ error: 'Erro ao buscar leads frios' }, { status: 500 });
  }
}

// POST - Archive cold leads older than 7 days
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { dry_run = false } = body;

    // 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    if (dry_run) {
      // Just return what would be archived
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/bookings?lead_temperature=eq.cold&cold_since=lt.${sevenDaysAgo}&status=neq.archived&select=id,booking_code,customer_name,cold_since`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const leads = await res.json();
      return NextResponse.json({ 
        dry_run: true,
        would_archive: leads.length,
        leads 
      });
    }

    // Archive: update status to 'archived' and set archived_at
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?lead_temperature=eq.cold&cold_since=lt.${sevenDaysAgo}&status=neq.archived`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archive_reason: 'cold_7_days'
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase error:', errorText);
      return NextResponse.json({ error: 'Erro ao arquivar leads' }, { status: 500 });
    }

    const archived = await res.json();

    return NextResponse.json({
      success: true,
      archived_count: archived.length,
      archived_leads: archived.map((l: any) => ({
        id: l.id,
        booking_code: l.booking_code,
        customer_name: l.customer_name
      }))
    });
  } catch (error) {
    console.error('Error archiving leads:', error);
    return NextResponse.json({ error: 'Erro ao arquivar leads' }, { status: 500 });
  }
}