import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/stages/[id] - Get single stage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  const { data: stage, error } = await supabase
    .from("process_stages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stage });
}

// PATCH /api/stages/[id] - Update stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { stage_name, stage_type, status, progress_percent, notes_client } = body;

    const updateData: Record<string, unknown> = {};
    if (stage_name !== undefined) updateData.stage_name = stage_name;
    if (stage_type !== undefined) updateData.stage_type = stage_type;
    if (status !== undefined) updateData.status = status;
    if (progress_percent !== undefined) updateData.progress_percent = progress_percent;
    if (notes_client !== undefined) updateData.notes_client = notes_client;

    // Set completed_at if status is completed
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: stage, error } = await supabase
      .from("process_stages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get client_id for timeline
    if (status) {
      const { data: stageData } = await supabase
        .from("process_stages")
        .select("client_id, stage_name")
        .eq("id", id)
        .single();

      if (stageData) {
        const statusMessages: Record<string, string> = {
          completed: `Etapa concluída: ${stageData.stage_name}`,
          in_progress: `Etapa iniciada: ${stageData.stage_name}`,
          awaiting_client: `Aguardando cliente: ${stageData.stage_name}`,
          blocked: `Etapa bloqueada: ${stageData.stage_name}`,
        };

        await supabase.from("timeline_events").insert({
          client_id: stageData.client_id,
          stage_id: id,
          event_type: "stage_updated",
          title: statusMessages[status] || `Etapa atualizada: ${stageData.stage_name}`,
          actor_name: "Admin",
          actor_type: "admin",
        });
      }
    }

    return NextResponse.json({ stage });
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json({ error: "Erro ao atualizar etapa" }, { status: 500 });
  }
}

// DELETE /api/stages/[id] - Delete stage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    // Get stage info before deleting
    const { data: stageData } = await supabase
      .from("process_stages")
      .select("client_id, stage_name")
      .eq("id", id)
      .single();

    // Delete stage
    const { error } = await supabase
      .from("process_stages")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create timeline event
    if (stageData) {
      await supabase.from("timeline_events").insert({
        client_id: stageData.client_id,
        event_type: "stage_deleted",
        title: `Etapa removida: ${stageData.stage_name}`,
        actor_name: "Admin",
        actor_type: "admin",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return NextResponse.json({ error: "Erro ao excluir etapa" }, { status: 500 });
  }
}