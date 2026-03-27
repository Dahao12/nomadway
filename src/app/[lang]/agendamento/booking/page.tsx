'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaCalendarAlt, FaClock, FaArrowLeft, FaCheck, FaSpinner, FaUser, FaEnvelope, FaPhone, FaCommentDots, FaTimes } from 'react-icons/fa'
import { usePartnerRef } from '@/hooks/usePartnerRef'

const countryCodes = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸' },
  { code: '+1', country: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '+33', country: 'França', flag: '🇫🇷' },
  { code: '+39', country: 'Itália', flag: '🇮🇹' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colômbia', flag: '🇨🇴' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
];

const content = {
  pt: {
    title: 'Agendar Consultoria',
    subtitle: 'Escolha o melhor horário para sua consultoria',
    loading: 'Carregando horários...',
    noSlots: 'Não há horários disponíveis. Entre em contato pelo email.',
    yourInfo: 'Seus Dados',
    nameLabel: 'Nome Completo',
    namePlaceholder: 'Seu nome completo',
    emailLabel: 'Email',
    emailPlaceholder: 'seu@email.com',
    phoneLabel: 'Telefone',
    phonePlaceholder: '+55 11 99999-9999',
    notesLabel: 'Observações (opcional)',
    notesPlaceholder: 'Conte-nos mais sobre seu caso...',
    confirm: 'Confirmar Agendamento',
    backToServices: 'Voltar para serviços',
    success: 'Agendamento Confirmado!',
    successMessage: 'Você receberá uma confirmação por email em breve.',
    backToHome: 'Voltar ao início',
    errorName: 'Por favor, informe seu nome',
    errorEmail: 'Por favor, informe seu email',
    errorPhone: 'Por favor, informe seu telefone',
    selectDate: 'Selecione uma data',
    selectTime: 'Selecione um horário',
    step1: '1. Escolha a Data',
    step2: '2. Escolha o Horário',
    step3: '3. Seus Dados',
    availableSlots: 'horários disponíveis',
    summary: 'Resumo do Agendamento',
    proceedToPayment: 'Prosseguir',
    termsAgree: 'Ao confirmar, você concorda com nossos',
    termsLink: 'Termos de Uso',
    privacyLink: 'Política de Privacidade',
    timezoneNote: 'Horários exibidos para Brasília (GMT-3). A consultoria é realizada no horário da Espanha.',
    timezoneSpain: '🇪🇸 Espanha',
    timezoneBrazil: '🇧🇷 Brasil',
    madridTime: 'Horário Madrid',
    brasilTime: 'Horário Brasília',
    // Form questions
    formTitle: 'Antes de Confirmar',
    formSubtitle: 'Precisamos de algumas informações para melhor atendê-lo',
    // Q1: Visa type
    visaType: 'Qual visto você busca?',
    visaOptions: ['Nomad Digital', 'Estudante', 'Familiar', 'CAP', 'Outro'],
    // Q2: Coming with family
    comingWithFamily: 'Vem com familiares?',
    comingWithFamilyOptions: ['Sozinho', 'Com 1 pessoa', 'Com 2 pessoas', 'Com 3 ou mais'],
    // Q3: Know visa types
    knowsVisaTypes: 'Conhece os tipos de vistos disponíveis?',
    knowsVisaTypesOptions: ['Sim, já pesquisei', 'Mais ou menos', 'Não, quero saber mais'],
    // Q4: Travel timeline
    travelDate: 'Quando pretende mudar?',
    travelOptions: ['Próximos 3 meses', '3-6 meses', '6-12 meses', 'Ainda pesquisando'],
    // Q5: Budget
    budget: 'Orçamento disponível? (opcional)',
    budgetOptions: ['Menos de €5.000', '€5.000 - €15.000', 'Mais de €15.000', 'Prefiro não informar'],
    // Q6: Current profession
    profession: 'Qual sua profissão atual?',
    professionPlaceholder: 'Ex: Desenvolvedor, Designer, Advogado...',
    // Q7: Intended city
    intendedCity: 'Cidade pretendida na Espanha?',
    intendedCityOptions: ['Barcelona', 'Madrid', 'Valência', 'Alicante', 'Outra', 'Ainda não sei'],
    // Q8: Traveled abroad
    hasTraveledAbroad: 'Já viajou para fora do Brasil antes?',
    hasTraveledAbroadOptions: ['Sim, várias vezes', 'Sim, pelo menos uma vez', 'Nunca viajei'],
    // Q9: How found us
    howFoundUs: 'Como você nos encontrou?',
    howFoundUsOptions: ['Google', 'Instagram', 'Indicação de parceiro', 'YouTube', 'Outro'],
    // Q10: Main challenge
    mainChallenge: 'Qual maior desafio para obter visto hoje?',
    mainChallengeOptions: ['Documentação', 'Prazos', 'Valor', 'Entender requisitos', 'Todos os acima'],
    // Q11: Already in Spain
    alreadyInSpain: 'Você já está na Espanha?',
    alreadyInSpainOptions: ['Não', 'Sim, há menos de 3 meses', 'Sim, há 3-6 meses', 'Sim, há mais de 6 meses'],
    // Q12: Other questions
    otherDoubts: 'Outras dúvidas ou informações (opcional)',
    otherDoubtsPlaceholder: 'Tem alguma pergunta específica?',
    // Q13: Instagram
    instagram: 'Instagram (opcional)',
    instagramPlaceholder: '@seuusuario',
    // Q14: Family relationship
    familyRelationship: 'Grau de parentesco (se vier com familiares)',
    familyRelationshipOptions: ['Não venho com familiares', 'Cônjuge/Esposo(a)', 'Filho(a)', 'Pai/Mãe', 'Irmão(ã)', 'Outro'],
    familyMemberName: 'Nome completo do familiar',
    familyMemberNamePlaceholder: 'Nome completo do familiar que virá junto',
    continueBtn: 'Confirmar Agendamento',
    requiredField: 'Campo obrigatório'
  },
  en: {
    title: 'Book Consultation',
    subtitle: 'Choose the best time for your consultation',
    loading: 'Loading available times...',
    noSlots: 'No available slots. Contact us via email.',
    yourInfo: 'Your Information',
    nameLabel: 'Full Name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    phoneLabel: 'Phone',
    phonePlaceholder: '+34 612 345 678',
    notesLabel: 'Notes (optional)',
    notesPlaceholder: 'Tell us more about your case...',
    confirm: 'Confirm Booking',
    backToServices: 'Back to services',
    success: 'Booking Confirmed!',
    successMessage: 'You will receive a confirmation email shortly.',
    backToHome: 'Back to home',
    errorName: 'Please enter your name',
    errorEmail: 'Please enter your email',
    errorPhone: 'Please enter your phone',
    selectDate: 'Select a date',
    selectTime: 'Select a time',
    step1: '1. Choose Date',
    step2: '2. Choose Time',
    step3: '3. Your Details',
    availableSlots: 'slots available',
    summary: 'Booking Summary',
    proceedToPayment: 'Proceed',
    termsAgree: 'By confirming, you agree to our',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    timezoneNote: 'Times shown for Brasília (GMT-3). Consultation takes place in Spain timezone.',
    timezoneSpain: '🇪🇸 Spain',
    timezoneBrazil: '🇧🇷 Brazil',
    madridTime: 'Madrid Time',
    brasilTime: 'Brasília Time',
    // Form questions
    formTitle: 'Before Confirming',
    formSubtitle: 'We need some information to better assist you',
    visaType: 'Which visa are you seeking?',
    visaOptions: ['Digital Nomad', 'Student', 'Family', 'CAP', 'Other'],
    comingWithFamily: 'Coming with family?',
    comingWithFamilyOptions: ['Alone', 'With 1 person', 'With 2 people', 'With 3+ people'],
    knowsVisaTypes: 'Do you know the available visa types?',
    knowsVisaTypesOptions: ['Yes, I researched', 'Somewhat', 'No, want to learn more'],
    travelDate: 'When do you plan to move?',
    travelOptions: ['Next 3 months', '3-6 months', '6-12 months', 'Still researching'],
    budget: 'Available budget? (optional)',
    budgetOptions: ['Less than €5,000', '€5,000 - €15,000', 'More than €15,000', 'Prefer not to say'],
    profession: 'What is your current profession?',
    professionPlaceholder: 'e.g., Developer, Designer, Lawyer...',
    intendedCity: 'Intended city in Spain?',
    intendedCityOptions: ['Barcelona', 'Madrid', 'Valencia', 'Alicante', 'Other', 'Not sure yet'],
    hasTraveledAbroad: 'Have you traveled abroad before?',
    hasTraveledAbroadOptions: ['Yes, many times', 'Yes, at least once', 'Never traveled'],
    howFoundUs: 'How did you find us?',
    howFoundUsOptions: ['Google', 'Instagram', 'Partner referral', 'YouTube', 'Other'],
    mainChallenge: 'Main challenge to get a visa?',
    mainChallengeOptions: ['Documentation', 'Deadlines', 'Cost', 'Understanding requirements', 'All of above'],
    alreadyInSpain: 'Are you already in Spain?',
    alreadyInSpainOptions: ['No', 'Yes, less than 3 months', 'Yes, 3-6 months', 'Yes, more than 6 months'],
    otherDoubts: 'Other questions or info (optional)',
    otherDoubtsPlaceholder: 'Any specific questions?',
    // Q13: Instagram
    instagram: 'Instagram (optional)',
    instagramPlaceholder: '@yourusername',
    // Q14: Family relationship
    familyRelationship: 'Family relationship (if coming with family)',
    familyRelationshipOptions: ['Not coming with family', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    familyMemberName: 'Family member full name',
    familyMemberNamePlaceholder: 'Full name of family member accompanying you',
    continueBtn: 'Confirm Booking',
    requiredField: 'Required field'
  }
}

const services = {
  pt: {
    '30min-free': { title: 'Consulta Gratuita', duration: '30 min', icon: '🎯', free: true, price: 'GRÁTIS', description: 'Avaliação gratuita do seu caso de visto' },
    'mentoria': { title: 'Mentoria Diagnóstico', duration: '60 min', icon: '📊', free: false, price: '€99', description: 'Sessão de diagnóstico - valor descontado do Nomad Visa' },
    'nomad-visa': { title: 'Nomad Visa Completo', duration: '90 min', icon: '✈️', free: false, price: '€1.499', description: 'Processo completo com acompanhamento total (Dependentes: +€299)' },
    'relocation': { title: 'Relocation', duration: '60 min', icon: '🏠', free: false, price: '€99', description: 'Consultoria de relocation - sessão de 60min' },
    'vip-inperson': { title: 'VIP Presencial', duration: '120 min', icon: '⭐', free: false, price: '€3.000', description: 'Consultoria VIP em Barcelona' },
    'estancia-estudos': { title: 'Vistos para Estância de Estudos', duration: '90 min', icon: '🎓', free: false, price: '€1.499', description: 'Processo completo de visto de estudante' },
    '30min-followup': { title: 'Acompanhamento', duration: '30 min', icon: '🔄', free: true, price: 'Cliente', clientOnly: true, description: 'Para clientes que já contrataram' }
  },
  en: {
    '30min-free': { title: 'Free Consultation', duration: '30 min', icon: '🎯', free: true, price: 'FREE', description: 'Free assessment of your visa case' },
    'mentoria': { title: 'Diagnostic Mentoring', duration: '60 min', icon: '📊', free: false, price: '€99', description: 'Diagnostic session - discounted from Nomad Visa' },
    'nomad-visa': { title: 'Nomad Visa Complete', duration: '90 min', icon: '✈️', free: false, price: '€1,499', description: 'Complete process with full support (Dependents: +€299)' },
    'relocation': { title: 'Relocation', duration: '60 min', icon: '🏠', free: false, price: '€99', description: 'Relocation consulting - 60min session' },
    'vip-inperson': { title: 'VIP In-Person', duration: '120 min', icon: '⭐', free: false, price: '€3,000', description: 'VIP consultation in Barcelona' },
    'estancia-estudos': { title: 'Student Residence Visa', duration: '90 min', icon: '🎓', free: false, price: '€1,499', description: 'Complete student visa process' },
    '30min-followup': { title: 'Follow-up Session', duration: '30 min', icon: '🔄', free: true, price: 'Client', clientOnly: true, description: 'For existing clients' }
  }
}

const API_URL = 'https://nomadway-api.vercel.app'

// Convert Madrid time to Brasília time (Madrid is UTC+1, Brasília is UTC-3, difference is 4 hours)
function madridToBrasilia(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  let brasiliaHours = hours - 4
  if (brasiliaHours < 0) brasiliaHours += 24
  return `${brasiliaHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Convert Brasília time to Madrid time
function brasiliaToMadrid(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  let madridHours = hours + 4
  if (madridHours >= 24) madridHours -= 24
  return `${madridHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Generate slots based on business hours (NO random - real availability from API)
function generateBusinessHoursSlots(lang: 'pt' | 'en'): { date: string; isoDate: string; times: string[] }[] {
  const slots: { date: string; isoDate: string; times: string[] }[] = []
  const today = new Date()
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // Skip Sundays only (Saturdays have morning slots)
    if (date.getDay() === 0) continue
    
    const times: string[] = []
    const isSaturday = date.getDay() === 6
    
    // Morning slots: 9:00-12:00
    for (let h = 9; h <= 12; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`)
      if (h < 12) times.push(`${h.toString().padStart(2, '0')}:30`)
    }
    
    // Afternoon slots: 14:00-18:00 (NOT on Saturday)
    if (!isSaturday) {
      for (let h = 14; h <= 18; h++) {
        times.push(`${h.toString().padStart(2, '0')}:00`)
        if (h < 18) times.push(`${h.toString().padStart(2, '0')}:30`)
      }
    }
    
    const months = lang === 'pt' 
      ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const days = lang === 'pt'
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    slots.push({
      date: `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`,
      isoDate: date.toISOString().split('T')[0],
      times // All business hours - API will filter unavailable
    })
  }
  
  return slots
}

// Fetch slots from API or use business hours as base
async function fetchSlots(lang: 'pt' | 'en', serviceId: string): Promise<{ date: string; isoDate: string; times: string[] }[]> {
  try {
    const response = await fetch(`${API_URL}/api/slots?serviceId=${serviceId}&lang=${lang}`)
    if (!response.ok) throw new Error('API not available')
    
    const data = await response.json()
    
    const slotsWithTimes = await Promise.all(
      data.dates.slice(0, 15).map(async (d: any) => {
        try {
          const timeResponse = await fetch(`${API_URL}/api/slots?serviceId=${serviceId}&date=${d.isoDate}&lang=${lang}`)
          const timeData = await timeResponse.json()
          // Filter to only AVAILABLE slots
          const availableTimes = timeData.slots?.filter((s: any) => s.available).map((s: any) => s.time) || []
          return {
            date: d.date,
            isoDate: d.isoDate,
            times: availableTimes.length > 0 ? availableTimes : []
          }
        } catch {
          return {
            date: d.date,
            isoDate: d.isoDate,
            times: []
          }
        }
      })
    )
    
    // Filter out dates with no available slots
    return slotsWithTimes.filter(s => s.times.length > 0)
  } catch (error) {
    console.error('API unavailable, using business hours:', error)
    // Fallback to business hours (NOT random) - but mark that API failed
    return generateBusinessHoursSlots(lang)
  }
}

function BookingContent({ params }: { params: { lang: 'pt' | 'en' } }) {
  const searchParams = useSearchParams()
  const { getPartnerCode } = usePartnerRef()
  
  const serviceId = searchParams.get('service') || '30min-free'
  // Prioriza URL, depois cookie (30 dias)
  const partnerCode = searchParams.get('ref') || searchParams.get('partner_code') || getPartnerCode() || null
  
  const lang = params.lang || 'pt'
  const t = content[lang]
  const serviceInfo = services[lang][serviceId as keyof typeof services[typeof lang]] || services[lang]['30min-free']
  
  const [slots, setSlots] = useState<{ date: string; isoDate: string; times: string[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+55')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form questionnaire state
  const [showFormModal, setShowFormModal] = useState(false)
  const [visaType, setVisaType] = useState('')
  const [comingWithFamily, setComingWithFamily] = useState('')
  const [knowsVisaTypes, setKnowsVisaTypes] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [budget, setBudget] = useState('')
  const [profession, setProfession] = useState('')
  const [intendedCity, setIntendedCity] = useState('')
  const [hasTraveledAbroad, setHasTraveledAbroad] = useState('')
  const [howFoundUs, setHowFoundUs] = useState('')
  const [mainChallenge, setMainChallenge] = useState('')
  const [alreadyInSpain, setAlreadyInSpain] = useState('')
  const [otherDoubts, setOtherDoubts] = useState('')
  const [instagram, setInstagram] = useState('')
  const [familyRelationship, setFamilyRelationship] = useState('')
  const [familyMemberName, setFamilyMemberName] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchSlots(lang, serviceId).then(data => {
      setSlots(data)
      setLoading(false)
    })
  }, [lang, serviceId])

  // Format phone with international mask
  const formatPhone = (value: string): string => {
    // Remove all non-digits and non-plus
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    // Limit to 15 digits (international standard)
    if (cleaned.length > 16) {
      cleaned = cleaned.slice(0, 16)
    }
    
    return cleaned
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = t.errorName
    if (!email.trim()) newErrors.email = t.errorEmail

    // Phone validation - must have at least 8 digits after country code
    const phoneDigits = phone.replace(/\D/g, '')
    if (!phone.trim()) {
      newErrors.phone = t.errorPhone
    } else if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      newErrors.phone = lang === 'pt' ? 'Número inválido (8-15 dígitos)' : 'Invalid number (8-15 digits)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!visaType) newErrors.visaType = t.requiredField
    if (!comingWithFamily) newErrors.comingWithFamily = t.requiredField
    if (!knowsVisaTypes) newErrors.knowsVisaTypes = t.requiredField
    if (!travelDate) newErrors.travelDate = t.requiredField
    if (!intendedCity) newErrors.intendedCity = t.requiredField
    if (!hasTraveledAbroad) newErrors.hasTraveledAbroad = t.requiredField
    if (!howFoundUs) newErrors.howFoundUs = t.requiredField
    if (!mainChallenge) newErrors.mainChallenge = t.requiredField
    if (!alreadyInSpain) newErrors.alreadyInSpain = t.requiredField
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openFormModal = () => {
    // Validate basic info first
    if (!selectedDate || !selectedIsoDate) {
      alert(lang === 'pt' ? 'Por favor, selecione uma data.' : 'Please select a date.')
      return
    }
    if (!selectedTime) {
      alert(lang === 'pt' ? 'Por favor, selecione um horário.' : 'Please select a time.')
      return
    }
    if (!validate()) return

    setShowFormModal(true)
  }

  const handleSubmit = async () => {
    // Validate form questions
    if (!validateForm()) return

    setSubmitting(true)

    try {
      // Combine all form answers
      const formAnswers = [
        `Visto: ${visaType}`,
        `Familiares: ${comingWithFamily}`,
        `Conhece vistos: ${knowsVisaTypes}`,
        `Quando: ${travelDate}`,
        budget ? `Orçamento: ${budget}` : null,
        profession ? `Profissão: ${profession}` : null,
        `Cidade: ${intendedCity}`,
        `Viajou fora: ${hasTraveledAbroad}`,
        `Como encontrou: ${howFoundUs}`,
        `Desafio: ${mainChallenge}`,
        `Na Espanha: ${alreadyInSpain}`,
        otherDoubts ? `Outras: ${otherDoubts}` : null
      ].filter(Boolean).join(' | ')

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date: selectedIsoDate,
          time: selectedTime,
          name: name.trim(),
          email: email.trim(),
          phone: `${countryCode} ${phone.trim()}`.trim(),
          notes: notes.trim() ? `${notes.trim()}\n\n${formAnswers}` : formAnswers,
          lang,
          partner_code: partnerCode,
          referral_source: partnerCode ? 'partner_link' : undefined,
          // Structured form data
          visa_type: visaType,
          family_count: comingWithFamily,
          knows_visas: knowsVisaTypes,
          travel_timeline: travelDate,
          budget: budget || undefined,
          profession: profession || undefined,
          intended_city: intendedCity,
          has_traveled_abroad: hasTraveledAbroad,
          how_found_us: howFoundUs,
          main_challenge: mainChallenge,
          already_in_spain: alreadyInSpain,
          other_questions: otherDoubts || undefined,
          instagram: instagram || undefined,
          family_relationship: familyRelationship || undefined,
          family_member_name: familyMemberName || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Booking confirmed:', data)
        setSuccess(true)
      } else {
        const error = await response.json()
        console.error('Booking failed:', error)
        alert(error.error || (lang === 'pt' ? 'Erro ao criar agendamento. Tente novamente.' : 'Error creating booking. Please try again.'))
      }
    } catch (error) {
      console.error('API error:', error)
      alert(lang === 'pt'
        ? 'Erro de conexão. Verifique sua internet e tente novamente.'
        : 'Connection error. Check your internet and try again.')
    }

    setSubmitting(false)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-green-100 to-green-200 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-[120px] opacity-40" />

        <div className="relative max-w-lg mx-auto py-16 px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaCheck className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h1>
            <p className="text-gray-600 mb-6">{t.successMessage}</p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{serviceInfo.icon}</span>
                <div>
                  <p className="font-bold text-gray-900">{serviceInfo.title}</p>
                  <p className="text-sm text-gray-500">{serviceInfo.duration} • {serviceInfo.price}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{lang === 'pt' ? 'Data' : 'Date'}</p>
                  <p className="font-semibold text-gray-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{lang === 'pt' ? 'Horário' : 'Time'}</p>
                  <p className="font-semibold text-gray-900">{selectedTime} (Madrid)</p>
                </div>
              </div>
            </div>

            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
            >
              {t.backToHome}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Form Modal
  const formModal = showFormModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.formTitle}</h2>
            <p className="text-sm text-gray-500">{t.formSubtitle}</p>
          </div>
          <button
            onClick={() => setShowFormModal(false)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Q1: Visa Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.visaType} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {t.visaOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisaType(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    visaType === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.visaType && <p className="text-red-500 text-sm mt-1">{errors.visaType}</p>}
          </div>

          {/* Q2: Coming with Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.comingWithFamily} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {t.comingWithFamilyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setComingWithFamily(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    comingWithFamily === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.comingWithFamily && <p className="text-red-500 text-sm mt-1">{errors.comingWithFamily}</p>}
          </div>

          {/* Q3: Knows Visa Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.knowsVisaTypes} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {t.knowsVisaTypesOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKnowsVisaTypes(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    knowsVisaTypes === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.knowsVisaTypes && <p className="text-red-500 text-sm mt-1">{errors.knowsVisaTypes}</p>}
          </div>

          {/* Q4: Travel Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.travelDate} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {t.travelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTravelDate(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    travelDate === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.travelDate && <p className="text-red-500 text-sm mt-1">{errors.travelDate}</p>}
          </div>

          {/* Q5: Budget (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.budget}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {t.budgetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBudget(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    budget === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Q6: Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.profession}
            </label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder={t.professionPlaceholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
            />
          </div>

          {/* Q7: Intended City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.intendedCity} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {t.intendedCityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIntendedCity(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    intendedCity === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.intendedCity && <p className="text-red-500 text-sm mt-1">{errors.intendedCity}</p>}
          </div>

          {/* Q8: Has Traveled Abroad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.hasTraveledAbroad} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {t.hasTraveledAbroadOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHasTraveledAbroad(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    hasTraveledAbroad === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.hasTraveledAbroad && <p className="text-red-500 text-sm mt-1">{errors.hasTraveledAbroad}</p>}
          </div>

          {/* Q9: How Found Us */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.howFoundUs} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {t.howFoundUsOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHowFoundUs(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    howFoundUs === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.howFoundUs && <p className="text-red-500 text-sm mt-1">{errors.howFoundUs}</p>}
          </div>

          {/* Q10: Main Challenge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.mainChallenge} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {t.mainChallengeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMainChallenge(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    mainChallenge === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.mainChallenge && <p className="text-red-500 text-sm mt-1">{errors.mainChallenge}</p>}
          </div>

          {/* Q11: Already in Spain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.alreadyInSpain} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {t.alreadyInSpainOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAlreadyInSpain(option)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    alreadyInSpain === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.alreadyInSpain && <p className="text-red-500 text-sm mt-1">{errors.alreadyInSpain}</p>}
          </div>

          {/* Q12: Other Doubts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.otherDoubts}
            </label>
            <textarea
              value={otherDoubts}
              onChange={(e) => setOtherDoubts(e.target.value)}
              placeholder={t.otherDoubtsPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none resize-none transition-colors"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.instagram}
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder={t.instagramPlaceholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
            />
          </div>

          {/* Family Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.familyRelationship}
            </label>
            <div className="flex flex-wrap gap-2">
              {t.familyRelationshipOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFamilyRelationship(option)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    familyRelationship === option
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Family Member Name (conditional) */}
          {familyRelationship && familyRelationship !== 'Não venho com familiares' && familyRelationship !== 'Not coming with family' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.familyMemberName}
              </label>
              <input
                type="text"
                value={familyMemberName}
                onChange={(e) => setFamilyMemberName(e.target.value)}
                placeholder={t.familyMemberNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-3xl">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                {lang === 'pt' ? 'Agendando...' : 'Booking...'}
              </>
            ) : (
              <>
                <FaCheck />
                {t.continueBtn}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full blur-[100px] opacity-30" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-primary-50 to-primary-100 rounded-full blur-[80px] opacity-30" />

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${lang}/agendamento`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors font-medium"
          >
            <FaArrowLeft className="text-sm" />
            {t.backToServices}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        {/* Service Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
              {serviceInfo.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">{serviceInfo.title}</h3>
              <p className="text-white/80 text-sm">{serviceInfo.description}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-xl">{serviceInfo.price}</p>
              <p className="text-white/70 text-sm">{serviceInfo.duration}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <span className="text-gray-500 font-medium">{t.loading}</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Date & Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Date Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-600 rounded-full text-white text-sm flex items-center justify-center">1</span>
                    {t.step1}
                  </h2>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.isoDate}
                        onClick={() => {
                          setSelectedDate(slot.date)
                          setSelectedIsoDate(slot.isoDate)
                          setSelectedTime(null)
                        }}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          selectedIsoDate === slot.isoDate
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{slot.date}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {slot.times.length} {t.availableSlots}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Time Selection */}
              <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${selectedDate ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-white text-sm flex items-center justify-center ${selectedDate ? 'bg-primary-600' : 'bg-gray-300'}`}>2</span>
                    {t.step2}
                  </h2>
                </div>
                <div className="p-4">
                  {selectedDate ? (
                    <>
                      {/* Timezone info banner */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span>🇪🇸</span>
                            <span className="text-gray-600">{t.timezoneSpain}:</span>
                            <span className="font-bold text-gray-900">15:00 - 23:30</span>
                          </div>
                          <div className="w-px h-4 bg-gray-300" />
                          <div className="flex items-center gap-2">
                            <span>🇧🇷</span>
                            <span className="text-gray-600">{t.timezoneBrazil}:</span>
                            <span className="font-bold text-gray-900">11:00 - 19:30</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {slots.find(s => s.isoDate === selectedIsoDate)?.times.map((time) => {
                          const brasiliaTime = madridToBrasilia(time)
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                                selectedTime === time
                                  ? 'border-primary-500 bg-primary-600 text-white shadow-md'
                                  : 'border-gray-100 hover:border-primary-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{time}</span>
                                <span className={`text-xs ${selectedTime === time ? 'text-white/70' : 'text-gray-400'}`}>
                                  ({brasiliaTime} 🇧🇷)
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-center py-4">{t.selectDate}</p>
                  )}
                </div>
              </div>

              {/* Step 3: Customer Info */}
              <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${selectedTime ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-white text-sm flex items-center justify-center ${selectedTime ? 'bg-primary-600' : 'bg-gray-300'}`}>3</span>
                    {t.step3}
                  </h2>
                </div>
                <div className="p-6">
                  {selectedTime ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.nameLabel} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'
                            } focus:ring-0 outline-none transition-colors`}
                            required
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.emailLabel} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder={t.emailPlaceholder}
                              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'
                              } focus:ring-0 outline-none transition-colors`}
                              required
                            />
                          </div>
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.phoneLabel} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className={`px-3 py-3 rounded-xl border-2 ${
                                errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'
                              } focus:ring-0 outline-none transition-colors text-sm`}
                            >
                              {countryCodes.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <div className="relative flex-1">
                              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s()-]/g, ''))}
                                placeholder={lang === 'pt' ? '11 99999-9999' : '612 345 678'}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'
                                } focus:ring-0 outline-none transition-colors`}
                                required
                              />
                            </div>
                          </div>
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {lang === 'pt' ? 'Número sem código do país' : 'Number without country code'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t.notesLabel}
                        </label>
                        <div className="relative">
                          <FaCommentDots className="absolute left-4 top-4 text-gray-400" />
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t.notesPlaceholder}
                            rows={3}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-0 outline-none resize-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">{t.selectTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-bold text-gray-900">{t.summary}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <span className="text-2xl">{serviceInfo.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{serviceInfo.title}</p>
                      <p className="text-sm text-gray-500">{serviceInfo.duration}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === 'pt' ? 'Data' : 'Date'}</span>
                      <span className="font-medium text-gray-900">{selectedDate || '—'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">{lang === 'pt' ? 'Horário' : 'Time'}</span>
                      {selectedTime ? (
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{selectedTime} 🇪🇸 Madrid</div>
                          <div className="text-xs text-gray-500">{madridToBrasilia(selectedTime)} 🇧🇷 {t.timezoneBrazil}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-900 font-semibold">{lang === 'pt' ? 'Total' : 'Total'}</span>
                      <span className="text-xl font-bold text-primary-600">{serviceInfo.price}</span>
                    </div>
                    {serviceInfo.price !== 'GRÁTIS' && serviceInfo.price !== 'FREE' && serviceInfo.price !== 'Cliente' && serviceInfo.price !== 'Client' && (
                      <p className="text-xs text-gray-500">{lang === 'pt' ? 'Pagamento após confirmação' : 'Payment after confirmation'}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={openFormModal}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {lang === 'pt' ? 'Agendando...' : 'Booking...'}
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {t.confirm}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    {t.termsAgree} <Link href={`/${lang}/terms`} className="text-primary-600 hover:underline">{t.termsLink}</Link> e <Link href={`/${lang}/privacy`} className="text-primary-600 hover:underline">{t.privacyLink}</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formModal}
    </main>
  )
}

export default function BookingPage({ params }: { params: { lang: 'pt' | 'en' } }) {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </main>
    }>
      <BookingContent params={params} />
    </Suspense>
  )
}