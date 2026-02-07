import { getDictionary } from '@/lib/getDictionary'
import Hero from '@/components/Hero'
import CTASection from '@/components/CTASection'
import { FaCheckCircle, FaUsers, FaNetworkWired, FaTrophy, FaPassport, FaCalculator, FaMapMarkedAlt } from 'react-icons/fa'

export default async function HomePage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  return (
    <>
      <Hero dict={dict} locale={params.lang} />

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {dict.benefits.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {dict.benefits.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaTrophy, key: 'expertise' as const, color: 'primary' },
              { icon: FaUsers, key: 'support' as const, color: 'secondary' },
              { icon: FaNetworkWired, key: 'network' as const, color: 'primary' },
              { icon: FaCheckCircle, key: 'success' as const, color: 'secondary' },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl bg-${item.color}-100 text-${item.color}-600 mb-4`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dict.benefits.items[item.key].title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {dict.benefits.items[item.key].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {dict.services.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {dict.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FaPassport, key: 'consulting' as const, gradient: 'from-primary-600 to-primary-800' },
              { icon: FaCalculator, key: 'mentorship' as const, gradient: 'from-secondary-600 to-secondary-800' },
              { icon: FaMapMarkedAlt, key: 'planning' as const, gradient: 'from-primary-600 to-primary-800' },
            ].map((service) => (
              <div
                key={service.key}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.gradient} text-white mb-6`}>
                  <service.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {dict.services[service.key].title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {dict.services[service.key].description}
                </p>
                <ul className="space-y-2">
                  {dict.services[service.key].features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {dict.testimonials.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dict.testimonials.items.map((testimonial: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-6 relative"
              >
                <div className="text-5xl text-primary-200 mb-4">"</div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-primary-600">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection dict={dict} locale={params.lang} />
    </>
  )
}
