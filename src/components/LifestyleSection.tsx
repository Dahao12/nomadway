'use client'

import Image from 'next/image'
import { FaCheckCircle, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa'

interface LifestyleSectionProps {
  locale: string
}

export default function LifestyleSection({ locale }: LifestyleSectionProps) {
  const content = locale === 'pt' ? {
    title: 'Viva a Experiência Nômade Digital na Espanha',
    subtitle: 'Descubra como é a vida de quem realizou o sonho de viver e trabalhar na Europa',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
        alt: 'Trabalho remoto em Barcelona',
        label: 'Trabalho Remoto',
        location: 'Barcelona'
      },
      {
        src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
        alt: 'Família em Madrid',
        label: 'Vida em Família',
        location: 'Madrid'
      },
      {
        src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
        alt: 'Networking Valencia',
        label: 'Networking',
        location: 'Valencia'
      },
      {
        src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
        alt: 'Lifestyle Barcelona',
        label: 'Lifestyle',
        location: 'Barcelona'
      }
    ],
    benefits: [
      'Conexão com uma comunidade ativa de nômades digitais',
      'Acesso a eventos, meetups e oportunidades de networking',
      'Suporte completo para sua integração cultural'
    ],
    cta: 'Começar Minha Jornada'
  } : {
    title: 'Experience Digital Nomad Life in Spain',
    subtitle: 'Discover what life is like for those who made the dream of living and working in Europe come true',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
        alt: 'Remote work in Barcelona',
        label: 'Remote Work',
        location: 'Barcelona'
      },
      {
        src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
        alt: 'Family in Madrid',
        label: 'Family Life',
        location: 'Madrid'
      },
      {
        src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
        alt: 'Networking Valencia',
        label: 'Networking',
        location: 'Valencia'
      },
      {
        src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
        alt: 'Lifestyle Barcelona',
        label: 'Lifestyle',
        location: 'Barcelona'
      }
    ],
    benefits: [
      'Connection with an active community of digital nomads',
      'Access to events, meetups and networking opportunities',
      'Complete support for your cultural integration'
    ],
    cta: 'Start My Journey'
  }

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {content.images.map((image, idx) => (
            <div
              key={idx}
              className={`relative group overflow-hidden rounded-2xl shadow-lg ${
                idx === 0 || idx === 3 ? 'h-64 sm:h-80' : 'h-64 sm:h-80'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <FaBriefcase className="text-primary-400" />
                  <span className="text-sm font-semibold text-white">
                    {image.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <FaMapMarkerAlt className="text-primary-400" />
                  {image.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-3xl p-8 sm:p-12 border border-primary-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {content.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <FaCheckCircle className="text-primary-600 text-xl mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}