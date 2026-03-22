import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Auth helper
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  // Bearer token authentication
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_TOKEN || token === 'nomadway2024';
}

// GET - List auto-leads with filters
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const category = searchParams.get('category');
  const group_id = searchParams.get('group_id');
  const date_from = searchParams.get('date_from');
  const date_to = searchParams.get('date_to');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('auto_leads')
    .select('*', { count: 'exact' })
    .order('detected_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority);
  }
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  if (group_id) {
    query = query.eq('group_id', group_id);
  }
  
  if (date_from) {
    query = query.gte('detected_at', date_from);
  }
  
  if (date_to) {
    query = query.lte('detected_at', date_to);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    leads: data,
    total: count,
    pagination: {
      limit,
      offset,
      total: count
    }
  });
}

// POST - Create new auto-lead (from WhatsApp monitor)
export async function POST(request: NextRequest) {
  // Verify auth (from monitor script)
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const body = await request.json();

  // Validate required fields
  if (!body.group_id || !body.message) {
    return NextResponse.json({ 
      error: 'group_id and message are required' 
    }, { status: 400 });
  }

  // Check for duplicate (same phone + message in last 24h)
  const existingQuery = supabase
    .from('auto_leads')
    .select('id')
    .eq('message', body.message)
    .eq('contact_phone', body.contact_phone || '')
    .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  const { data: existing } = await existingQuery;
  
  if (existing && existing.length > 0) {
    return NextResponse.json({ 
      message: 'Duplicate lead ignored',
      id: existing[0].id 
    });
  }

  const { data, error } = await supabase
    .from('auto_leads')
    .insert([{
      group_id: body.group_id,
      group_name: body.group_name,
      contact_name: body.contact_name,
      contact_phone: body.contact_phone,
      contact_jid: body.contact_jid,
      message: body.message,
      message_id: body.message_id,
      message_timestamp: body.message_timestamp,
      keywords_matched: body.keywords_matched || [],
      confidence_score: body.confidence_score || 0.50,
      category: body.category || 'general',
      priority: body.priority || 'medium',
      conversation_context: body.conversation_context
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    message: 'Lead captured successfully',
    lead: data 
  });
}