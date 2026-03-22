import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Fetch client by workspace_slug
    const clientRes = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?workspace_slug=eq.${slug}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    const clients = await clientRes.json();
    
    if (!clients || clients.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    
    const client = clients[0];
    
    // Fetch stages
    const stagesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/process_stages?client_id=eq.${client.id}&select=*&order=stage_order.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const stages = await stagesRes.json();
    
    // Fetch documents
    const docsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?client_id=eq.${client.id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const documents = await docsRes.json();
    
    // Fetch messages from stage_messages
    const messagesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/stage_messages?client_id=eq.${client.id}&select=*&order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const messages = await messagesRes.json();
    
    // Calculate progress
    const totalStages = stages.length || 1;
    const completedStages = stages.filter((s: any) => s.status === 'completed').length;
    const progress = Math.round((completedStages / totalStages) * 100);
    
    return NextResponse.json({
      client,
      stages: stages || [],
      documents: documents || [],
      messages: messages || [],
      progress,
    });
    
  } catch (error) {
    console.error('Portal API error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 });
  }
}