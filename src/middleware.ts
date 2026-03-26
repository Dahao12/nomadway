import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (admin-only)
const protectedRoutes = [
  '/admin',
  '/api/admin',
  '/api/clients',
  '/api/clients-unified',
  '/api/partners',
  '/api/bookings',
  '/api/finance',
  '/api/documents',
  '/api/messages',
  '/api/timeline',
  '/api/stages',
  '/api/commissions',
  '/api/partner-leads',
  '/api/partner-payments',
  '/api/notifications',
  '/api/whatsapp-pending',
  '/api/leads-from-whatsapp',
  '/api/auto-leads',
  '/api/forms',         // Contains sensitive client data
];

// Routes that are exempt from auth (login page, public APIs)
const publicRoutes = [
  '/admin/login',
  '/admin/login/', // Trailing slash variant
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/check',
  '/api/portal',      // Client portal (has its own auth)
  '/api/portal-v2',   // Client portal v2
  '/api/validate-code', // Public client code validation
  '/api/forms-v2',    // Public form submission
  '/api/forms/',      // Public form by code (GET /api/forms/[code])
  '/api/ficha',       // Public client form
  '/api/webhooks',    // Webhooks need to be public for external services
  '/api/whatsapp',    // WhatsApp webhook endpoint
  '/api/partners',    // Partner login needs to check email/code
  '/api/partners/auth', // Partner auth endpoint
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtected = protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  // Check if route is explicitly public
  const isPublic = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  // If public route, allow
  if (isPublic) {
    return NextResponse.next();
  }
  
  // If not protected, allow
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // Check for session cookie
  const session = request.cookies.get('admin_session');
  
  if (!session || session.value !== 'authenticated') {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login primeiro.' },
        { status: 401 }
      );
    }
    
    // Admin pages redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};