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

// GET /api/finance/categories - List categories
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let query = supabase
      .from('finance_categories')
      .select('*')
      .order('name');

    if (type) query = query.eq('type', type);

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, return default categories
      if (error.code === '42P01') {
        const defaultCategories = [
          { id: '1', name: 'Visto Digital Nomad', type: 'income', emoji: '🛂', color: '#10B981' },
          { id: '2', name: 'Consulta', type: 'income', emoji: '💬', color: '#3B82F6' },
          { id: '3', name: 'Pacote Completo', type: 'income', emoji: '📦', color: '#8B5CF6' },
          { id: '4', name: 'Serviço Extra', type: 'income', emoji: '⚡', color: '#F59E0B' },
          { id: '5', name: 'Outros', type: 'income', emoji: '💰', color: '#6B7280' },
          { id: '6', name: 'Marketing', type: 'expense', emoji: '📢', color: '#EF4444' },
          { id: '7', name: 'Software', type: 'expense', emoji: '💻', color: '#3B82F6' },
          { id: '8', name: 'Impostos', type: 'expense', emoji: '📄', color: '#F59E0B' },
          { id: '9', name: 'Viagens', type: 'expense', emoji: '✈️', color: '#EC4899' },
          { id: '10', name: 'Escritório', type: 'expense', emoji: '🏢', color: '#6B7280' },
          { id: '11', name: 'Pessoal', type: 'expense', emoji: '👤', color: '#8B5CF6' },
          { id: '12', name: 'Outros', type: 'expense', emoji: '💸', color: '#94A3B8' },
        ];
        return NextResponse.json({ categories: defaultCategories.filter(c => !type || c.type === type) });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] });
  }
}