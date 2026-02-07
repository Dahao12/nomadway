import { getDictionary } from '@/lib/getDictionary'
import CTASection from '@/components/CTASection'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaCheckCircle, FaStar } from 'react-icons/fa'

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang as 'pt' | 'en')
  
  return {
    title: dict.meta.pricing.title,
    description: dict.meta.pricing.description,
    alternates: {
      canonical: `/${params.lang}/pricing`,
      languages: {
        'pt': '/pt/pricing',
        'en': '/en/pricing',
      },
    },
  }
}

export default async function PricingPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  const plans = [
    {
      key: 'basic' as const,
      color: 'gray',
      popular: false,
    },
    {
      key: 'pro' as const,
      color: 'primary',
      popular: true,
    },
    {
      key: 'vip' as const,
      color: 'secondary',
      popular: false,
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {dict.pricing.title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {dict.pricing.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const planData = dict.pricing[plan.key]
              const isPopular = plan.popular
              
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl ${
                    isPopular
                      ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-2xl scale-105 z-10'
                      : 'bg-white border-2 border-gray-200 shadow-lg'
                  } p-8 transition-all hover:shadow-xl`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1 bg-secondary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        <FaStar size={12} />
                        {params.lang === 'pt' ? 'MAIS POPULAR' : 'MOST POPULAR'}
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                      {planData.name}
                    </h3>
                    <div className={`text-4xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-primary-600'}`}>
                      {planData.price}
                    </div>
                    <p className={`text-sm ${isPopular ? 'text-primary-100' : 'text-gray-600'}`}>
                      {planData.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {planData.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FaCheckCircle
                          className={`mt-0.5 flex-shrink-0 ${
                            isPopular ? 'text-secondary-300' : 'text-green-500'
                          }`}
                        />
                        <span className={`text-sm ${isPopular ? 'text-white' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/${params.lang}/contact`}
                    className={`block w-full text-center py-3 px-6 rounded-full font-semibold transition-all ${
                      isPopular
                        ? 'bg-white text-primary-600 hover:bg-gray-50'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {planData.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {params.lang === 'pt' ? 'Informações Importantes' : 'Important Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div className="space-y-3">
                  <div>
                    <strong className="block text-gray-900 mb-1">
                      {params.lang === 'pt' ? '💳 Formas de Pagamento' : '💳 Payment Methods'}
                    </strong>
                    <p>{params.lang === 'pt' 
                      ? 'Cartão de crédito, débito, PIX ou transferência internacional'
                      : 'Credit card, debit, PIX or international transfer'
                    }</p>
                  </div>
                  <div>
                    <strong className="block text-gray-900 mb-1">
                      {params.lang === 'pt' ? '🔄 Política de Reembolso' : '🔄 Refund Policy'}
                    </strong>
                    <p>{params.lang === 'pt' 
                      ? 'Garantia de satisfação de 14 dias para o plano Consultoria Inicial'
                      : '14-day satisfaction guarantee for Initial Consulting plan'
                    }</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <strong className="block text-gray-900 mb-1">
                      {params.lang === 'pt' ? '📅 Agendamento' : '📅 Scheduling'}
                    </strong>
                    <p>{params.lang === 'pt' 
                      ? 'Primeira sessão agendada em até 48h após confirmação do pagamento'
                      : 'First session scheduled within 48h after payment confirmation'
                    }</p>
                  </div>
                  <div>
                    <strong className="block text-gray-900 mb-1">
                      {params.lang === 'pt' ? '🎁 Bônus Exclusivos' : '🎁 Exclusive Bonuses'}
                    </strong>
                    <p>{params.lang === 'pt' 
                      ? 'Todos os planos incluem acesso ao nosso material digital exclusivo'
                      : 'All plans include access to our exclusive digital material'
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {params.lang === 'pt' ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}
            </h3>
            <div className="space-y-6">
              {[
                {
                  q: params.lang === 'pt' 
                    ? 'Posso mudar de plano depois?' 
                    : 'Can I change plans later?',
                  a: params.lang === 'pt'
                    ? 'Sim! Você pode fazer upgrade do seu plano a qualquer momento e pagará apenas a diferença.'
                    : 'Yes! You can upgrade your plan at any time and pay only the difference.',
                },
                {
                  q: params.lang === 'pt' 
                    ? 'Vocês garantem a aprovação do visto?' 
                    : 'Do you guarantee visa approval?',
                  a: params.lang === 'pt'
                    ? 'Não garantimos aprovação (ninguém pode fazer isso), mas temos 98% de taxa de sucesso com nossos clientes.'
                    : 'We don\'t guarantee approval (no one can do that), but we have a 98% success rate with our clients.',
                },
                {
                  q: params.lang === 'pt' 
                    ? 'O que não está incluído?' 
                    : 'What\'s not included?',
                  a: params.lang === 'pt'
                    ? 'Taxas governamentais, honorários de advogados/contadores terceirizados, custos de tradução juramentada e viagens não estão incluídos.'
                    : 'Government fees, third-party lawyer/accountant fees, sworn translation costs and travel are not included.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection dict={dict} locale={params.lang} />
    </>
  )
}
