'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa'

const services = {
  pt: [
    {
      id: '30min-free',
      icon: '🎯',
      title: 'Consulta Gratuita',
      duration: '30 minutos',
      location: 'Online',
      price: 'GRÁTIS',
      isFree: true,
      description: 'Avaliação gratuita do seu caso de visto nômade digital na Espanha.',
      features: ['Análise de elegibilidade', 'Orientação inicial', 'Sem compromisso'],
      popular: false
    },
    {
      id: 'mentoria',
      icon: '💡',
      title: 'Mentoria Diagnóstico',
      duration: '60 minutos',
      location: 'Online',
      price: '€99',
      isFree: false,
      description: 'Sessão de diagnóstico completa. Taxa descontada do Nomad Visa se fechar.',
      features: ['Análise profunda do caso', 'Checklist personalizado', 'Plano de ação', 'Desconto no Nomad Visa'],
      popular: true,
      badge: 'Descontado se fechar'
    },
    {
      id: 'nomad-visa',
      icon: '🌍',
      title: 'Nomad Visa Completo',
      duration: 'Processo completo',
      location: 'Online + Presencial',
      price: '€1.499',
      isFree: false,
      description: 'Processo completo de visto nômade digital com acompanhamento total.',
      features: ['Análise completa', 'Montagem de documentos', 'Submissão da aplicação', 'Acompanhamento até aprovação'],
      popular: false
    },
    {
      id: 'nomad-visa-dependent',
      icon: '👨‍👩‍👧',
      title: 'Dependente Adicional',
      duration: 'Por pessoa',
      location: 'Online',
      price: '+€279',
      isFree: false,
      description: 'Adicionar dependente ao processo Nomad Visa.',
      features: ['Documentação do dependente', 'Inclusão na aplicação', 'Acompanhamento'],
      popular: false
    },
    {
      id: 'relocation',
      icon: '🏠',
      title: 'Relocation',
      duration: '60 minutos',
      location: 'Online/Presencial',
      price: '€99',
      isFree: false,
      description: 'Serviço de relocation - busca de moradia, abertura de conta, etc.',
      features: ['Busca de moradia', 'Abertura de conta bancária', 'Cadastro em serviços', 'Orientação local'],
      popular: false
    },
    {
      id: 'vip-inperson',
      icon: '⭐',
      title: 'VIP Presencial',
      duration: '2 horas',
      location: 'Barcelona',
      price: '€3.000',
      isFree: false,
      description: 'Consultoria VIP presencial em Barcelona com atendimento exclusivo.',
      features: ['Presencial em Barcelona', 'Análise completa', 'Acompanhamento VIP', 'Networking local'],
      popular: false
    },
    {
      id: '30min-followup',
      icon: '🔄',
      title: 'Acompanhamento',
      duration: '30 minutos',
      location: 'Online',
      price: 'Cliente',
      isFree: true,
      isClientOnly: true,
      description: 'Acompanhamento do seu processo - exclusivo para quem já contratou.',
      features: ['Dúvidas sobre o processo', 'Status da aplicação', 'Orientações adicionais'],
      popular: false
    }
  ],
  en: [
    {
      id: '30min-free',
      icon: '🎯',
      title: 'Free Consultation',
      duration: '30 minutes',
      location: 'Online',
      price: 'FREE',
      isFree: true,
      description: 'Free assessment of your digital nomad visa case for Spain.',
      features: ['Eligibility analysis', 'Initial guidance', 'No commitment'],
      popular: false
    },
    {
      id: 'mentoria',
      icon: '💡',
      title: 'Diagnostic Mentoring',
      duration: '60 minutes',
      location: 'Online',
      price: '€99',
      isFree: false,
      description: 'Complete diagnostic session. Fee discounted from Nomad Visa if you proceed.',
      features: ['Deep case analysis', 'Personalized checklist', 'Action plan', 'Discount on Nomad Visa'],
      popular: true,
      badge: 'Discounted if you proceed'
    },
    {
      id: 'nomad-visa',
      icon: '🌍',
      title: 'Nomad Visa Complete',
      duration: 'Full process',
      location: 'Online + In-person',
      price: '€1,499',
      isFree: false,
      description: 'Complete digital nomad visa process with full support.',
      features: ['Complete analysis', 'Document preparation', 'Application submission', 'Support until approval'],
      popular: false
    },
    {
      id: 'nomad-visa-dependent',
      icon: '👨‍👩‍👧',
      title: 'Additional Dependent',
      duration: 'Per person',
      location: 'Online',
      price: '+€279',
      isFree: false,
      description: 'Add dependent to Nomad Visa process.',
      features: ['Dependent documentation', 'Application inclusion', 'Support'],
      popular: false
    },
    {
      id: 'relocation',
      icon: '🏠',
      title: 'Relocation',
      duration: '60 minutes',
      location: 'Online/In-person',
      price: '€99',
      isFree: false,
      description: 'Relocation service - housing search, bank account opening, etc.',
      features: ['Housing search', 'Bank account opening', 'Service registration', 'Local orientation'],
      popular: false
    },
    {
      id: 'vip-inperson',
      icon: '⭐',
      title: 'VIP In-Person',
      duration: '2 hours',
      location: 'Barcelona',
      price: '€3,000',
      isFree: false,
      description: 'VIP in-person consultation in Barcelona with exclusive service.',
      features: ['In-person in Barcelona', 'Complete analysis', 'VIP support', 'Local networking'],
      popular: false
    },
    {
      id: '30min-followup',
      icon: '🔄',
      title: 'Follow-up Session',
      duration: '30 minutes',
      location: 'Online',
      price: 'Client',
      isFree: true,
      isClientOnly: true,
      description: 'Follow-up on your process - exclusive for existing clients.',
      features: ['Process questions', 'Application status', 'Additional guidance'],
      popular: false
    }
  ]
}

const content = {
  pt: {
    title: 'Agende sua Consultoria',
    subtitle: 'Consultoria especializada em visto nômade digital para a Espanha',
    selectService: 'Selecione o tipo de consultoria',
    button: 'Continuar',
    buttonDisabled: 'Selecione uma consultoria',
    step1: '1. Escolha o Serviço',
    step2: '2. Escolha Data e Horário',
    popular: 'Mais popular',
    forClients: 'Para clientes',
    includes: 'Inclui',
    backHome: 'Voltar ao início'
  },
  en: {
    title: 'Schedule Your Consultation',
    subtitle: 'Specialized consulting on digital nomad visa for Spain',
    selectService: 'Select the type of consultation',
    button: 'Continue',
    buttonDisabled: 'Select a consultation',
    step1: '1. Choose Service',
    step2: '2. Choose Date & Time',
    popular: 'Most popular',
    forClients: 'For clients',
    includes: 'Includes',
    backHome: 'Back to home'
  }
}

export default function AgendamentoPage({ params }: { params: { lang: 'pt' | 'en' } }) {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const lang = params.lang || 'pt'

  const t = content[lang]
  const serviceList = services[lang]

  const handleSelect = (id: string) => {
    setSelectedService(id)
  }

  const handleSchedule = () => {
    if (selectedService) {
      window.location.href = `/${lang}/agendamento/booking?service=${selectedService}`
    }
  }

  const selectedServiceData = serviceList.find(s => s.id === selectedService)

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full blur-[100px] opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-primary-50 to-primary-100 rounded-full blur-[80px] opacity-30" />

      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 transition-colors font-medium"
          >
            <FaArrowLeft className="text-sm" />
            {t.backHome}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-600 rounded-full text-white text-sm flex items-center justify-center font-bold">1</span>
            <span className="font-medium text-gray-900">{t.step1}</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded">
            <div className="h-1 bg-gray-200 rounded w-0" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-200 rounded-full text-gray-500 text-sm flex items-center justify-center font-bold">2</span>
            <span className="font-medium text-gray-400">{t.step2}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Service Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.selectService}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {serviceList.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleSelect(service.id)}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                    selectedService === service.id
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-md'
                  }`}
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <span className="absolute -top-2 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t.popular}
                    </span>
                  )}
                  {/* Discount Badge */}
                  {service.badge && (
                    <span className="absolute -top-2 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {service.badge}
                    </span>
                  )}
                  {/* Client Only Badge */}
                  {service.isClientOnly && (
                    <span className="absolute -top-2 right-4 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t.forClients}
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{service.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${
                        selectedService === service.id ? 'text-primary-600' : 'text-gray-900'
                      }`}>
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {service.location}
                        </span>
                      </div>
                      <p className={`text-2xl font-bold ${
                        service.isFree 
                          ? 'text-green-600' 
                          : selectedService === service.id 
                            ? 'text-primary-600' 
                            : 'text-gray-900'
                      }`}>
                        {service.price}
                      </p>
                    </div>
                    {selectedService === service.id && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">{service.description}</p>
                  
                  {selectedService === service.id && (
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t.includes}:</p>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <FaCheck className="text-primary-500 text-xs" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900">Resumo</h2>
              </div>
              <div className="p-6">
                {selectedServiceData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <span className="text-2xl">{selectedServiceData.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedServiceData.title}</p>
                        <p className="text-sm text-gray-500">{selectedServiceData.duration} • {selectedServiceData.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">{lang === 'pt' ? 'Total' : 'Total'}</span>
                      <span className={`text-xl font-bold ${
                        selectedServiceData.isFree ? 'text-green-600' : 'text-primary-600'
                      }`}>
                        {selectedServiceData.price}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleSchedule}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FaCalendarAlt />
                      {t.button}
                      <FaArrowRight />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500">{t.buttonDisabled}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}