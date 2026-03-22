import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Keywords to identify potential leads
const LEAD_KEYWORDS = [
  'visto', 'espanha', 'nomad', 'digital nomad', 'mudar para espanha',
  'visto digital nomad', 'visto de trabalho', 'visto de residencia',
  'mudança', 'imigração', 'imigrar', 'cidadania espanhola', 'nacionalidade',
  'passaporte', 'morar na espanha', 'trabalhar na espanha', 'nómada'
];

// NomadWay team members to ignore (phone numbers)
const IGNORE_PHONES = [
  '+558488851818', // Marlon
  '+558499160858', // Outro
  '+34612455982', // NomadWay Spain
];

interface WhatsAppMessage {
  ChatJID: string;
  ChatName: string;
  MsgID: string;
  SenderJID: string;
  Timestamp: string;
  FromMe: boolean;
  Text: string;
  DisplayText: string;
  MediaType: string;
  Snippet: string;
}

interface ParsedLead {
  phone: string;
  name: string;
  group_name: string;
  keywords: string[];
  message: string;
  timestamp: string;
}

function extractPhoneFromJID(jid: string): string {
  // Extract phone from JID like "5511998887777@s.whatsapp.net" or "5511998887777@lid"
  const match = jid.match(/^(\d+)/);
  if (match) {
    let phone = match[1];
    // Add + if not present
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }
    return phone;
  }
  return '';
}

function formatPhone(phone: string): string {
  // Remove all non-digits and +, then add +
  const digits = phone.replace(/[^\d]/g, '');
  return '+' + digits;
}

// GET - List WhatsApp leads from database
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('whatsapp_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      total: count
    });

  } catch (error) {
    console.error('Error fetching whatsapp leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a lead from WhatsApp group interaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      phone, 
      name, 
      group_name, 
      keywords, 
      message, 
      timestamp,
      sender_jid 
    } = body as ParsedLead & { sender_jid: string };

    if (!phone) {
      return NextResponse.json(
        { error: 'phone is required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhone(phone);

    // Check if this phone should be ignored
    if (IGNORE_PHONES.some(p => formatPhone(p) === formattedPhone)) {
      return NextResponse.json({
        success: true,
        message: 'Ignored (team member)',
        lead: null
      });
    }

    const supabase = createServerClient();

    // Check if lead already exists (by phone) in whatsapp_leads
    const { data: existingLead } = await supabase
      .from('whatsapp_leads')
      .select('*')
      .eq('phone', formattedPhone)
      .maybeSingle();

    if (existingLead) {
      // Update existing lead with new keywords
      const updatedKeywords = [...new Set([...(existingLead.keywords || []), ...keywords])];
      const { data: updatedLead, error } = await supabase
        .from('whatsapp_leads')
        .update({
          keywords: updatedKeywords,
          last_message: message,
          last_seen: new Date().toISOString(),
          message_count: (existingLead.message_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Lead updated',
        lead: updatedLead
      });
    }

    // Create new lead
    const { data: newLead, error } = await supabase
      .from('whatsapp_leads')
      .insert({
        phone: formattedPhone,
        name: name || 'Lead WhatsApp',
        group_name: group_name,
        keywords: keywords,
        first_message: message,
        last_message: message,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        message_count: 1,
        source: 'whatsapp_group',
        sender_jid: sender_jid,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead created',
      lead: newLead
    });

  } catch (error) {
    console.error('Error in leads-from-whatsapp POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}