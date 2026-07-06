"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bookmark,
  Bell,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { DashboardNav, type NavItem } from "@/components/layout/dashboard-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, role } = useAuth();
  const pathname = usePathname();
  const [notifCount, setNotifCount] = React.useState(0);
  const [msgCount, setMsgCount] = React.useState(0);

  const base: NavItem[] = [
    { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, end: true },
    { href: "/dashboard/my-reports", label: "Laporan Saya", icon: FileText },
    { href: "/dashboard/messages", label: "Pesan", icon: MessageSquare, badge: msgCount },
    { href: "/dashboard/bookmarks", label: "Bookmark", icon: Bookmark },
    { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell, badge: notifCount },
    { href: "/dashboard/profile", label: "Profil", icon: User },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  ];
  if (role === "admin") {
    base.push({ href: "/admin", label: "Admin Panel", icon: ShieldCheck });
  }

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) return;
    const uid = profile.id;

    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("read", false)
      .then(({ count }) => setNotifCount(count ?? 0));

    (async () => {
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id")
        .or(`user_a.eq.${uid},user_b.eq.${uid}`);
      if (!rooms?.length) return setMsgCount(0);
      const ids = rooms.map((r) => r.id);
      const { data: msgs } = await supabase
        .from("messages")
        .select("room_id, sender_id, read_by")
        .in("room_id", ids);
      const unread = (msgs ?? []).filter(
        (m) => m.sender_id !== uid && (!m.read_by || !m.read_by.includes(uid))
      ).length;
      setMsgCount(unread);
    })();
  }, [profile]);

  return (
    <div className="container flex gap-6 py-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Masuk sebagai</p>
            <p className="truncate font-semibold">@{profile?.username}</p>
            <div className="mt-1 flex items-center gap-2">
              {typeof profile?.points === "number" && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {profile.points} poin
                </span>
              )}
              {role === "admin" && <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>}
            </div>
          </div>
          <DashboardNav items={base} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <DashboardNav items={base} orientation="horizontal" className="px-2" />
      </div>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
