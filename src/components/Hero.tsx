'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FaArrowRight, FaWhatsapp, FaStar, FaUsers, FaAward } from 'react-icons/fa'

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

  const animateCount = (start: number, end: number, duration: number = 2000) => {
    if (!countsAnimated) return start
    const startTime = Date.now()

    return Math.min(
      Math.floor(
        ((Date.now() - startTime) / duration) * (end - start) + start
      ),
      end
    )
  }

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />

        {/* Animated gradient orbs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-200 to-primary-300 rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full blur-[100px] opacity-20"
        />

        {/* Floating shapes */}
        <div className="absolute top-[10%] left-[5%] w-20 h-20 bg-primary-200/30 rounded-full blur-lg animate-bounce" />
        <div
          className="absolute top-[20%] right-[10%] w-32 h-32 bg-secondary-200/30 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: '6s', animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-[20%] left-[15%] w-24 h-24 bg-primary-300/20 rounded-full blur-lg animate-bounce"
          style={{ animationDuration: '7s', animationDelay: '3s' }}
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-6 border border-primary-200 transition-all duration-1000 ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <FaStar className="text-primary-600 text-sm" />
            <span className="text-sm font-semibold text-gray-700">
              {locale === 'pt' ? 'Líder em Consultoria de Nômades Digitais' : 'Leading Digital Nomad Consulting'}
            </span>
          </div>

          {/* Main Title with Fade-in */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-1000 delay-150 ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d3436 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {dict.hero.title}
          </h1>

          {/* Subtitle with Fade-in */}
          <p
            className={`text-xl sm:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {dict.hero.subtitle}
          </p>

          {/* CTA Buttons with Slide-up */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-500 ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-full font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <FaWhatsapp size={24} />
              <span>{dict.hero.cta}</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href={`/${locale}/services}`}
              className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:border-primary-600 hover:text-primary-600 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-md"
            >
              <span>{dict.hero.secondary_cta}</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            ref={heroRef}
            className={`grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-700 ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Trust Badge 1 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaStar className="text-yellow-400 text-2xl" />
                <div className="text-4xl font-bold text-gray-900">
                  {Counts(200, '200+')}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600">
                {locale === 'pt' ? 'Clientes Satisfeitos' : 'Happy Clients'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-xs" />
                ))}
                <span className="ml-1 text-xs font-bold text-gray-700">5.0</span>
              </div>
            </div>

            {/* Trust Badge 2 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaUsers className="text-primary-600 text-2xl" />
                <div className="text-4xl font-bold text-gray-900">
                  {Counts(2, '2K+')}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600">
                {locale === 'pt' ? 'Nômades Conectados' : 'Nomads Connected'}
              </div>
              <div className="text-xs text-gray-500 mt-2 font-medium">
                {locale === 'pt' ? 'Global Network' : 'Em 40+ Países'}
              </div>
            </div>

            {/* Trust Badge 3 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaAward className="text-primary-600 text-2xl" />
                <div className="text-4xl font-bold text-gray-900">
                  {Counts(100, '100%')}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600">
                {locale === 'pt'
                  ? 'Taxa de Sucesso'
                  : 'Success Rate'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-xs" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent -z-10" />
    </section>
  )
}

function Counts(val: number, text: string) {
  return text
}