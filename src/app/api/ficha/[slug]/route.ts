import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// GET - Load client data for ficha
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = getSupabase();
    const { slug } = await params;

    // Buscar cliente pelo workspace_slug
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, visa_type, workspace_slug')
      .eq('workspace_slug', slug)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { error: 'Link inválido ou expirado' },
        { status: 404 }
      );
    }

    // Verificar se já existe ficha para este cliente
    const { data: existingForm } = await supabase
      .from('client_forms')
      .select('*')
      .eq('client_id', client.id)
      .single();

    if (existingForm) {
      // Retornar dados existentes
      return NextResponse.json({
        client_name: client.name,
        full_name: existingForm.full_name,
        email: existingForm.email,
        phone: existingForm.phone,
        visa_type: existingForm.visa_type,
        form_exists: true,
        form: existingForm
      });
    }

    return NextResponse.json({
      client_name: client.name,
      full_name: client.name,
      email: client.email,
      phone: client.phone,
      visa_type: client.visa_type || 'digital_nomad',
      form_exists: false
    });

  } catch (error) {
    console.error('Error loading ficha:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados' },
      { status: 500 }
    );
  }
}

// POST - Save ficha
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = getSupabase();
    const { slug } = await params;
    const data = await request.json();

    // Buscar cliente pelo workspace_slug
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('workspace_slug', slug)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Link inválido ou expirado' },
        { status: 404 }
      );
    }

    // Verificar se já existe ficha
    const { data: existingForm } = await supabase
      .from('client_forms')
      .select('id')
      .eq('client_id', client.id)
      .single();

    let result;
    
    if (existingForm) {
      // Atualizar ficha existente
      const { error: updateError } = await supabase
        .from('client_forms')
        .update({
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
          
          status: 'completed'
        })
        .eq('id', existingForm.id);

      if (updateError) {
        console.error('Error updating form:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar ficha' },
          { status: 500 }
        );
      }
    } else {
      // Criar nova ficha
      const { error: insertError } = await supabase
        .from('client_forms')
        .insert({
          client_id: client.id,
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
          
          status: 'completed'
        });

      if (insertError) {
        console.error('Error creating form:', insertError);
        return NextResponse.json(
          { error: 'Erro ao salvar ficha' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Ficha salva com sucesso!' 
    });

  } catch (error) {
    console.error('Error saving ficha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}