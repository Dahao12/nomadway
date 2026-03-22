import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Middleware to check admin authentication
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Não autorizado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const { email, name, clientCode, portalUrl } = await request.json();

    if (!email || !name || !clientCode || !portalUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Enviar email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    
    if (resendKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'NomadWay <contato@nomadway.com.br>',
          to: email,
          subject: '🌍 Seu Portal NomadWay está pronto!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .code { background: #1f2937; color: #10b981; padding: 15px 20px; border-radius: 8px; font-family: monospace; font-size: 24px; letter-spacing: 2px; text-align: center; margin: 20px 0; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌍 NomadWay</h1>
                  <p>Seu portal está pronto!</p>
                </div>
                <div class="content">
                  <p>Olá <strong>${name}</strong>!</p>
                  <p>Seu portal de acompanhamento NomadWay foi criado. Nele você pode:</p>
                  <ul>
                    <li>✅ Acompanhar o progresso do seu visto</li>
                    <li>💬 Conversar com nossa equipe</li>
                    <li>📄 Enviar documentos necessários</li>
                    <li>📋 Ver todas as etapas do processo</li>
                  </ul>
                  
                  <div style="text-align: center;">
                    <a href="${portalUrl}" class="button">🔗 Acessar Meu Portal</a>
                  </div>
                  
                  <p>Ou acesse diretamente:</p>
                  <p style="word-break: break-all; color: #667eea;">${portalUrl}</p>
                  
                  <p>Seu código de acesso:</p>
                  <div class="code">${clientCode}</div>
                  
                  <p>Guarde este código! Ele é sua chave de acesso ao portal.</p>
                  
                  <p>Qualquer dúvida, estamos à disposição!</p>
                  
                  <p>Atenciosamente,<br><strong>Equipe NomadWay</strong></p>
                </div>
                <div class="footer">
                  <p>© 2026 NomadWay - Sua jornada para a Espanha começa aqui</p>
                  <p>contato@nomadway.com.br</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Olá ${name}!

Seu portal de acompanhamento NomadWay está pronto!

🔗 Acesse: ${portalUrl}

Seu código de acesso: ${clientCode}

No portal você pode:
- Acompanhar o progresso do seu visto
- Conversar com nossa equipe  
- Enviar documentos necessários
- Ver todas as etapas do processo

Qualquer dúvida, estamos à disposição!

Equipe NomadWay
contato@nomadway.com.br
          `
        })
      });

      if (emailResponse.ok) {
        return NextResponse.json({ success: true, message: 'Email enviado com sucesso!' });
      } else {
        const error = await emailResponse.text();
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Erro ao enviar email', fallback: true }, { status: 500 });
      }
    } else {
      // Sem API key - retorna fallback
      return NextResponse.json({ 
        success: false, 
        fallback: true,
        message: 'Email não configurado - use o fallback mailto'
      });
    }

  } catch (error) {
    console.error('Error sending portal link:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}