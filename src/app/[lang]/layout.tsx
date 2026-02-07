import type { Metadata } from 'next'
import { getDictionary } from '@/lib/getDictionary'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { locales } from '@/config/i18n'

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang as 'pt' | 'en')
  
  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: {
      canonical: `/${params.lang}`,
      languages: {
        'pt': '/pt',
        'en': '/en',
      },
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  return (
    <>
      <Header dict={dict} locale={params.lang} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer dict={dict} locale={params.lang} />
    </>
  )
}
