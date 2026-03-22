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

// GET - Fetch client portal data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = getSupabase();
  const { slug } = await params;
  
  try {
    // Find client by workspace slug
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, client_code, full_name, email, visa_type, status, workspace_slug')
      .eq('workspace_slug', slug)
      .single();
    
    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    
    // Fetch stages
    const { data: stages } = await supabase
      .from('process_stages')
      .select('*')
      .eq('client_id', client.id)
      .order('stage_order', { ascending: true });
    
    // Fetch documents
    const { data: documents } = await supabase
      .from('documents')
      .select('id, name, type, category, status, file_url, file_name, uploaded_at, rejection_reason')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true });
    
    // Fetch messages (last 50)
    const { data: messages } = await supabase
      .from('messages')
      .select('id, sender_type, sender_name, message, created_at')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    // Calculate progress
    const totalStages = stages?.length || 6;
    const completedStages = stages?.filter(s => s.status === 'completed').length || 0;
    const progress = Math.round((completedStages / totalStages) * 100);
    
    // Mark messages as read by client
    await supabase
      .from('messages')
      .update({ read_by_client: true })
      .eq('client_id', client.id)
      .eq('read_by_client', false);
    
    return NextResponse.json({
      client,
      stages: stages || [],
      documents: documents || [],
      messages: messages || [],
      progress
    });
    
  } catch (error) {
    console.error('Error fetching portal data:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados' },
      { status: 500 }
    );
  }
}