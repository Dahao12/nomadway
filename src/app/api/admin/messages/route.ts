import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, message, sender_type, sender_name } = body;

    if (!client_id || !message) {
      return NextResponse.json({ error: 'client_id e message são obrigatórios' }, { status: 400 });
    }

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
        sender_type: sender_type || 'admin',
        sender_name: sender_name || 'NomadWay',
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
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}