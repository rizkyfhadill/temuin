"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ShieldCheck, Users, Tags, MessageSquare, Flag, Settings, ArrowLeft,
} from "lucide-react";
import { DashboardNav, type NavItem } from "@/components/layout/dashboard-nav";
import { useAuth } from "@/components/providers/auth-provider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role, profile } = useAuth();
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { href: "/admin/reports", label: "Laporan", icon: FileText },
    { href: "/admin/verification", label: "Verifikasi", icon: ShieldCheck },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/categories", label: "Kategori", icon: Tags },
    { href: "/admin/comments", label: "Komentar", icon: MessageSquare },
    { href: "/admin/spam", label: "Spam", icon: Flag },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  if (role !== "admin") {
    return (
      <div className="container grid min-h-[60vh] place-items-center py-10">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-3 size-10 text-destructive" />
          <h1 className="text-xl font-bold">Akses Ditolak</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kamu tidak memiliki izin admin.</p>
          <ButtonLink />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex gap-6 py-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Admin Panel</p>
            <p className="truncate font-semibold">@{profile?.username}</p>
          </div>
          <DashboardNav items={items} />
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <ArrowLeft className="size-4" /> User Dashboard
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ButtonLink() {
  return (
    <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
      <ArrowLeft className="size-4" /> Ke Dashboard
    </Link>
  );
}
