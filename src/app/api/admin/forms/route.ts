import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const data = await request.json();
    
    // Validar campos obrigatórios
    if (!data.full_name || !data.email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Inserir na tabela client_forms
    const { data: form, error } = await supabase
      .from('client_forms')
      .insert({
        full_name: data.full_name,
        birth_date: data.birth_date || null,
        nationality: data.nationality || 'Brasileira',
        marital_status: data.marital_status || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        email: data.email,
        phone: data.phone || null,
        
        passport_number: data.passport_number || null,
        passport_issue_date: data.passport_issue_date || null,
        passport_expiry_date: data.passport_expiry_date || null,
        passport_country: data.passport_country || 'Brasil',
        
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || 'Brasil',
        
        profession: data.profession || null,
        work_type: data.work_type || null,
        company_name: data.company_name || null,
        cnpj: data.cnpj || null,
        work_area: data.work_area || null,
        experience_years: data.experience_years || null,
        monthly_income_range: data.monthly_income_range || null,
        linkedin_url: data.linkedin_url || null,
        
        client1_name: data.client1_name || null,
        client1_value: data.client1_value || null,
        client2_name: data.client2_name || null,
        client2_value: data.client2_value || null,
        client3_name: data.client3_name || null,
        client3_value: data.client3_value || null,
        
        visa_type: data.visa_type || 'digital_nomad',
        destination_city: data.destination_city || null,
        planned_move_date: data.planned_move_date || null,
        has_previous_visa: data.has_previous_visa || false,
        
        has_passport: data.has_passport || false,
        has_cpf: data.has_cpf || false,
        has_rg: data.has_rg || false,
        has_marriage_cert: data.has_marriage_cert || false,
        has_birth_cert: data.has_birth_cert || false,
        has_income_proof: data.has_income_proof || false,
        has_work_contract: data.has_work_contract || false,
        has_resume: data.has_resume || false,
        has_diploma: data.has_diploma || false,
        has_health_insurance: data.has_health_insurance || false,
        has_criminal_record: data.has_criminal_record || false,
        has_address_proof: data.has_address_proof || false,
        
        notes: data.notes || null,
        source: data.source || null,
        companions: data.companions || [],
        
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving form:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar ficha', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      formId: form.id,
      message: 'Ficha cadastrada com sucesso!' 
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');
    const email = searchParams.get('email');

    let query = supabase.from('client_forms').select('*');

    if (formId) {
      query = query.eq('id', formId);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      query = query.order('created_at', { ascending: false }).limit(50);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching forms:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar fichas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ forms: data });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}