import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/messages - Get messages for a client (single chat)
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  // Use stage_messages table with stage_id IS NULL for general chat
  // or get all messages for this client
  const { data: messages, error } = await supabase
    .from("stage_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}

// POST /api/messages - Create new message (single chat)
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { client_id, sender_type, sender_name, message, stage_id } = body;

    if (!client_id || !sender_type || !sender_name || !message) {
      return NextResponse.json(
        { error: "client_id, sender_type, sender_name e message são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate sender_type
    if (sender_type !== "admin" && sender_type !== "client") {
      return NextResponse.json(
        { error: "sender_type deve ser 'admin' ou 'client'" },
        { status: 400 }
      );
    }

    // Get first stage for this client if no stage_id provided
    let finalStageId = stage_id;
    if (!finalStageId) {
      const { data: stages } = await supabase
        .from("process_stages")
        .select("id")
        .eq("client_id", client_id)
        .order("stage_order", { ascending: true })
        .limit(1);
      
      if (stages && stages.length > 0) {
        finalStageId = stages[0].id;
      }
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from("stage_messages")
      .insert({
        client_id,
        stage_id: finalStageId,
        sender_type,
        sender_name,
        message: message.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create timeline event
    try {
      await supabase.from("timeline_events").insert({
        client_id,
        stage_id: finalStageId,
        event_type: "message_sent",
        title: `Nova mensagem de ${sender_name}`,
        description: message.substring(0, 100),
        actor_name: sender_name,
        actor_type: sender_type,
      });
    } catch (e) {
      // Ignore timeline errors
    }

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}