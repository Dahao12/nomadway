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

// Map form fields to database columns
const FIELD_MAP: Record<string, string> = {
  nome: 'full_name',
  data_nascimento: 'birth_date',
  nacionalidade: 'nationality',
  estado_civil: 'marital_status',
  cpf: 'cpf',
  rg: 'rg',
  passaporte: 'passport_number',
  passaporte_validade: 'passport_expiry_date',
  whatsapp: 'phone',
  email: 'email',
  instagram: 'instagram',
  pais_residencia: 'country',
  profissao: 'profession',
  empresa: 'company_name',
  renda_mensal: 'monthly_income_range',
  vinculo_estrangeiro: 'has_foreign_link',
  freelancer_pj: 'is_freelancer',
  grau_parentesco: 'family_relationship',
  nome_parente: 'family_member_name',
  servico: 'visa_type',
  valor: 'service_value',
  forma_pagamento: 'payment_method',
  observacoes: 'notes'
};

// GET - Retrieve form by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = getSupabase();
  const { code } = await params;
  
  try {
    const { data: form, error } = await supabase
      .from('client_forms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error || !form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado', exists: false },
        { status: 404 }
      );
    }
    
    // Return public-safe data (no sensitive admin notes)
    return NextResponse.json({
      exists: true,
      form: {
        code: form.code,
        status: form.status,
        created_at: form.created_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formulário' },
      { status: 500 }
    );
  }
}

// POST - Submit form data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = getSupabase();
  const { code } = await params;
  
  try {
    // Verify form exists and is pending
    const { data: existingForm, error: fetchError } = await supabase
      .from('client_forms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (fetchError || !existingForm) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }
    
    if (existingForm.status === 'completed') {
      return NextResponse.json(
        { error: 'Este formulário já foi enviado' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.nome || !body.email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Map form fields to database columns
    const dbData: Record<string, any> = {
      // Map all fields
      full_name: body.nome,
      birth_date: body.data_nascimento || null,
      nationality: body.nacionalidade || 'Brasileira',
      marital_status: body.estado_civil || null,
      cpf: body.cpf || null,
      rg: body.rg || null,
      passport_number: body.passaporte || null,
      passport_expiry_date: body.passaporte_validade || null,
      email: body.email,
      phone: body.whatsapp || null,
      instagram: body.instagram || null,
      country: body.pais_residencia || 'Brasil',
      profession: body.profissao || null,
      company_name: body.empresa || null,
      monthly_income_range: body.renda_mensal || null,
      has_foreign_link: body.vinculo_estrangeiro || false,
      is_freelancer: body.freelancer_pj || false,
      family_relationship: body.grau_parentesco || null,
      family_member_name: body.nome_parente || null,
      visa_type: body.servico || 'digital_nomad',
      service_value: body.valor || null,
      payment_method: body.forma_pagamento || null,
      notes: body.observacoes || null,
      
      // Status update
      status: 'completed',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Remove null values to avoid overwriting existing data
    Object.keys(dbData).forEach(key => {
      if (dbData[key] === null || dbData[key] === undefined) {
        delete dbData[key];
      }
    });
    
    // Update the form
    const { error: updateError } = await supabase
      .from('client_forms')
      .update(dbData)
      .eq('code', code.toUpperCase());
    
    if (updateError) {
      console.error('Error updating form:', updateError);
      return NextResponse.json(
        { error: 'Erro ao salvar formulário: ' + updateError.message },
        { status: 500 }
      );
    }
    
    // Send notification to admin (optional webhook)
    try {
      const WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL;
      if (WEBHOOK_URL) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'form_submitted',
            code: code.toUpperCase(),
            client_name: body.nome,
            client_email: body.email,
            submitted_at: new Date().toISOString()
          })
        });
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Don't fail the request if webhook fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Formulário enviado com sucesso!',
      formCode: code.toUpperCase()
    });
    
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Erro ao processar formulário' },
      { status: 500 }
    );
  }
}