'use client'

import { FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

interface ContactFormProps {
  dict: any
  locale: string
}

export default function ContactForm({ dict, locale }: ContactFormProps) {
  const offices = locale === 'pt' ? [
    { city: 'Barcelona', address: 'Espanha', flag: '🇪🇸' },
    { city: 'Madrid', address: 'Espanha', flag: '🇪🇸' },
    { city: 'Toledo', address: 'Espanha', flag: '🇪🇸' },
  ] : [
    { city: 'Barcelona', address: 'Spain', flag: '🇪🇸' },
    { city: 'Madrid', address: 'Spain', flag: '🇪🇸' },
    { city: 'Toledo', address: 'Spain', flag: '🇪🇸' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Contact Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-3xl p-8 sm:p-12 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          {locale === 'pt' ? 'Vamos Conversar!' : 'Let\'s Talk!'}
        </h2>
        <p className="text-primary-100 text-lg mb-8">
          {locale === 'pt' 
            ? 'Estamos prontos para ajudar você a realizar seu sonho de viver na Espanha.'
            : 'We\'re ready to help you achieve your dream of living in Spain.'}
        </p>

        {/* Agendamento Button */}
        <a
          href={`/${locale}/agendamento/booking?service=30min-free`}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-primary-600 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          📅
          {locale === 'pt' ? 'Agendar Consulta Gratuita' : 'Schedule Free Consultation'}
        </a>

        <p className="mt-4 text-primary-200 text-sm">
          {locale === 'pt' ? '30 minutos • Sem compromisso' : '30 minutes • No commitment'}
        </p>
      </div>

      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Email */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 transition-colors">
          <div className="p-3 bg-secondary-100 text-secondary-600 rounded-xl w-fit mb-4">
            <FaEnvelope size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
          <a
            href={`mailto:${dict.contact.info.email}`}
            className="text-primary-600 hover:text-primary-700 text-sm break-all"
          >
            {dict.contact.info.email}
          </a>
        </div>

        {/* Schedule */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 transition-colors">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl w-fit mb-4">
            <FaClock size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {locale === 'pt' ? 'Horário' : 'Hours'}
          </h3>
          <p className="text-gray-600 text-sm">{dict.contact.info.hours}</p>
        </div>

        {/* Location */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 transition-colors sm:col-span-2">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl w-fit mb-4">
            <FaMapMarkerAlt size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {locale === 'pt' ? 'Escritórios' : 'Offices'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {offices.map((office) => (
              <div
                key={office.city}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full"
              >
                <span className="text-lg">{office.flag}</span>
                <span className="text-gray-700 font-medium">{office.city}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
