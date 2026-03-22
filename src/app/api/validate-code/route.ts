import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Código não informado' }, { status: 400, headers: corsHeaders });
  }

  const supabase = createServerClient();
  const codeUpper = code.toUpperCase();
  const codeLower = code.toLowerCase();

  // Search for client by client_code (uppercase)
  const { data: clientByCode, error: error1 } = await supabase
    .from('clients')
    .select('id, client_code, workspace_slug, full_name, email')
    .eq('client_code', codeUpper)
    .single();

  if (clientByCode) {
    // If workspace_slug doesn't exist, generate it from client_code
    const workspaceSlug = clientByCode.workspace_slug || codeLower.replace(/-/g, '');
    return NextResponse.json({
      valid: true,
      client: {
        id: clientByCode.id,
        name: clientByCode.full_name,
        code: clientByCode.client_code,
        workspace_slug: workspaceSlug
      }
    }, { headers: corsHeaders });
  }

  // Search for client by workspace_slug (lowercase, no hyphens)
  const { data: clientBySlug, error: error2 } = await supabase
    .from('clients')
    .select('id, client_code, workspace_slug, full_name, email')
    .eq('workspace_slug', codeLower.replace(/-/g, ''))
    .single();

  if (clientBySlug) {
    return NextResponse.json({
      valid: true,
      client: {
        id: clientBySlug.id,
        name: clientBySlug.full_name,
        code: clientBySlug.client_code,
        workspace_slug: clientBySlug.workspace_slug
      }
    }, { headers: corsHeaders });
  }

  // Also try with hyphens preserved
  const { data: clientBySlugHyphen, error: error3 } = await supabase
    .from('clients')
    .select('id, client_code, workspace_slug, full_name, email')
    .eq('workspace_slug', codeLower)
    .single();

  if (clientBySlugHyphen) {
    return NextResponse.json({
      valid: true,
      client: {
        id: clientBySlugHyphen.id,
        name: clientBySlugHyphen.full_name,
        code: clientBySlugHyphen.client_code,
        workspace_slug: clientBySlugHyphen.workspace_slug
      }
    }, { headers: corsHeaders });
  }

  return NextResponse.json({
    valid: false,
    error: 'Código não encontrado. Verifique se o código está correto ou entre em contato pelo WhatsApp.'
  }, { status: 404, headers: corsHeaders });
}