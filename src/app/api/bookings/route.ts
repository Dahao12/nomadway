// API Route: Create booking
import { NextRequest, NextResponse } from 'next/server'

// In-memory store for bookings (in production, use a database)
// This will reset on each deployment, but works for demo
const bookings: any[] = []

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
      lang = 'pt'
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

    // Create booking
    const booking = {
      id: generateBookingId(),
      serviceId,
      service,
      date,
      time,
      timezone: 'Europe/Madrid',
      customer: {
        name,
        email,
        phone,
        notes: notes || ''
      },
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      lang
    }

    // Store booking
    bookings.push(booking)

    // Log for debugging (in production, send email/WhatsApp notification)
    console.log('📅 New booking created:')
    console.log('   ID:', booking.id)
    console.log('   Customer:', booking.customer.name)
    console.log('   Email:', booking.customer.email)
    console.log('   Phone:', booking.customer.phone)
    console.log('   Service:', service.title[lang as 'pt' | 'en'])
    console.log('   Date:', booking.date, 'at', booking.time)

    // Response
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: service.title[lang as 'pt' | 'en'],
        date: booking.date,
        time: booking.time,
        timezone: 'Europe/Madrid (GMT+1)',
        duration: service.duration,
        price: service.price === 0 
          ? (lang === 'pt' ? 'Grátis' : 'Free')
          : `${service.price} ${service.currency}`,
        customer: {
          name: booking.customer.name,
          email: booking.customer.email
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const admin = searchParams.get('admin')
  
  // Simple admin check (in production, use proper auth)
  if (admin !== 'nomadway2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({
    success: true,
    count: bookings.length,
    bookings
  })
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