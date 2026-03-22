import { NextRequest, NextResponse } from 'next/server';

/**
 * API para enviar notificações WhatsApp para parceiros
 * 
 * Endpoints:
 * - POST /api/notifications/partner/new-lead
 * - POST /api/notifications/partner/commission-approved
 * - POST /api/notifications/partner/payment-received
 */

const WHATSAPP_GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || 'https://wa.cl2d.com';
const WHATSAPP_GATEWAY_TOKEN = process.env.WHATSAPP_GATEWAY_TOKEN;

interface NotificationData {
  partner_phone: string;
  partner_name: string;
  partner_code: string;
  type: 'new_lead' | 'commission_approved' | 'payment_received';
  data: {
    client_name?: string;
    client_email?: string;
    commission_amount?: number;
    payment_amount?: number;
    payment_method?: string;
  };
}

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    // Limpar número
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formatar para WhatsApp (adicionar código do país se necessário)
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const response = await fetch(`${WHATSAPP_GATEWAY_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        message,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

function getNewLeadMessage(partnerName: string, code: string, clientName: string): string {
  return `🎉 *Novo Lead - NomadWay*

Olá ${partnerName}!

Você recebeu um novo lead através do seu código *${code}*:

👤 *Cliente:* ${clientName}

Acesse seu portal para acompanhar:
nomadway.com.br/parceiro?code=${code}

Boas vendas! 🚀`;
}

function getCommissionApprovedMessage(partnerName: string, code: string, clientName: string, amount: number): string {
  return `💰 *Comissão Aprovada - NomadWay*

Olá ${partnerName}!

Sua comissão foi aprovada:

👤 *Cliente:* ${clientName}
💸 *Valor:* ${formatCurrency(amount)}

Acesse seu portal para ver detalhes:
nomadway.com.br/parceiro?code=${code}

Pagamentos são realizados dia 15 de cada mês.`;
}

function getPaymentReceivedMessage(partnerName: string, amount: number, method: string): string {
  return `✅ *Pagamento Recebido - NomadWay*

Olá ${partnerName}!

Seu pagamento foi realizado:

💸 *Valor:* ${formatCurrency(amount)}
💳 *Forma:* ${method.toUpperCase()}

Acesse seu portal para ver o histórico:
nomadway.com.br/parceiro?code={code}

Obrigado pela parceria! 🤝`;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationData = await request.json();
    const { partner_phone, partner_name, partner_code, type, data } = body;

    if (!partner_phone) {
      return NextResponse.json({ error: 'partner_phone é obrigatório' }, { status: 400 });
    }

    let message: string;

    switch (type) {
      case 'new_lead':
        message = getNewLeadMessage(partner_name, partner_code, data.client_name || 'Cliente');
        break;
      
      case 'commission_approved':
        message = getCommissionApprovedMessage(
          partner_name,
          partner_code,
          data.client_name || 'Cliente',
          data.commission_amount || 0
        );
        break;
      
      case 'payment_received':
        message = getPaymentReceivedMessage(
          partner_name,
          data.payment_amount || 0,
          data.payment_method || 'transfer'
        ).replace('{code}', partner_code);
        break;
      
      default:
        return NextResponse.json({ error: 'Tipo de notificação inválido' }, { status: 400 });
    }

    const sent = await sendWhatsApp(partner_phone, message);

    if (sent) {
      return NextResponse.json({ success: true, message: 'Notificação enviada' });
    } else {
      return NextResponse.json({ error: 'Falha ao enviar notificação' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}