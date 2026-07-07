"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, FileCheck2, FileX2, Sparkles, MessageSquare, AtSign, PackageCheck, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn, timeAgo } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/lib/types";

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  report_approved: FileCheck2,
  report_rejected: FileX2,
  ai_match: Sparkles,
  new_comment: MessageSquare,
  reply_comment: MessageSquare,
  new_message: MessageSquare,
  mention: AtSign,
  item_found: PackageCheck,
  interest: Bell,
};

export default function NotificationsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !uid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setItems((data as AppNotification[]) ?? []);
    setLoading(false);
  }, [profile, user]);

  React.useEffect(() => {
    if (authLoading) return;
    load();
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !uid) return;
    const ch = supabase
      .channel(`notif:${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, (payload) => {
        setItems((m) => [payload.new as AppNotification, ...m]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [authLoading, load, profile, user]);

  const markAll = async () => {
    const supabase = getSupabaseBrowserSafe();
    const uid = user?.id ?? profile?.id;
    if (!supabase || !uid) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", uid).eq("read", false);
    setItems((m) => m.map((n) => ({ ...n, read: true })));
    toast.success("Semua dibaca");
  };

  const open = async (n: AppNotification) => {
    const supabase = getSupabaseBrowserSafe();
    if (supabase && !n.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
      setItems((m) => m.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.href) window.location.href = n.href;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
        <Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="size-4" /> Tandai Semua Dibaca</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : items.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">Tidak ada notifikasi</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent",
                  !n.read && "bg-primary/5"
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
