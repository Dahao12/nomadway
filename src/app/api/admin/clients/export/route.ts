import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Export clients as CSV
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    const clients = await res.json();
    
    // CSV headers
    const headers = [
      'Código',
      'Nome',
      'Email',
      'Telefone',
      'Tipo de Visto',
      'Status',
      'Data de Criação',
      'Notas'
    ];
    
    // CSV rows
    const rows = clients.map((client: any) => [
      client.client_code || '',
      client.name || '',
      client.email || '',
      client.phone || '',
      client.visa_type || '',
      client.status || '',
      client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '',
      (client.notes || '').replace(/"/g, '""') // Escape quotes
    ]);
    
    // Build CSV
    const csvContent = [
      headers.join(';'),
      ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');
    
    // Return with proper headers for download
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clientes-nomadway-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting clients:', error);
    return NextResponse.json({ error: 'Erro ao exportar clientes' }, { status: 500 });
  }
}