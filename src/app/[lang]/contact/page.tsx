import { getDictionary } from '@/lib/getDictionary'
import ContactForm from '@/components/ContactForm'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang as 'pt' | 'en')
  
  return {
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
    alternates: {
      canonical: `/${params.lang}/contact`,
      languages: {
        'pt': '/pt/contact',
        'en': '/en/contact',
      },
    },
  }
}

export default async function ContactPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {dict.contact.title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {dict.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <ContactForm dict={dict} locale={params.lang} />
        </div>
      </section>
    </>
  )
}
