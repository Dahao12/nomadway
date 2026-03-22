import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/stages - List stages for a client
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get("client_id");

  if (!client_id) {
    return NextResponse.json({ error: "client_id é obrigatório" }, { status: 400 });
  }

  const { data: stages, error } = await supabase
    .from("process_stages")
    .select("*")
    .eq("client_id", client_id)
    .order("stage_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stages });
}

// POST /api/stages - Create a new stage
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { client_id, stage_name, stage_order, status, notes_admin, notes_client } = body;

    if (!client_id || !stage_name) {
      return NextResponse.json(
        { error: "client_id e stage_name são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: stage, error } = await supabase
      .from("process_stages")
      .insert({
        client_id,
        stage_name,
        stage_order: stage_order || 1,
        status: status || "pending",
        notes_admin: notes_admin || null,
        notes_client: notes_client || null,
        progress_percent: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stage }, { status: 201 });
  } catch (error) {
    console.error("Error creating stage:", error);
    return NextResponse.json({ error: "Erro ao criar etapa" }, { status: 500 });
  }
}

// PATCH /api/stages - Update stage (status, notes)
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { stage_id, status, notes_admin, notes_client, progress_percent } = body;

    if (!stage_id) {
      return NextResponse.json({ error: "stage_id é obrigatório" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (notes_admin !== undefined) updateData.notes_admin = notes_admin;
    if (notes_client !== undefined) updateData.notes_client = notes_client;
    if (progress_percent !== undefined) updateData.progress_percent = progress_percent;

    const { data: stage, error } = await supabase
      .from("process_stages")
      .update(updateData)
      .eq("id", stage_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create timeline event if status changed
    if (status) {
      try {
        const { data: stageData } = await supabase
          .from("process_stages")
          .select("client_id, stage_name")
          .eq("id", stage_id)
          .single();

        if (stageData) {
          const statusLabels: Record<string, string> = {
            pending: "Pendente",
            in_progress: "Em Progresso",
            awaiting_client: "Aguardando Cliente",
            completed: "Concluído",
          };

          await supabase.from("timeline_events").insert({
            client_id: stageData.client_id,
            event_type: "stage_updated",
            title: `${stageData.stage_name}: ${statusLabels[status] || status}`,
            actor_name: "Admin",
            actor_type: "admin",
          });
        }
      } catch (e) {
        // Ignore timeline errors
      }
    }

    return NextResponse.json({ stage });
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json({ error: "Erro ao atualizar etapa" }, { status: 500 });
  }
}