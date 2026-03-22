import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica se a requisição tem sessão admin válida
 * Use em todas as APIs que precisam de autenticação
 */
export function verifyAdminAuth(request: NextRequest): { success: boolean; error?: string } {
  const session = request.cookies.get('admin_session');
  
  if (!session || session.value !== 'authenticated') {
    return { success: false, error: 'Não autorizado. Faça login primeiro.' };
  }
  
  return { success: true };
}

/**
 * Middleware para verificar autenticação em rotas de API
 * Retorna resposta de erro 401 se não autenticado
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const auth = verifyAdminAuth(request);
  
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    );
  }
  
  return null; // null = autenticado, pode continuar
}

/**
 * Remove campos sensíveis de um objeto antes de retornar
 */
export function sanitizePartner(partner: Record<string, unknown>) {
  const { password_hash, ...safe } = partner;
  return safe;
}

/**
 * Remove campos sensíveis de uma lista de objetos
 */
export function sanitizePartners(partners: Record<string, unknown>[]) {
  return partners.map(sanitizePartner);
}

/**
 * Remove campos sensíveis do cliente
 */
export function sanitizeClient(client: Record<string, unknown>) {
  const { notes_internal, ...safe } = client;
  return safe;
}