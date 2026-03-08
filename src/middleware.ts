import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que precisam de idioma
const routesWithLang = [
  '/agendamento',
  '/booking',
  '/servicos',
  '/services',
  '/sobre',
  '/about',
  '/contato',
  '/contact',
  '/precos',
  '/pricing',
]

// Detectar idioma do navegador
function getPreferredLanguage(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  
  if (acceptLanguage.includes('pt') || acceptLanguage.includes('pt-BR')) {
    return 'pt'
  }
  
  return 'en'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Ignorar arquivos estáticos e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // Se a rota já tem idioma, continuar
  if (pathname.startsWith('/pt') || pathname.startsWith('/en')) {
    return NextResponse.next()
  }

  // Se a rota precisa de idioma, redirecionar
  if (routesWithLang.some(route => pathname.startsWith(route))) {
    const lang = getPreferredLanguage(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}${pathname}`
    return NextResponse.redirect(url)
  }

  // Se está na raiz, redirecionar para idioma preferido
  if (pathname === '/' || pathname === '') {
    const lang = getPreferredLanguage(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}