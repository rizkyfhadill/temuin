"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import type { Report } from "@/lib/types";

export default function MyReportsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Report | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !uid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("reports")
      .select("*, categories(name)")
      .eq("owner_id", uid)
      .order("created_at", { ascending: false });
    setReports((data ?? []).map((r: any) => ({ ...r, category_name: r.categories?.name ?? null } as Report)));
    setLoading(false);
  }, [profile, user]);

  React.useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const del = async (id: string) => {
    if (!confirm("Hapus laporan ini?")) return;
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !uid) return;
    const { error } = await supabase.from("reports").delete().eq("id", id).eq("owner_id", uid);
    if (error) return toast.error(error.message);
    toast.success("Laporan dihapus");
    setReports((r) => r.filter((x) => x.id !== id));
  };

  const save = async () => {
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !editing || !uid) return;
    setSaving(true);
    const { error } = await supabase
      .from("reports")
      .update({
        title: editing.title,
        description: editing.description,
        location: editing.location,
        color: editing.color,
      })
      .eq("id", editing.id)
      .eq("owner_id", uid);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Laporan diperbarui");
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Laporan Saya</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/reports/new"><Plus className="size-4" /> Buat</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : reports.length === 0 ? (
        <Card className="border-dashed p-6 sm:p-10 text-center">
          <p className="font-medium text-sm sm:text-base">Belum ada laporan</p>
          <Button asChild className="mt-4"><Link href="/reports/new">Buat Laporan</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {r.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/reports/${r.id}`} className="font-semibold text-sm sm:text-base hover:underline line-clamp-1">{r.title}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={r.status} />
                  <span className="line-clamp-1">{r.category_name}</span>
                  <span>•</span>
                  <span className="line-clamp-1">{r.location}</span>
                </div>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setEditing(r)} className="flex-1 sm:flex-none">
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:bg-destructive/10 sm:flex-none" onClick={() => del(r.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <div className="space-y-4 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold">Edit Laporan</h2>
            <div className="space-y-1.5">
              <Label className="text-sm">Nama Barang</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Deskripsi</Label>
              <Textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Lokasi</Label>
                <Input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Warna</Label>
                <Input value={editing.color ?? ""} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="text-sm" />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)} className="w-full sm:w-auto">Batal</Button>
              <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="size-4 animate-spin" />} Simpan
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
