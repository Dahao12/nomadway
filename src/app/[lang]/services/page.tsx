import { getDictionary } from '@/lib/getDictionary'
import CTASection from '@/components/CTASection'
import type { Metadata } from 'next'
import { FaPassport, FaCalculator, FaMapMarkedAlt, FaCheckCircle } from 'react-icons/fa'

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang as 'pt' | 'en')
  
  return {
    title: dict.meta.services.title,
    description: dict.meta.services.description,
    alternates: {
      canonical: `/${params.lang}/services`,
      languages: {
        'pt': '/pt/services',
        'en': '/en/services',
      },
    },
  }
}

export default async function ServicesPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {dict.services.title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {dict.services.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* Visa Consulting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white mb-6">
                  <FaPassport size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {dict.services.consulting.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {dict.services.consulting.description}
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {params.lang === 'pt' ? 'O que está incluído:' : 'What\'s included:'}
                  </h3>
                  <ul className="space-y-3">
                    {dict.services.consulting.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 lg:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {params.lang === 'pt' ? 'Visto de Nômade Digital' : 'Digital Nomad Visa'}
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    {params.lang === 'pt' 
                      ? 'O visto de nômade digital espanhol permite que profissionais remotos vivam legalmente na Espanha por até 3 anos (1 ano inicial + 2 anos de renovação).'
                      : 'The Spanish digital nomad visa allows remote professionals to live legally in Spain for up to 3 years (1 initial year + 2 year renewal).'}
                  </p>
                  <p className="leading-relaxed font-semibold">
                    {params.lang === 'pt' ? 'Requisitos principais:' : 'Main requirements:'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• {params.lang === 'pt' ? 'Renda mínima de €2.334/mês (200% do IPREM)' : 'Minimum income of €2,334/month (200% of IPREM)'}</li>
                    <li>• {params.lang === 'pt' ? 'Contrato de trabalho remoto ou empresa própria' : 'Remote work contract or own company'}</li>
                    <li>• {params.lang === 'pt' ? 'Seguro de saúde válido na Espanha' : 'Valid health insurance in Spain'}</li>
                    <li>• {params.lang === 'pt' ? 'Comprovante de moradia' : 'Proof of housing'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tax Mentorship */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl p-8 lg:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {params.lang === 'pt' ? 'Lei Beckham' : 'Beckham Law'}
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    {params.lang === 'pt' 
                      ? 'A Lei Beckham é um regime fiscal especial que permite tributar apenas a renda obtida na Espanha, com alíquota fixa de 24% até €600k.'
                      : 'The Beckham Law is a special tax regime that allows taxation only on income obtained in Spain, with a flat rate of 24% up to €600k.'}
                  </p>
                  <p className="leading-relaxed font-semibold">
                    {params.lang === 'pt' ? 'Benefícios:' : 'Benefits:'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• {params.lang === 'pt' ? 'Economia significativa de impostos' : 'Significant tax savings'}</li>
                    <li>• {params.lang === 'pt' ? 'Renda estrangeira não tributada' : 'Foreign income not taxed'}</li>
                    <li>• {params.lang === 'pt' ? 'Válido por até 6 anos' : 'Valid for up to 6 years'}</li>
                    <li>• {params.lang === 'pt' ? 'Compatível com visto de nômade digital' : 'Compatible with digital nomad visa'}</li>
                  </ul>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-secondary-600 to-secondary-800 text-white mb-6">
                  <FaCalculator size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {dict.services.mentorship.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {dict.services.mentorship.description}
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {params.lang === 'pt' ? 'O que está incluído:' : 'What\'s included:'}
                  </h3>
                  <ul className="space-y-3">
                    {dict.services.mentorship.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Complete Planning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white mb-6">
                  <FaMapMarkedAlt size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {dict.services.planning.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {dict.services.planning.description}
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {params.lang === 'pt' ? 'O que está incluído:' : 'What\'s included:'}
                  </h3>
                  <ul className="space-y-3">
                    {dict.services.planning.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 lg:p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {params.lang === 'pt' ? 'Principais Cidades' : 'Top Cities'}
                </h3>
                <div className="space-y-6">
                  {[
                    { city: params.lang === 'pt' ? 'Barcelona' : 'Barcelona', cost: '€1.500-2.500/mês' },
                    { city: params.lang === 'pt' ? 'Madri' : 'Madrid', cost: '€1.400-2.300/mês' },
                    { city: params.lang === 'pt' ? 'Valencia' : 'Valencia', cost: '€1.200-2.000/mês' },
                    { city: params.lang === 'pt' ? 'Málaga' : 'Málaga', cost: '€1.100-1.800/mês' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">{item.city}</span>
                      <span className="text-sm text-gray-600">{item.cost}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {params.lang === 'pt' 
                    ? '* Custo médio de vida incluindo moradia, alimentação e transporte'
                    : '* Average cost of living including housing, food and transport'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection dict={dict} locale={params.lang} />
    </>
  )
}
