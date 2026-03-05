'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FaArrowRight, FaWhatsapp, FaStar, FaUsers, FaAward, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'

interface HeroProps {
  dict: any
  locale: string
}

export default function Hero({ dict, locale }: HeroProps) {
  const [animated, setAnimated] = useState(false)
  const [countsAnimated, setCountsAnimated] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Fade-in animation on mount
  useEffect(() => {
    setAnimated(true)
  }, [])

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countsAnimated) {
            setCountsAnimated(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [countsAnimated])

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80"
          alt="Barcelona Cityscape"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70" />
        
        {/* Animated gradient orbs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-200 to-primary-300 rounded-full blur-[120px] opacity-40 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-6 border border-primary-200 transition-all duration-1000 ${
                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <FaStar className="text-primary-600 text-sm" />
              <span className="text-sm font-semibold text-gray-700">
                {locale === 'pt' ? '#1 em Consultoria de Nômades Digitais na Espanha' : '#1 Digital Nomad Consulting in Spain'}
              </span>
            </div>

            {/* Main Title */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-1000 delay-150 ${
                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {dict.hero.title}
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed transition-all duration-1000 delay-300 ${
                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {dict.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 mb-10 transition-all duration-1000 delay-500 ${
                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Link
                href={`/${locale}/agendamento/booking?service=30min-free`}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <FaCalendarAlt size={22} />
                <span>{dict.hero.cta}</span>
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/services`}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-full font-bold hover:bg-primary-50 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/80 backdrop-blur-sm"
              >
                <span>{dict.hero.secondary_cta}</span>
              </Link>
            </div>

            {/* Trust Badges - Inline */}
            <div
              className={`flex flex-wrap gap-6 transition-all duration-1000 delay-700 ${
                animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {locale === 'pt' ? '+200 Clientes' : '+200 Clients'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xs" />
                  ))}
                </div>
                <span className="text-sm text-gray-700 font-medium">5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="text-primary-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {locale === 'pt' ? '98% Sucesso' : '98% Success'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div
            className={`relative transition-all duration-1000 delay-500 ${
              animated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80"
                alt="Digital Nomad Working in Barcelona"
                fill
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent" />
            </div>
            
            {/* Floating Card - Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaUsers className="text-primary-600 text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2.000+</div>
                  <div className="text-sm text-gray-600">
                    {locale === 'pt' ? 'Nômades Conectados' : 'Nomads Connected'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          ref={heroRef}
          className={`grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-900 ${
            animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { value: '200+', label: locale === 'pt' ? 'Clientes Satisfeitos' : 'Happy Clients', icon: FaUsers },
            { value: '98%', label: locale === 'pt' ? 'Taxa de Sucesso' : 'Success Rate', icon: FaCheckCircle },
            { value: '2K+', label: locale === 'pt' ? 'Nômades Conectados' : 'Nomads Network', icon: FaStar },
            { value: '10', label: locale === 'pt' ? 'Países Atendidos' : 'Countries Served', icon: FaAward },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center border border-gray-100"
            >
              <stat.icon className="mx-auto text-primary-600 text-2xl mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent -z-10" />
    </section>
  )
}