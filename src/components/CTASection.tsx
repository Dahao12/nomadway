import Link from 'next/link'
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa'

interface CTASectionProps {
  dict: any
  locale: string
}

export default function CTASection({ dict, locale }: CTASectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {dict.cta.title}
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-10 leading-relaxed">
            {dict.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <FaWhatsapp size={24} />
            {dict.cta.button}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
