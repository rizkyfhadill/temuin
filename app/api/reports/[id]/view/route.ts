import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase.from("reports").select("view_count").eq("id", id).single();
    const current = (data?.view_count ?? 0) as number;
    const next = current + 1;
    await supabase.from("reports").update({ view_count: next }).eq("id", id);
    return NextResponse.json({ view_count: next });
  } catch (err) {
    // Return 500 on error but don't crash client
    return NextResponse.json({ error: "could not increment view count" }, { status: 500 });
  }
}
