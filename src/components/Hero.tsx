import Link from 'next/link'
import { FaArrowRight, FaWhatsapp } from 'react-icons/fa'

interface HeroProps {
  dict: any
  locale: string
}

export default function Hero({ dict, locale }: HeroProps) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {dict.hero.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {dict.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FaWhatsapp size={20} />
              {dict.hero.cta}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-primary-600 hover:text-primary-600 transition-all"
            >
              {dict.hero.secondary_cta}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">
                  {locale === 'pt' ? 'Clientes Atendidos' : 'Clients Served'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">98%</div>
                <div className="text-sm text-gray-600">
                  {locale === 'pt' ? 'Taxa de Aprovação' : 'Approval Rate'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">5★</div>
                <div className="text-sm text-gray-600">
                  {locale === 'pt' ? 'Avaliação Média' : 'Average Rating'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
