"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User as UserIcon, Settings, LogOut, ShieldCheck, Bookmark, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export function UserNav() {
  const { profile, role, refresh } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = async () => {
    try {
      const supabase = getSupabaseBrowserSafe();
      if (supabase) {
        // Sign out from Supabase - clears session and cookies
        await supabase.auth.signOut();
      }
      // Refresh auth context to clear client-side state
      await refresh();
      toast.success("Berhasil keluar");
      setOpen(false);
      // Redirect to home
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal keluar");
    }
  };

  const name = profile?.full_name || profile?.username || "Pengguna";
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/my-reports", label: "Laporan Saya", icon: UserIcon },
    { href: "/dashboard/messages", label: "Pesan", icon: MessageSquare },
    { href: "/dashboard/bookmarks", label: "Bookmark", icon: Bookmark },
    { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-background p-0.5 pr-2 hover:bg-accent"
      >
        <Avatar src={profile?.avatar_url} name={name} size={30} />
        <span className="hidden text-sm font-medium sm:inline">{profile?.username}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-soft animate-fade-in">
          <div className="flex items-center gap-3 border-b border-border p-3">
            <Avatar src={profile?.avatar_url} name={name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>
          <div className="p-1.5">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <it.icon className="size-4 text-muted-foreground" /> {it.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <ShieldCheck className="size-4" /> Admin Panel
              </Link>
            )}
          </div>
          <div className="border-t border-border p-1.5">
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              )}
            >
              <LogOut className="size-4" /> Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
