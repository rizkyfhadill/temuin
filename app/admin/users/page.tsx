"use client";

import * as React from "react";
import { Ban, CheckCircle2, Trash2, ShieldCheck, User as UserIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import type { Profile, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const call = async (action: string, userId: string, extra: any = {}) => {
    setBusy(userId + action);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, ...extra }),
    });
    setBusy(null);
    const json = await res.json();
    if (!res.ok) return toast.error(json.error || "Gagal");
    toast.success("Berhasil");
    load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">{users.length} pengguna terdaftar.</p>
      </div>
      <div className="grid gap-3">
        {users.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center gap-4 p-4">
            <Avatar src={u.avatar_url} name={u.username} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">@{u.username}</span>
                {u.verified && <Badge variant="default">✓</Badge>}
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                {u.suspended && <Badge variant="destructive">Suspended</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{u.full_name} • {u.city || "—"} • bergabung {formatDate(u.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {u.role !== "admin" ? (
                <Button size="sm" variant="outline" disabled={busy === u.id + "role"} onClick={() => call("role", u.id, { role: "admin" })}>
                  <ShieldCheck className="size-3.5" /> Jadikan Admin
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled={busy === u.id + "role"} onClick={() => call("role", u.id, { role: "user" })}>
                  <UserIcon className="size-3.5" /> Jadikan User
                </Button>
              )}
              {u.suspended ? (
                <Button size="sm" variant="outline" onClick={() => call("suspend", u.id, { suspended: false })}><CheckCircle2 className="size-3.5" /> Aktifkan</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => call("suspend", u.id, { suspended: true })}><Ban className="size-3.5" /> Suspend</Button>
              )}
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Hapus akun ini secara permanen?")) call("delete", u.id); }}><Trash2 className="size-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
