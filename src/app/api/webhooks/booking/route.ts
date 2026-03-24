import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_KF7tHvtw_71kG7PCn7SiouRMPWm1M9swd';
const RESEND_FROM = process.env.RESEND_FROM || 'contato@nomadway.com.br';

// Notify client via Email (Resend)
async function notifyClientEmail(booking: any) {
  const email = booking.customer_email;
  if (!email) {
    console.log('⚠️ No email for client notification');
    return;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.substring(0, 5) || '00:00';
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2D5B3D; margin: 0;">🌟 NomadWay</h1>
    <p style="color: #666; margin: 5px 0;">Vistos para Nômades Digitais</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 10px; padding: 25px; margin: 20px 0;">
    <h2 style="color: #2D5B3D; margin-top: 0;">✅ Agendamento Confirmado!</h2>
    <p style="margin-bottom: 20px;">Olá, <strong>${booking.customer_name}</strong>!</p>
    <p>Seu agendamento foi recebido com sucesso. Estamos confirmados para:</p>
  </div>

  <div style="background: #2D5B3D; color: white; border-radius: 10px; padding: 25px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0;"><strong>🎯 Serviço:</strong></td>
        <td style="padding: 10px 0;">${booking.service_name}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>📆 Data:</strong></td>
        <td style="padding: 10px 0;">${formatDate(booking.booking_date)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>🕐 Horário:</strong></td>
        <td style="padding: 10px 0;">${formatTime(booking.booking_time)} (Horário de Madrid)</td>
      </tr>
      ${booking.price_cents > 0 ? `
      <tr>
        <td style="padding: 10px 0;"><strong>💰 Valor:</strong></td>
        <td style="padding: 10px 0;">€${(booking.price_cents / 100).toFixed(2)}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
    <p style="margin: 0;"><strong>📍 Como funciona:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Você receberá um link para reunião online próximo ao horário</li>
      <li>A consulta é feita por vídeo chamada</li>
      <li>Duração média: ${booking.service_duration || 30} minutos</li>
    </ul>
  </div>

  <div style="background: #e8f5e9; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
    <p style="margin: 0;"><strong>🔗 Seu código de referência:</strong></p>
    <p style="font-size: 24px; color: #2D5B3D; margin: 10px 0; letter-spacing: 3px;">${booking.booking_code}</p>
  </div>

  ${booking.customer_notes ? `
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0;"><strong>📝 Suas observações:</strong></p>
    <p style="margin: 5px 0; font-style: italic;">${booking.customer_notes}</p>
  </div>
  ` : ''}

  <div style="text-align: center; margin: 30px 0;">
    <p style="color: #666;">Precisa de ajuda ou remarcar?</p>
    <p>
      <a href="https://wa.me/558488851818" style="background: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block;">📱 Falar no WhatsApp</a>
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>© 2026 NomadWay - Todos os direitos reservados</p>
    <p>Madrid, Espanha | <a href="https://nomadway.com.br" style="color: #2D5B3D;">nomadway.com.br</a></p>
  </div>

</body>
</html>
  `;

  const text = `
✅ Agendamento Confirmado - NomadWay

Olá, ${booking.customer_name}!

Seu agendamento foi recebido com sucesso.

━━━━━━━━━━━━━━━━━━━━

🎯 Serviço: ${booking.service_name}
📆 Data: ${formatDate(booking.booking_date)}
🕐 Horário: ${formatTime(booking.booking_time)} (Madrid)
${booking.price_cents > 0 ? `💰 Valor: €${(booking.price_cents / 100).toFixed(2)}\n` : ''}
🔗 Código: ${booking.booking_code}

━━━━━━━━━━━━━━━━━━━━

📍 Como funciona:
• Você receberá um link para reunião online
• A consulta é feita por vídeo chamada

Precisa de ajuda? WhatsApp: https://wa.me/558488851818

NomadWay - Vistos para Nômades Digitais
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `NomadWay <${RESEND_FROM}>`,
        to: email,
        subject: `✅ Agendamento Confirmado - ${booking.service_name}`,
        html,
        text
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Client Email sent:', result.id);
    } else {
      console.error('❌ Client Email error:', result);
    }
  } catch (e) {
    console.error('❌ Client Email error:', e);
  }
}

// Notify via WhatsApp (Marlon + Group)
async function notifyAdminWhatsApp(booking: any) {
  const message = `📅 *NOVO AGENDAMENTO - NomadWay*
━━━━━━━━━━━━━━━━━━━━

👤 *Cliente:* ${booking.customer_name}
📧 *Email:* ${booking.customer_email}
📱 *Telefone:* ${booking.customer_phone}

🎯 *Serviço:* ${booking.service_name}
💰 *Valor:* ${booking.price_cents === 0 ? 'Grátis' : `€${(booking.price_cents / 100).toFixed(2)}`}
📆 *Data:* ${new Date(booking.booking_date).toLocaleDateString('pt-BR')}
🕐 *Horário:* ${booking.booking_time?.substring(0, 5)} (Madrid)

📝 *Observações:*
${booking.customer_notes || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━
🔑 *Código:* ${booking.booking_code}
📌 *Status:* PENDENTE

⚠️ *Acesse o admin para confirmar:*
https://nomadway-portal.vercel.app/admin`;

  // Send via NomadWay WhatsApp API
  try {
    await fetch('https://nomadway-api.vercel.app/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '120363404032725695@g.us', // NomadWay group
        message,
        type: 'text'
      })
    });
    console.log('✅ Admin WhatsApp sent');
  } catch (e) {
    console.error('❌ Admin WhatsApp error:', e);
  }
}

// Notify client via WhatsApp
async function notifyClientWhatsApp(booking: any) {
  const phone = booking.customer_phone?.replace(/\D/g, '');
  if (!phone || phone.length < 10) {
    console.log('⚠️ Invalid phone for client notification');
    return;
  }

  const hour = parseInt(booking.booking_time?.substring(0, 2) || '12');
  const hourBr = (hour - 4 + 24) % 24; // Madrid to Brazil time

  const message = `👋 Olá, ${booking.customer_name}!

✅ *Agendamento Confirmado - NomadWay*
━━━━━━━━━━━━━━━━━━━━

🎯 *Serviço:* ${booking.service_name}
📆 *Data:* ${new Date(booking.booking_date).toLocaleDateString('pt-BR')}
🕐 *Horário:* ${booking.booking_time?.substring(0, 5)} (Horário de Madrid)

📍 *Atendimento Online*
Você receberá um link para a reunião próximo do horário.

📱 *Precisa de ajuda?*
Responda esta mensagem ou acesse:
https://wa.me/558488851818

━━━━━━━━━━━━━━━━━━
🔗 *Código:* ${booking.booking_code}

*NomadWay - Vistos para Nômades Digitais*`;

  try {
    await fetch('https://nomadway-api.vercel.app/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phone,
        message,
        type: 'text'
      })
    });
    console.log('✅ Client WhatsApp sent');
  } catch (e) {
    console.error('❌ Client WhatsApp error:', e);
  }
}

// Webhook for receiving bookings from external sources (Calendly, site, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both old format (from site) and new format
    const customer_name = body.customer_name || body.name;
    const customer_email = body.customer_email || body.email;
    const customer_phone = body.customer_phone || body.phone;
    const customer_notes = body.customer_notes || body.notes || '';
    const booking_date = body.booking_date || body.date;
    const booking_time = body.booking_time || body.time;
    const service_name = body.service_name || 'Consulta Gratuita';
    const service_id = body.service_id || body.serviceId || 'consultation';
    const service_duration = body.service_duration || body.duration || 30;
    const price_cents = body.price_cents || (body.price ? body.price * 100 : 0);
    const language = body.language || body.lang || 'pt';
    const partner_code = body.partner_code || null;
    const referral_source = body.referral_source || null;

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['customer_name', 'customer_email', 'customer_phone', 'booking_date', 'booking_time'] },
        { status: 400 }
      );
    }

    // Block Wednesdays (day 3 in JS)
    const bookingDate = new Date(booking_date + 'T00:00:00');
    if (bookingDate.getDay() === 3) {
      return NextResponse.json(
        {
          error: 'Dia não disponível',
          details: 'Quartas-feiras não estão disponíveis para agendamento. Por favor, escolha outra data.',
          weekday: 'Wednesday'
        },
        { status: 400 }
      );
    }

    // Validate booking limits
    const supabase = createServerClient();

    // Check maximum 5 bookings per day
    const { data: existingDayBookings, error: dayError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', booking_date)
      .in('status', ['pending', 'confirmed']);

    if (!dayError && existingDayBookings && existingDayBookings.length >= 5) {
      return NextResponse.json(
        {
          error: 'Limite diário de agendamentos atingido',
          details: 'Já existem 5 agendamentos para esta data. Por favor, escolha outra data.',
          count: existingDayBookings.length
        },
        { status: 400 }
      );
    }

    // Check minimum 2.5 hours interval between bookings
    const { data: allDayBookings, error: intervalError } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', booking_date)
      .in('status', ['pending', 'confirmed'])
      .order('booking_time', { ascending: true });

    if (!intervalError && allDayBookings && allDayBookings.length > 0) {
      const newTimeMinutes = parseInt(booking_time.substring(0, 2)) * 60 + parseInt(booking_time.substring(3, 5));
      const minIntervalMinutes = 2.5 * 60; // 2.5 hours in minutes

      for (const existing of allDayBookings) {
        const existingTimeMinutes = parseInt(existing.booking_time?.substring(0, 2) || '0') * 60 +
                                     parseInt(existing.booking_time?.substring(3, 5) || '0');

        const timeDiff = Math.abs(newTimeMinutes - existingTimeMinutes);

        if (timeDiff < minIntervalMinutes) {
          // Calculate how many minutes away
          const minDiff = Math.round(minIntervalMinutes - timeDiff);

          return NextResponse.json(
            {
              error: 'Intervalo mínimo entre agendamentos não respeitado',
              details: `Os agendamentos devem ter pelo menos 2.5 horas de intervalo. Horário conflitante: ${existing.booking_time}. Escolha um horário com mais ${minDiff} minutos de diferença.`,
              conflictTime: existing.booking_time,
              minDiff: minDiff
            },
            { status: 400 }
          );
        }
      }
    }

    // Generate booking code
    const booking_code = 'NW' +
      new Date().toISOString().slice(5, 10).replace('-', '') +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create booking in Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        booking_code,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        booking_date,
        booking_time,
        service_name,
        service_id,
        service_duration,
        price_cents,
        status: 'pending',
        lead_temperature: 'warm',
        language,
        partner_code,
        referral_source,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking', details: error.message },
        { status: 500 }
      );
    }

    // Se tem código de parceiro, criar lead automaticamente
    if (partner_code) {
      try {
        // Buscar parceiro pelo código
        const { data: partner } = await supabase
          .from('partners')
          .select('id, code, name')
          .eq('code', partner_code)
          .eq('status', 'active')
          .single();

        if (partner) {
          // Criar lead para o parceiro
          await supabase
            .from('partner_leads')
            .insert({
              partner_id: partner.id,
              client_name: customer_name,
              client_email: customer_email,
              client_phone: customer_phone,
              source: referral_source || 'referral_link',
              status: 'new',
              booking_id: booking.id
            });

          console.log(`✅ Lead criado para parceiro ${partner.code} (${partner.name})`);
          
          // Notificar parceiro via WhatsApp (se configurado)
          try {
            await fetch('https://nomadway-api.vercel.app/api/whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: '120363404032725695@g.us', // Grupo NomadWay
                message: `🔗 *NOVO LEAD PARCEIRO*\n\n👤 Cliente: ${customer_name}\n📧 ${customer_email}\n📱 ${customer_phone}\n🎯 Serviço: ${service_name}\n\n📌 Parceiro: ${partner.code} (${partner.name})`,
                type: 'text'
              })
            });
          } catch (e) {
            console.error('Erro ao notificar parceiro:', e);
          }
        }
      } catch (err) {
        console.error('Erro ao criar lead:', err);
        // Não falha o booking se o lead falhar
      }
    }

    // Send WhatsApp notifications (async, don't wait)
    notifyAdminWhatsApp(booking).catch(e => console.error('Admin WhatsApp error:', e));
    notifyClientWhatsApp(booking).catch(e => console.error('Client WhatsApp error:', e));
    
    // Send Email confirmation (async, don't wait)
    notifyClientEmail(booking).catch(e => console.error('Client Email error:', e));

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// GET - List bookings
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const temperature = searchParams.get('temperature');

  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (date) {
    query = query.eq('booking_date', date);
  }

  if (temperature) {
    query = query.eq('lead_temperature', temperature);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

// PUT - Update booking
export async function PUT(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const { booking_code, status, lead_temperature, discount_percent, discount_value } = body;

  if (!booking_code) {
    return NextResponse.json({ error: 'booking_code is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (status) {
    updateData.status = status;
    // If archiving, set archived_at and clear cold_since
    if (status === 'archived') {
      updateData.archived_at = new Date().toISOString();
      updateData.archive_reason = 'manual';
      updateData.cold_since = null;
    } else if (status !== 'pending' && status !== 'form_sent') {
      // Clear cold_since when status changes to active states
      updateData.cold_since = null;
    }
  }
  if (lead_temperature) {
    updateData.lead_temperature = lead_temperature;
    // Track cold_since when temperature changes to cold
    if (lead_temperature === 'cold') {
      updateData.cold_since = new Date().toISOString();
    } else {
      // Clear cold_since when temperature changes away from cold
      updateData.cold_since = null;
    }
  }
  
  // Handle discounts
  if (discount_percent !== undefined) {
    updateData.discount_percent = discount_percent || null;
    updateData.discount_value = null;
  }
  if (discount_value !== undefined) {
    updateData.discount_value = discount_value || null;
    updateData.discount_percent = null;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('booking_code', booking_code)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking: data });
}

// DELETE - Delete booking (soft delete by setting status to cancelled)
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  
  const booking_code = searchParams.get('booking_code');
  const id = searchParams.get('id');

  if (!booking_code && !id) {
    return NextResponse.json({ error: 'booking_code or id is required' }, { status: 400 });
  }

  // Use soft delete - set status to cancelled
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq(booking_code ? 'booking_code' : 'id', booking_code || id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking: data });
}