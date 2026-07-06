import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Privileged user management — server-only, service role.
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = getSupabaseAdmin();
  const body = await request.json().catch(() => ({}));
  const { action, userId, role, suspended } = body;

  if (action === "delete") {
    // Remove auth user (cascades profile via FK if configured) then profile row.
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    await admin.from("profiles").delete().eq("id", userId);
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "role") {
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "suspend") {
    const { error } = await admin.from("profiles").update({ suspended }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
