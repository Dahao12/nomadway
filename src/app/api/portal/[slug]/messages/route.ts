import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { message, sender_type, sender_name, client_id, stage_id } = body;
    
    if (!message || !client_id) {
      return NextResponse.json({ error: 'Mensagem e client_id são obrigatórios' }, { status: 400 });
    }
    
    // Insert message
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stage_messages`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        client_id,
        stage_id: stage_id || null,
        sender_type: sender_type || 'client',
        sender_name: sender_name || 'Cliente',
        message,
        created_at: new Date().toISOString(),
      }),
    });
    
    if (!res.ok) {
      throw new Error('Failed to send message');
    }
    
    const data = await res.json();
    return NextResponse.json({ success: true, message: data[0] });
    
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}