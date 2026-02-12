'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaCheckCircle, FaUsers, FaNetworkWired, FaTrophy, FaPassport, FaCalculator, FaMapMarkedAlt, FaStar, FaAward } from 'react-icons/fa'

interface HeroProps {
  dict: any
  locale: string
}

// Stats counter hook
function useCountUp(end: number, duration: number = 2000, decimals: number = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = end * easeOutQuart

      if (progress < 1) {
        setCount(currentCount)
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return count.toFixed(decimals)
}

function Hero({ dict, locale }: HeroProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const stats = [
    { value: 2000, label: 'Active Members', icon: FaUsers },
    { value: 500, label: 'Connections Made', icon: FaNetworkWired },
    { value: 40, label: 'Countries', icon: FaMapMarkedAlt },
  ]

  return (
    <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden min-h-screen flex items-center">
      {/* Parallax Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-primary-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[5%] w-[500px] h-[500px] bg-secondary-200/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-block px-4 py-2 bg-primary-600/10 rounded-full mb-6 border border-primary-200 transition-all duration-1000 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-sm font-bold text-primary-600">
              {locale === 'pt' ? '🧭 LÍDER EM NÔMADES DIGITAIS' : '🧭 LEADING DIGITAL NOMAD PLATFORM'}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {dict.hero.title}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl sm:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {dict.hero.subtitle}
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-600 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              {dict.hero.cta}
            </Link>
            <Link
              href={`/${locale}/services}`}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-primary-600 hover:text-primary-600 transition-all hover:scale-105 active:scale-95"
            >
              {dict.hero.secondary_cta}
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-800 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              {
                value: 2000,
                label: 'Active Members',
                icon: FaUsers,
                color: 'primary',
                rating: null,
              },
              {
                value: 500,
                label: 'Connections Made',
                icon: FaNetworkWired,
                color: 'primary',
                rating: null,
              },
              {
                value: 40,
                label: 'Countries',
                icon: FaMapMarkedAlt,
                color: 'primary',
                rating: '⭐ 4.8',
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-100"
              >
                <stat.icon size={32} className="text-primary-600 mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {useCountUp(stat.value, 2000, 0)}+
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-2">{stat.label}</div>
                {stat.rating && (
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Google/Apple Store Ratings */}
          <div
            className={`flex justify-center gap-6 mb-8 transition-all duration-1000 delay-1000 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              {
                title: 'Google Play',
                rating: '4.8',
                reviews: '2.1K+',
              },
              {
                title: 'App Store',
                rating: '5.0',
                reviews: '3.8K+',
              },
            ].map((store, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-md rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="text-sm font-bold text-gray-600 mb-2">{store.title}</div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                  <span className="text-lg font-bold text-gray-900">{store.rating}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{store.reviews} reviews</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero