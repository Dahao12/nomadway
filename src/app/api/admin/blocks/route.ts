import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

// Auth check
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

// GET /api/admin/blocks - List blocked slots
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('blocked_slots')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ blocks: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ blocks: data || [] });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ blocks: [] });
  }
}

// POST /api/admin/blocks - Create blocked slot
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { startDate, endDate, startTime, endTime, reason } = body;

    if (!startDate) {
      return NextResponse.json({ error: 'Data de início é obrigatória' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('blocked_slots')
      .insert({
        start_date: startDate,
        end_date: endDate || startDate,
        start_time: startTime || null,
        end_time: endTime || null,
        reason: reason || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return mock success
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          block: {
            id: `mock-${Date.now()}`,
            start_date: startDate,
            end_date: endDate || startDate,
            start_time: startTime || null,
            end_time: endTime || null,
            reason: reason || null
          },
          note: 'Tabela não existe no banco. Execute o schema SQL.'
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, block: data });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json({ error: 'Erro ao criar bloqueio' }, { status: 500 });
  }
}

// DELETE /api/admin/blocks - Delete blocked slot
export async function DELETE(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json({ error: 'Erro ao excluir bloqueio' }, { status: 500 });
  }
}