import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// POST /api/chat/rooms  body: { reportId }
// Creates (or returns existing) a chat room between the current user and the
// report's owner, then returns the room id so the client can navigate to it.
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { reportId } = await request.json().catch(() => ({ reportId: null }));
  if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

  const { data: report, error: repErr } = await supabase
    .from("reports")
    .select("owner_id")
    .eq("id", reportId)
    .single();

  if (repErr || !report) return NextResponse.json({ error: "report not found" }, { status: 404 });
  if (report.owner_id === user.id)
    return NextResponse.json({ error: "cannot chat with yourself" }, { status: 400 });

  // Reuse an existing room for this pair + report.
  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("report_id", reportId)
    .or(`and(user_a.eq.${user.id},user_b.eq.${report.owner_id}),and(user_a.eq.${report.owner_id},user_b.eq.${user.id})`)
    .maybeSingle();

  if (existing) return NextResponse.json({ roomId: existing.id });

  const { data: created, error } = await supabase
    .from("chat_rooms")
    .insert({ report_id: reportId, user_a: user.id, user_b: report.owner_id })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ roomId: created.id });
}
