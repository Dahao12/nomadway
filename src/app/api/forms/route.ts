import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Generate unique form code
function generateFormCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NW-FORM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate unique client code
async function generateClientCode(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data, error } = await supabase
    .from('clients')
    .select('client_code')
    .order('client_code', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 'NW-0001';
  }

  const lastCode = (data[0] as { client_code: string })?.client_code || 'NW-0000';
  const match = lastCode.match(/NW-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `NW-${nextNum.toString().padStart(4, '0')}`;
  }
  return 'NW-0001';
}

// POST - Create a new form link
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    
    // Generate unique form code
    let formCode = generateFormCode();
    let attempts = 0;
    
    // Ensure uniqueness
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('client_forms')
        .select('code')
        .eq('code', formCode)
        .single();
      
      if (!existing) break;
      formCode = generateFormCode();
      attempts++;
    }

    // Create form entry - include placeholder for NOT NULL columns
    const { data: form, error } = await supabase
      .from('client_forms')
      .insert({
        code: formCode,
        status: 'pending',
        full_name: 'Formulário Pendente',
        email: null,
        admin_notes: body.admin_notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return NextResponse.json(
        { error: 'Erro ao criar formulário', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        code: form.code,
        status: form.status,
        created_at: form.created_at
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - List all forms (for admin)
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const code = searchParams.get('code');
    
    let query = supabase
      .from('client_forms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (code) {
      query = query.eq('code', code);
    }
    
    const { data: forms, error } = await query;
    
    if (error) {
      console.error('Error fetching forms:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar formulários' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ forms });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Update form status
export async function PATCH(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    const { code, status, client_id } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Código do formulário é obrigatório' },
        { status: 400 }
      );
    }
    
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (client_id) updateData.client_id = client_id;
    
    const { error } = await supabase
      .from('client_forms')
      .update(updateData)
      .eq('code', code.toUpperCase());
    
    if (error) {
      console.error('Error updating form:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar formulário' },
        { status: 500 }
      );
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

// DELETE - Delete form permanently
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    const { code, id } = body;
    
    if (!code && !id) {
      return NextResponse.json(
        { error: 'Código ou ID do formulário é obrigatório' },
        { status: 400 }
      );
    }
    
    const query = code 
      ? supabase.from('client_forms').delete().eq('code', code.toUpperCase())
      : supabase.from('client_forms').delete().eq('id', id);
    
    const { error } = await query;
    
    if (error) {
      console.error('Error deleting form:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar formulário' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Formulário deletado' });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}