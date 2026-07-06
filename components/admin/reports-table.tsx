"use client";

import * as React from "react";
import { Check, X, Flag, Lock, Unlock, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import type { Report } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type Scope = "all" | "pending" | "spam";

async function notify(supabase: any, userId: string, type: string, title: string, body: string, href: string) {
  // SECURITY DEFINER rpc bypasses RLS so admin flows can notify the report owner.
  await supabase.rpc("create_notification", { p_user_id: userId, p_type: type, p_title: title, p_body: body, p_href: href });
}

export function AdminReportsTable({ scope = "all" }: { scope?: Scope }) {
  const { profile } = useAuth();
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialog, setDialog] = React.useState<{ mode: "edit" | "reject"; report: Report } | null>(null);
  const [draft, setDraft] = React.useState<Report | null>(null);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setLoading(false);
    let q = supabase.from("reports").select("*, author:profiles(*), categories(name)");
    if (scope === "pending") q = q.eq("status", "pending");
    if (scope === "spam") q = q.eq("is_spam", true);
    const { data } = await q.order("created_at", { ascending: false });
    setReports(
      (data ?? []).map((r: any) => ({
        ...r,
        category_name: r.categories?.name ?? null,
        author: r.author
          ? { id: r.author.id, username: r.author.username, full_name: r.author.full_name, avatar_url: r.author.avatar_url, role: r.author.role, city: r.author.city, bio: r.author.bio, verified: r.author.verified, suspended: r.author.suspended, created_at: r.author.created_at, updated_at: r.author.updated_at }
          : undefined,
      } as Report))
    );
    setLoading(false);
  }, [scope]);

  React.useEffect(() => { load(); }, [load]);

  const act = async (id: string, patch: any, msg: string) => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    setBusy(id + JSON.stringify(patch));
    const { error } = await supabase.from("reports").update(patch).eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(msg);
    load();
  };

  const approve = async (r: Report) => {
    await act(r.id, { status: "published" }, "Laporan disetujui & dipublikasikan");
    const supabase = getSupabaseBrowserSafe();
    if (supabase) await notify(supabase, r.owner_id, "report_approved", "Laporan disetujui", `“${r.title}” telah disetujui dan dipublikasikan.`, `/reports/${r.id}`);
  };

  const reject = async (r: Report) => {
    if (!reason.trim()) return toast.error("Berikan alasan penolakan");
    await act(r.id, { status: "rejected", rejection_reason: reason }, "Laporan ditolak");
    const supabase = getSupabaseBrowserSafe();
    if (supabase) await notify(supabase, r.owner_id, "report_rejected", "Laporan ditolak", `“${r.title}” ditolak. Alasan: ${reason}`, `/reports/${r.id}`);
    setReason("");
    setDialog(null);
  };

  const toggleSpam = (r: Report) => act(r.id, { is_spam: !r.is_spam }, r.is_spam ? "Spam dibatalkan" : "Ditandai spam");
  const toggleLock = (r: Report) => act(r.id, { comments_locked: !r.comments_locked }, r.comments_locked ? "Komentar dibuka" : "Komentar dikunci");

  const del = async (id: string) => {
    if (!confirm("Hapus laporan secara permanen?")) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    setBusy(id);
    const { error } = await supabase.from("reports").delete().eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Laporan dihapus");
    load();
  };

  const saveEdit = async () => {
    if (!draft) return;
    await act(draft.id, { title: draft.title, description: draft.description }, "Laporan diperbarui");
    setDialog(null);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Memuat…</p>;
  if (reports.length === 0) return <Card className="border-dashed p-10 text-center text-muted-foreground">Tidak ada laporan.</Card>;

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex flex-wrap items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {r.image_url && <img src={r.image_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{r.title}</span>
                <Badge variant={r.type === "lost" ? "destructive" : "success"}>{r.type === "lost" ? "Hilang" : "Ditemukan"}</Badge>
                <StatusBadge status={r.status} />
                {r.is_spam && <Badge variant="warning">Spam</Badge>}
                {r.comments_locked && <Badge variant="muted"><Lock className="size-3" /> Lock</Badge>}
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Avatar src={r.author?.avatar_url} name={r.author?.username} size={18} /> @{r.author?.username}</span>
                <span>• {r.category_name}</span>
                <span>• {r.location}</span>
                <span>• {formatDateTime(r.created_at)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {r.status === "pending" && <Button size="sm" onClick={() => approve(r)} disabled={busy === r.id}><Check className="size-3.5" /> Setuju</Button>}
                {r.status === "pending" && <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => { setDialog({ mode: "reject", report: r }); setReason(""); }}><X className="size-3.5" /> Tolak</Button>}
                <Button size="sm" variant="outline" onClick={() => toggleSpam(r)}><Flag className="size-3.5" /> Spam</Button>
                <Button size="sm" variant="outline" onClick={() => toggleLock(r)}>{r.comments_locked ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setDraft(r); setDialog({ mode: "edit", report: r }); }}><Pencil className="size-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => del(r.id)}><Trash2 className="size-3.5" /></Button>
                <a href={`/reports/${r.id}`} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><ExternalLink className="size-3.5" /></Button></a>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Dialog open={!!dialog} onClose={() => setDialog(null)}>
        {dialog?.mode === "reject" ? (
          <div className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Tolak Laporan</h2>
            <div className="space-y-1.5">
              <Label>Alasan Penolakan</Label>
              <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan mengapa laporan ditolak…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)}>Batal</Button>
              <Button variant="destructive" onClick={() => reject(dialog.report)}>Tolak</Button>
            </div>
          </div>
        ) : dialog?.mode === "edit" && draft ? (
          <div className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Edit Laporan</h2>
            <div className="space-y-1.5"><Label>Nama Barang</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Deskripsi</Label><Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)}>Batal</Button>
              <Button onClick={saveEdit}>Simpan</Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
