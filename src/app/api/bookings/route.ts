// API Route: Create booking
import { NextRequest, NextResponse } from 'next/server'

// NomadWay Portal Webhook
const PORTAL_WEBHOOK = 'https://nomadway-portal.vercel.app/api/webhooks/booking'

// Service configurations
const SERVICES: Record<string, { title: { pt: string; en: string }; duration: number; price: number; currency: string; description?: { pt: string; en: string } }> = {
  '30min-free': {
    title: { pt: 'Consultoria Inicial', en: 'Initial Consultation' },
    duration: 30,
    price: 0,
    currency: 'EUR'
  },
  '60min': {
    title: { pt: 'Consultoria Completa', en: 'Full Consultation' },
    duration: 60,
    price: 1299,
    currency: 'EUR'
  },
  '30min-followup': {
    title: { pt: 'Acompanhamento', en: 'Follow-up Session' },
    duration: 30,
    price: 0,
    currency: 'EUR',
    description: { pt: 'Para quem já contratou', en: 'For existing clients' }
  },
  '90min-inperson': {
    title: { pt: 'VIP Total', en: 'VIP Total' },
    duration: 90,
    price: 3000,
    currency: 'EUR'
  },
  'estancia-estudos': {
    title: { pt: 'Vistos para Estância de Estudos', en: 'Student Residence Visa' },
    duration: 60,
    price: 1499,
    currency: 'EUR',
    description: { pt: 'Processo completo de visto de estudante', en: 'Complete student visa process' }
  }
}

function generateBookingId(): string {
  return 'NW' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const body = await request.json()
    const { 
      serviceId, 
      date, 
      time, 
      name, 
      email, 
      phone, 
      notes,
      lang = 'pt',
      partner_code,
      referral_source
    } = body

    // Validation
    if (!serviceId || !date || !time || !name || !email || !phone) {
      return NextResponse.json({
        success: false,
        error: lang === 'pt' 
          ? 'Campos obrigatórios: serviço, data, horário, nome, email e telefone'
          : 'Required fields: service, date, time, name, email and phone'
      }, { status: 400, headers })
    }

    // Validate service
    const service = SERVICES[serviceId]
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Invalid service ID'
      }, { status: 400, headers })
    }

    // Create booking ID
    const bookingId = generateBookingId()

    // Log for debugging
    console.log('📅 New booking created:')
    console.log('   ID:', bookingId)
    console.log('   Customer:', name)
    console.log('   Email:', email)
    console.log('   Phone:', phone)
    console.log('   Service:', service.title[lang as 'pt' | 'en'])
    console.log('   Date:', date, 'at', time)
    if (partner_code) {
      console.log('   Partner Code:', partner_code)
    }

    // Send to Portal Webhook (async, don't wait)
    try {
      await fetch(PORTAL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_code: bookingId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          customer_notes: notes || '',
          booking_date: date,
          booking_time: time,
          service_id: serviceId,
          service_name: service.title[lang as 'pt' | 'en'],
          service_duration: service.duration,
          price_cents: service.price * 100,
          source: 'website',
          language: lang,
          partner_code: partner_code || null,
          referral_source: referral_source || null
        })
      })
      console.log('✅ Sent to portal webhook')
    } catch (webhookError) {
      // Don't fail if webhook fails
      console.error('⚠️ Webhook error (non-critical):', webhookError)
    }

    // Response
    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        service: service.title[lang as 'pt' | 'en'],
        date: date,
        time: time,
        timezone: 'Europe/Madrid (GMT+1)',
        duration: service.duration,
        price: service.price === 0 
          ? (lang === 'pt' ? 'Grátis' : 'Free')
          : `${service.price} ${service.currency}`,
        customer: {
          name: name,
          email: email
        }
      },
      message: lang === 'pt'
        ? 'Agendamento confirmado! Você receberá uma confirmação por email em breve.'
        : 'Booking confirmed! You will receive an email confirmation shortly.'
    }, { status: 201, headers })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking'
    }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}