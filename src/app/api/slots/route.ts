// API Route: Get available slots
import { NextRequest, NextResponse } from 'next/server'

// Generate time slots for a specific date
function generateSlotsForDate(dateStr: string, serviceId: string) {
  const slots = []
  const date = new Date(dateStr + 'T12:00:00')
  
  // Business hours: 9:00 - 13:00 and 14:00 - 18:00
  const morningSlots = [9, 10, 11, 12]
  const afternoonSlots = [14, 15, 16, 17, 18]
  
  const interval = 30 // 30-minute intervals
  
  // Simulate some slots being taken (in production, check database)
  const randomUnavailable = new Set<number>()
  for (let i = 0; i < 8; i++) {
    randomUnavailable.add(Math.floor(Math.random() * 20))
  }
  
  let slotIndex = 0
  
  // Generate morning slots
  for (const hour of morningSlots) {
    for (let min = 0; min < 60; min += interval) {
      if (!randomUnavailable.has(slotIndex)) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          available: true
        })
      }
      slotIndex++
    }
  }
  
  // Generate afternoon slots
  for (const hour of afternoonSlots) {
    for (let min = 0; min < 60; min += interval) {
      if (hour === 18 && min > 0) continue
      
      if (!randomUnavailable.has(slotIndex)) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          available: true
        })
      }
      slotIndex++
    }
  }
  
  return slots
}

// Generate available dates (next 14 business days)
function generateAvailableDates() {
  const dates = []
  const today = new Date()
  let daysAdded = 0
  
  while (dates.length < 10 && daysAdded < 30) {
    daysAdded++
    const date = new Date(today)
    date.setDate(today.getDate() + daysAdded)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('serviceId') || '30min-free'
  const date = searchParams.get('date')
  const lang = searchParams.get('lang') || 'pt'
  
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const months = lang === 'pt' 
      ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const days = lang === 'pt'
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // If specific date requested
    if (date) {
      const slots = generateSlotsForDate(date, serviceId)
      const dateObj = new Date(date + 'T12:00:00')
      
      return NextResponse.json({
        success: true,
        date: `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]}`,
        isoDate: date,
        slots,
        timezone: 'Europe/Madrid'
      }, { headers })
    }

    // Return available dates
    const availableDates = generateAvailableDates()
    const datesWithSlots = availableDates.map(d => {
      const slots = generateSlotsForDate(d, serviceId)
      const dateObj = new Date(d + 'T12:00:00')
      
      return {
        date: `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]}`,
        isoDate: d,
        availableSlots: slots.length
      }
    })

    return NextResponse.json({
      success: true,
      serviceId,
      dates: datesWithSlots,
      timezone: 'Europe/Madrid',
      note: lang === 'pt' 
        ? 'Horários no fuso horário da Espanha (Madrid/Barcelona)'
        : 'Times in Spain timezone (Madrid/Barcelona)'
    }, { headers })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate slots'
    }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}