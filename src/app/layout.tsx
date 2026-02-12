import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://nomadway.com'),
  title: 'NomadWay - Consultoria para Nômades Digitais na Espanha',
  description: 'Consultoria especializada em visto de nômade digital, Lei Beckham e planejamento completo para viver e trabalhar na Espanha.',
  icons: {
    icon: '/favicon.png',
  },
  keywords: ['nômade digital', 'visto espanha', 'lei beckham', 'consultoria', 'mentoria'],
  authors: [{ name: 'NomadWay' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://nomadway.com',
    siteName: 'NomadWay',
    images: [
      {
        url: 'https://www.genspark.ai/api/files/s/rS50LjmW?cache_control=3600',
        width: 1200,
        height: 630,
        alt: 'NomadWay Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadWay - Consultoria para Nômades Digitais na Espanha',
    description: 'Consultoria especializada em visto de nômade digital, Lei Beckham e planejamento completo.',
    images: ['https://www.genspark.ai/api/files/s/rS50LjmW?cache_control=3600'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
