'use client'

import { useState } from 'react'
import { FaEnvelope, FaWhatsapp, FaUser, FaPhone, FaPaperPlane } from 'react-icons/fa'

interface ContactFormProps {
  dict: any
  locale: string
}

export default function ContactForm({ dict, locale }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const formElement = e.target as HTMLFormElement
    const formData = new FormData(formElement)

    // Add FormSubmit configuration
    formData.append('_subject', `Contato NomadWay - ${formData.get('name')}`)

    try {
      const response = await fetch('https://formsubmit.co/ajax/contato@nomadway.com', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', phone: '', service: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Contact Form */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {locale === 'pt' ? 'Envie sua Mensagem' : 'Send Your Message'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6" method="POST">
          {/* Honeypot for spam protection */}
          <input type="text" name="_honey" style={{ display: 'none' }} />
          {/* Disable captcha */}
          <input type="hidden" name="_captcha" value="false" />
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.contact.form.name} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="João Silva"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.contact.form.email} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="joao@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.contact.form.phone}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+351 912 345 678"
              />
            </div>
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.contact.form.service}
            </label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">{locale === 'pt' ? 'Selecione um serviço' : 'Select a service'}</option>
              <option value="visa">{locale === 'pt' ? 'Consultoria de Visto' : 'Visa Consulting'}</option>
              <option value="tax">{locale === 'pt' ? 'Mentoria Fiscal' : 'Tax Mentorship'}</option>
              <option value="planning">{locale === 'pt' ? 'Planejamento Completo' : 'Complete Planning'}</option>
              <option value="other">{locale === 'pt' ? 'Outro' : 'Other'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              {dict.contact.form.message} *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder={locale === 'pt' 
                ? 'Conte-nos sobre sua situação e como podemos ajudar...' 
                : 'Tell us about your situation and how we can help...'}
            />
          </div>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {dict.contact.form.success}
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {dict.contact.form.error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <FaPaperPlane />
            {status === 'loading' 
              ? (locale === 'pt' ? 'Enviando...' : 'Sending...') 
              : dict.contact.form.submit}
          </button>
        </form>
      </div>

      {/* Contact Information */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {locale === 'pt' ? 'Outras Formas de Contato' : 'Other Ways to Contact'}
        </h2>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 border border-primary-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-600 text-white rounded-lg">
                <FaWhatsapp size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {locale === 'pt' ? 'Fale conosco agora' : 'Talk to us now'}
                </p>
                <a
                  href={`https://wa.me/${dict.contact.info.whatsapp.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:text-primary-700"
                >
                  {dict.contact.info.whatsapp}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl p-6 border border-secondary-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-600 text-white rounded-lg">
                <FaEnvelope size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {locale === 'pt' ? 'Resposta em até 24h' : 'Response within 24h'}
                </p>
                <a
                  href={`mailto:${dict.contact.info.email}`}
                  className="text-secondary-600 font-semibold hover:text-secondary-700 break-all"
                >
                  {dict.contact.info.email}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              {locale === 'pt' ? 'Horário de Atendimento' : 'Office Hours'}
            </h3>
            <p className="text-gray-700">{dict.contact.info.hours}</p>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl p-6">
            <h3 className="font-semibold mb-3">
              {locale === 'pt' ? '🎯 Consulta Gratuita' : '🎯 Free Consultation'}
            </h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              {locale === 'pt' 
                ? 'Agende uma conversa de 30 minutos sem compromisso para entender como podemos ajudar você a realizar seu sonho de viver na Espanha.'
                : 'Schedule a 30-minute conversation with no obligation to understand how we can help you achieve your dream of living in Spain.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
