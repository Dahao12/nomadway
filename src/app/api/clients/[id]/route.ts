import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/clients/[id] - Get client details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  // Get client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  // Get client form data (CPF, RG, passport, address, etc.)
  const { data: form } = await supabase
    .from("client_forms")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Get stages
  const { data: stages } = await supabase
    .from("process_stages")
    .select("*")
    .eq("client_id", id)
    .order("stage_order", { ascending: true });

  // Get documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  // Get recent timeline events
  const { data: timeline_events } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get messages
  const { data: messages } = await supabase
    .from("stage_messages")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    client,
    form: form || null,
    stages: stages || [],
    documents: documents || [],
    timeline_events: timeline_events || [],
    messages: messages || [],
    payments: payments || [],
  });
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, email, phone, visa_type, status, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (visa_type !== undefined) updateData.visa_type = visa_type;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
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

// DELETE /api/clients/[id] - Archive client (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  // Use soft delete - change status to 'deleted' instead of hard delete
  // This preserves bookings and other references
  const { data: client, error } = await supabase
    .from("clients")
    .update({ status: "deleted" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, client });
}