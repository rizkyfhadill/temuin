"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, FileText, Bookmark, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { ReportCard } from "@/components/report-card";
import type { Report } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function DashboardHome() {
  const { profile } = useAuth();
  const [myReports, setMyReports] = React.useState<Report[]>([]);
  const [stats, setStats] = React.useState({ total: 0, returned: 0, bookmarks: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) {
      setLoading(false);
      return;
    }
    (async () => {
      const uid = profile.id;
      const [{ data: reports }, { count: returned }, { count: bms }] = await Promise.all([
        supabase.from("reports").select("*, categories(name)").eq("owner_id", uid).order("created_at", { ascending: false }).limit(4),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("owner_id", uid).eq("status", "returned"),
        supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", uid),
      ]);
      setMyReports(
        (reports ?? []).map((r: any) => ({ ...r, category_name: r.categories?.name ?? null } as Report))
      );
      setStats({ total: reports?.length ?? 0, returned: returned ?? 0, bookmarks: bms ?? 0 });
      setLoading(false);
    })();
  }, [profile]);

  const cards = [
    { label: "Laporan Saya", value: stats.total, icon: FileText, href: "/dashboard/my-reports" },
    { label: "Berhasil Kembali", value: stats.returned, icon: TrendingUp, href: "/dashboard/my-reports" },
    { label: "Bookmark", value: stats.bookmarks, icon: Bookmark, href: "/dashboard/bookmarks" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Halo, @{profile?.username} 👋</h1>
          <p className="text-muted-foreground">Selamat datang kembali di dashboard Temuin.</p>
        </div>
        <Button asChild>
          <Link href="/reports/new">
            <Plus className="size-4" /> Buat Laporan
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="flex items-center gap-4 p-5 card-hover">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tabular-nums">{loading ? "—" : c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Laporan Terbaru Saya</h2>
          <Link href="/dashboard/my-reports" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Lihat semua <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : myReports.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <p className="font-medium">Belum ada laporan</p>
            <Button asChild className="mt-4">
              <Link href="/reports/new">Buat Laporan Pertama</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {myReports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
