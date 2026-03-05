'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to English version of booking page
export default function BookingRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/en/agendamento/booking')
  }, [router])
  
  return null
}