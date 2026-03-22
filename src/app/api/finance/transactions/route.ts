import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

// Currency exchange rates (how many X per 1 EUR)
// To convert FROM currency TO EUR: divide by rate
const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1,      // 1 EUR = 1 EUR
  USD: 1.08,   // 1 EUR = 1.08 USD
  BRL: 5.35,   // 1 EUR = 5.35 BRL
  GBP: 0.85,   // 1 EUR = 0.85 GBP
};

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

// GET /api/finance/transactions - List transactions
export async function GET(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const type = searchParams.get('type');

  try {
    // Simple query without joins (more robust)
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (start) query = query.gte('transaction_date', start);
    if (end) query = query.lte('transaction_date', end);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ transactions: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: data || [] });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ transactions: [] });
  }
}

// POST /api/finance/transactions - Create transaction
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    const body = await request.json();
    const {
      type,
      amount,
      currency = 'EUR',
      description,
      category_id,
      client_id,
      transaction_date,
      payment_method,
      notes,
    } = body;

    // Validate
    if (!type || !amount || !description || !transaction_date) {
      return NextResponse.json(
        { error: 'Tipo, valor, descrição e data são obrigatórios' },
        { status: 400 }
      );
    }

    // Calculate EUR amount (divide by rate to convert to EUR)
    const rate = EXCHANGE_RATES[currency] || 1;
    const amount_eur = parseFloat(amount) / rate;

    // Get category ID if category_id is a name
    let finalCategoryId = category_id;
    if (category_id && !category_id.match(/^[0-9a-f-]{36}$/i)) {
      // It's a category name, find or create
      const { data: existingCat } = await supabase
        .from('finance_categories')
        .select('id')
        .eq('name', category_id)
        .eq('type', type)
        .single();

      if (existingCat) {
        finalCategoryId = existingCat.id;
      } else {
        // Create category
        const { data: newCat } = await supabase
          .from('finance_categories')
          .insert({
            name: category_id,
            type,
            emoji: type === 'income' ? '💰' : '💸',
          })
          .select('id')
          .single();
        finalCategoryId = newCat?.id;
      }
    }

    // Try to insert with amount_eur, fallback without it
    let insertData: Record<string, unknown> = {
      type,
      amount: parseFloat(amount),
      currency,
      description,
      category_id: finalCategoryId || null,
      client_id: client_id || null,
      transaction_date,
      payment_method: payment_method || null,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try with amount_eur first
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        ...insertData,
        amount_eur,
      })
      .select()
      .single();

    if (error) {
      // If amount_eur column doesn't exist, try without it
      if (error.code === '42703' || error.message?.includes('amount_eur')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('finance_transactions')
          .insert(insertData)
          .select()
          .single();

        if (fallbackError) {
          if (fallbackError.code === '42P01') {
            return NextResponse.json({
              success: true,
              transaction: {
                id: `mock-${Date.now()}`,
                type,
                amount: parseFloat(amount),
                currency,
                amount_eur,
                description,
                transaction_date,
              },
              note: 'Tabela não existe. Execute o schema SQL no Supabase.',
            });
          }
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, transaction: fallbackData });
      }

      // If table doesn't exist, return mock success
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          transaction: {
            id: `mock-${Date.now()}`,
            type,
            amount: parseFloat(amount),
            currency,
            amount_eur,
            description,
            transaction_date,
          },
          note: 'Tabela não existe no banco. Execute o schema SQL primeiro.',
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Erro ao criar transação' }, { status: 500 });
  }
}

// DELETE /api/finance/transactions - Delete transaction
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
      .from('finance_transactions')
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
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Erro ao excluir transação' }, { status: 500 });
  }
}