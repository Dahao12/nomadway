import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Check admin auth
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

// Send WhatsApp message via Twilio
export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios: to, message' }, { status: 400 });
    }

    // Twilio credentials from environment
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      // If Twilio not configured, just return success (for development)
      console.log('Twilio not configured. Message would be sent to:', to);
      console.log('Message:', message);
      return NextResponse.json({ 
        success: true, 
        note: 'Twilio não configurado - mensagem apenas simulada',
        to,
        message 
      });
    }

    // Format phone number (remove spaces, ensure + prefix)
    let formattedNumber = to.replace(/[\s-]/g, '');
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('To', `whatsapp:${formattedNumber}`);
    formData.append('Body', message);

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return NextResponse.json({ 
        error: 'Erro ao enviar mensagem', 
        details: result.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sid: result.sid,
      to: formattedNumber 
    });

  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}