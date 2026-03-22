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

// Input validation helpers
function sanitizeString(str: string | undefined, maxLength: number = 500): string {
  if (!str || typeof str !== 'string') return '';
  return str.substring(0, maxLength).replace(/[<>]/g, '').trim();
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Accept 10-15 digits (with or without country code)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  // If already has country code (starts with 55 and has 13 digits)
  if (cleaned.startsWith('55') && cleaned.length >= 12 && cleaned.length <= 13) {
    return '+' + cleaned;
  }
  // Brazilian mobile (11 digits = DDD + 9 digits)
  if (cleaned.length === 11) {
    return '+55' + cleaned;
  }
  // Brazilian landline (10 digits = DDD + 8 digits)
  if (cleaned.length === 10) {
    return '+55' + cleaned;
  }
  // International (already has country code)
  if (cleaned.length > 11) {
    return '+' + cleaned;
  }
  // Default to Brazilian
  return '+55' + cleaned;
}

export async function GET(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Parse pagination params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const offset = (page - 1) * limit;

  try {
    // Get total count first
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=count`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'count=exact',
        },
      }
    );
    
    const total = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0', 10);

    // Get paginated clients
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=*,process_stages(*)&order=created_at.desc&limit=${limit}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const clients = await res.json();
    return NextResponse.json({ 
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Erro ao carregar clientes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    // Validate and sanitize inputs
    const name = sanitizeString(body.name, 200);
    const email = sanitizeString(body.email, 100);
    const phone = sanitizeString(body.phone, 20);
    const visa_type = sanitizeString(body.visa_type, 50) || 'digital_nomad';
    const notes = sanitizeString(body.notes, 2000);

    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }
    if (email && !validateEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Telefone inválido. Deve ter entre 10 e 15 dígitos.' }, { status: 400 });
    }
    
    // Normalize phone to international format
    const normalizedPhone = normalizePhone(phone);

    // Generate unique client code using timestamp + random
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
    const random = Math.random().toString(36).toUpperCase().slice(2, 6);
    const client_code = `NW-${timestamp}${random}`;
    
    // Generate workspace slug
    const workspace_slug = body.workspace_slug || `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}-${Date.now().toString(36).slice(-4)}`;

    // Only send fields that EXIST in the current table
    // Essential fields only: id, client_code, workspace_slug, name, email, phone, visa_type, status, notes, created_at
    // Plus discount fields: discount_percent, discount_value, service_value
    const clientData: Record<string, any> = {
      client_code,
      name,
      email,
      phone: normalizedPhone,
      visa_type,
      notes,
      workspace_slug,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (body.service_value) clientData.service_value = body.service_value;
    if (body.discount_percent) clientData.discount_percent = body.discount_percent;
    if (body.discount_value) clientData.discount_value = body.discount_value;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(clientData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Supabase error:', errorText);
      return NextResponse.json({ 
        error: 'Erro ao criar cliente', 
        details: errorText 
      }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, client: data[0] });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ 
      error: 'Erro ao criar cliente', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, status } = body;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });

    if (!res.ok) {
      throw new Error('Failed to update client');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

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
    const { id, name, email, phone, visa_type, status, notes } = body;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        visa_type,
        status,
        notes,
        updated_at: new Date().toISOString()
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to update client');
    }

    const data = await res.json();
    return NextResponse.json({ success: true, client: data[0] });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to delete client');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
}