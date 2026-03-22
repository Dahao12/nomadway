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
  pais_residencia: 'country',
  profissao: 'profession',
  empresa: 'company_name',
  renda_mensal: 'monthly_income_range',
  vinculo_estrangeiro: 'has_foreign_link',
  freelancer_pj: 'is_freelancer',
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
      .select(`
        *,
        booking:bookings(
          id,
          booking_code,
          service_name,
          service_price,
          booking_date,
          booking_time
        )
      `)
      .eq('code', code.toUpperCase())
      .single();
    
    if (error || !form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado', exists: false },
        { status: 404 }
      );
    }
    
    // Return public-safe data
    return NextResponse.json({
      exists: true,
      form: {
        code: form.code,
        status: form.status,
        created_at: form.created_at,
        // Pre-fill from booking if available
        booking: form.booking
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

// POST - Submit form data (UNIFIED - auto-updates client)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = getSupabase();
  const { code } = await params;
  
  try {
    // Verify form exists
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
    const formData: Record<string, any> = {
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
      country: body.pais_residencia || 'Brasil',
      profession: body.profissao || null,
      company_name: body.empresa || null,
      monthly_income_range: body.renda_mensal || null,
      has_foreign_link: body.vinculo_estrangeiro || false,
      is_freelancer: body.freelancer_pj || false,
      visa_type: body.servico || 'digital_nomad',
      service_value: body.valor || null,
      payment_method: body.forma_pagamento || 'pix',
      notes: body.observacoes || null,
      status: 'completed',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Remove null values
    Object.keys(formData).forEach(key => {
      if (formData[key] === null || formData[key] === undefined) {
        delete formData[key];
      }
    });
    
    // Update the form
    const { error: updateError } = await supabase
      .from('client_forms')
      .update(formData)
      .eq('code', code.toUpperCase());
    
    if (updateError) {
      console.error('Error updating form:', updateError);
      return NextResponse.json(
        { error: 'Erro ao salvar formulário: ' + updateError.message },
        { status: 500 }
      );
    }
    
    // Find or create client
    let clientId: string | null = existingForm.client_id;
    
    // If form has a booking with client, update that client
    if (existingForm.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('client_id')
        .eq('id', existingForm.booking_id)
        .single();
      
      if (booking?.client_id) {
        clientId = booking.client_id;
        
        // Update client with form data
        await supabase
          .from('clients')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            rg: formData.rg,
            passport_number: formData.passport_number,
            passport_expiry_date: formData.passport_expiry_date,
            nationality: formData.nationality,
            birth_date: formData.birth_date,
            country: formData.country,
            profession: formData.profession,
            company_name: formData.company_name,
            monthly_income_range: formData.monthly_income_range,
            has_foreign_link: formData.has_foreign_link,
            is_freelancer: formData.is_freelancer,
            visa_type: formData.visa_type,
            service_value: formData.service_value ? parseFloat(formData.service_value) : 1499.90,
            payment_method: formData.payment_method,
            notes: formData.notes,
            status: 'documentation', // Move to documentation stage
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);
        
        // Link form to client
        await supabase
          .from('client_forms')
          .update({ client_id: clientId })
          .eq('code', code.toUpperCase());
        
        // Update booking status
        await supabase
          .from('bookings')
          .update({ 
            status: 'form_sent',
            form_sent_at: new Date().toISOString() 
          })
          .eq('id', existingForm.booking_id);
      }
    }
    
    // If no client yet, create one
    if (!clientId) {
      // Generate client code
      const { data: lastClient } = await supabase
        .from('clients')
        .select('client_code')
        .order('client_code', { ascending: false })
        .limit(1)
        .single();
      
      let clientCode = 'NW-0001';
      if (lastClient?.client_code) {
        const match = lastClient.client_code.match(/NW-(\d+)/);
        if (match) {
          clientCode = `NW-${(parseInt(match[1]) + 1).toString().padStart(4, '0')}`;
        }
      }
      
      // Generate workspace slug
      const baseSlug = formData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20);
      const suffix = Math.random().toString(36).substring(2, 6);
      const workspaceSlug = `${baseSlug}-${suffix}`;
      
      // Create client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          client_code: clientCode,
          workspace_slug: workspaceSlug,
          source_form_id: existingForm.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          rg: formData.rg,
          passport_number: formData.passport_number,
          passport_expiry_date: formData.passport_expiry_date,
          nationality: formData.nationality,
          birth_date: formData.birth_date,
          country: formData.country,
          profession: formData.profession,
          company_name: formData.company_name,
          monthly_income_range: formData.monthly_income_range,
          has_foreign_link: formData.has_foreign_link,
          is_freelancer: formData.is_freelancer,
          visa_type: formData.visa_type,
          service_value: formData.service_value ? parseFloat(formData.service_value) : 1499.90,
          payment_method: formData.payment_method,
          notes: formData.notes,
          status: 'documentation'
        })
        .select()
        .single();
      
      if (!clientError && newClient) {
        clientId = newClient.id;
        
        // Link form to client
        await supabase
          .from('client_forms')
          .update({ 
            client_id: clientId,
            processed_at: new Date().toISOString(),
            status: 'processed'
          })
          .eq('code', code.toUpperCase());
      }
    }
    
    // Create timeline event
    if (clientId) {
      await supabase.rpc('create_timeline_event', {
        p_client_id: clientId,
        p_event_type: 'form_completed',
        p_title: 'Formulário preenchido',
        p_description: 'Cliente completou o formulário de dados pessoais',
        p_actor_name: formData.full_name,
        p_actor_type: 'client'
      });
      
      // Create notification for admin
      await supabase.rpc('create_notification', {
        p_recipient_type: 'admin',
        p_type: 'form_completed',
        p_title: 'Formulário preenchido',
        p_message: `${formData.full_name} completou o formulário de dados`,
        p_client_id: clientId,
        p_form_id: existingForm.id
      });
    }
    
    // WhatsApp notification to admin (via webhook)
    try {
      const WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL;
      if (WEBHOOK_URL && clientId) {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'form_completed',
            client_id: clientId,
            form_code: code.toUpperCase(),
            client_name: formData.full_name,
            client_email: formData.email,
            client_phone: formData.phone
          })
        });
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Formulário enviado com sucesso!',
      formCode: code.toUpperCase(),
      clientId: clientId
    });
    
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { error: 'Erro ao processar formulário' },
      { status: 500 }
    );
  }
}