import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/timeline - List timeline events
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const client_id = searchParams.get("client_id");

  if (!client_id) {
    return NextResponse.json({ error: "client_id é obrigatório" }, { status: 400 });
  }

  const { data: events, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("client_id", client_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events });
}