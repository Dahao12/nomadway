import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { clientCreateSchema, clientUpdateSchema } from '@/lib/validation';
import { generateWorkspaceSlug } from '@/lib/utils';

// GET /api/clients - List all clients (with stages)
export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'read');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("id");
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Get single client with details
  if (clientId) {
    const { data: client, error } = await supabase
      .from("clients")
      .select(`
        *,
        process_stages (*)
      `)
      .eq("id", clientId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get messages for this client
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ 
      client: {
        ...client,
        process_stages: client.process_stages || [],
      },
      messages: messages || [],
    });
  }

  // Get all clients with stages (paginated)
  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      *,
      process_stages (
        id,
        stage_name,
        stage_order,
        status,
        progress_percent,
        notes_internal
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    clients,
    page,
    limit,
    hasMore: clients?.length === limit
  });
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerClient();

  try {
    const body = await request.json();
    
    // Validate input
    const validation = clientCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { name, email, phone, visa_type, notes } = validation.data;

    // Generate workspace slug using centralized function
    const workspace_slug = generateWorkspaceSlug(name);

    // Generate client code using SQL function (atomic)
    const { data: clientCodeResult, error: codeError } = await supabase
      .rpc('generate_client_code');
    
    if (codeError || !clientCodeResult) {
      return NextResponse.json(
        { error: 'Erro ao gerar código do cliente' },
        { status: 500 }
      );
    }

    // Create client
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        client_code: clientCodeResult,
        name,
        email: email || null,
        phone: phone || null,
        visa_type: visa_type || "Digital Nomad Visa",
        notes: notes || null,
        workspace_slug,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create default stages
    const defaultStages = [
      { stage_name: "Documentação Inicial", stage_order: 1 },
      { stage_name: "Análise de Elegibilidade", stage_order: 2 },
      { stage_name: "Preparação do Pedido", stage_order: 3 },
      { stage_name: "Submissão Governamental", stage_order: 4 },
      { stage_name: "Acompanhamento", stage_order: 5 },
      { stage_name: "Aprovação e Entrega", stage_order: 6 },
    ];

    for (const stage of defaultStages) {
      await supabase.from("process_stages").insert({
        client_id: client.id,
        stage_name: stage.stage_name,
        stage_order: stage.stage_order,
        status: "pending",
      });
    }

    // Create timeline event (fire and forget)
    void (async () => {
      try {
        await supabase.from("timeline_events").insert({
          client_id: client.id,
          event_type: "client_created",
          title: "Cliente cadastrado",
          description: `${name} foi adicionado ao sistema`,
          actor_name: "Admin",
          actor_type: "admin",
        });
      } catch {}
    })();

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}

// PATCH /api/clients - Update client
export async function PATCH(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerClient();

  try {
    const body = await request.json();
    
    // Validate input
    const validation = clientUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { client_id, name, email, phone, visa_type, status, notes } = validation.data;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (visa_type !== undefined) updateData.visa_type = visa_type;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", client_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// DELETE /api/clients - Delete client
export async function DELETE(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = rateLimitMiddleware(request, 'write');
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get("id");

  if (!client_id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", client_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}