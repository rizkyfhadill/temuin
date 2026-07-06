"use client";

import * as React from "react";
import { Trash2, Lock, Unlock, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { formatDateTime } from "@/lib/utils";
import type { CommentRow } from "@/lib/data";

export default function AdminCommentsPage() {
  const [rows, setRows] = React.useState<CommentRow[]>([]);
  const [locked, setLocked] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setLoading(false);
    const { data: comments } = await supabase
      .from("comments")
      .select("*, author:profiles(*), report:reports(title, comments_locked)")
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((comments ?? []).map((r: any) => ({
      id: r.id, report_id: r.report_id, user_id: r.user_id, parent_id: r.parent_id, body: r.body, mentions: r.mentions, created_at: r.created_at, updated_at: r.updated_at,
      author: r.author ? { id: r.author.id, username: r.author.username, full_name: r.author.full_name, avatar_url: r.author.avatar_url, role: r.author.role, city: r.author.city, bio: r.author.bio, verified: r.author.verified, suspended: r.author.suspended, created_at: r.author.created_at, updated_at: r.author.updated_at } : undefined,
    })));
    const lockMap: Record<string, boolean> = {};
    (comments ?? []).forEach((c: any) => { if (c.report) lockMap[c.report_id] = c.report.comments_locked; });
    setLocked(lockMap);
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Hapus komentar?")) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Komentar dihapus");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const toggleLock = async (reportId: string) => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    const next = !locked[reportId];
    const { error } = await supabase.from("reports").update({ comments_locked: next }).eq("id", reportId);
    if (error) return toast.error(error.message);
    setLocked((m) => ({ ...m, [reportId]: next }));
    toast.success(next ? "Komentar dikunci" : "Komentar dibuka");
  };

  if (loading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Komentar Laporan</h1>
        <p className="text-muted-foreground">Moderasi diskusi & kunci komentar pada laporan.</p>
      </div>
      {rows.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-muted-foreground">Belum ada komentar.</Card>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <Card key={c.id} className="flex flex-wrap items-start gap-3 p-4">
              <Avatar src={c.author?.avatar_url} name={c.author?.username} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm"><b>@{c.author?.username}</b> pada “{(c as any).report?.title ?? "laporan"}”</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => toggleLock(c.report_id)}>
                  {locked[c.report_id] ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />} {locked[c.report_id] ? "Buka" : "Kunci"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => del(c.id)}><Trash2 className="size-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
