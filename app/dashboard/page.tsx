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
  const { user, profile, loading: authLoading } = useAuth();
  const [myReports, setMyReports] = React.useState<Report[]>([]);
  const [stats, setStats] = React.useState({ total: 0, returned: 0, bookmarks: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    // Wait for auth to be loaded and user to be present
    if (authLoading || !supabase || !user) {
      return;
    }

    // User is authenticated, fetch dashboard data using user.id
    (async () => {
      try {
        const uid = user.id;
        const [reportsResult, returnedCountResult, bookmarksCountResult] = await Promise.all([
          supabase.from("reports").select("*, categories(name)").eq("owner_id", uid).order("created_at", { ascending: false }).limit(4),
          supabase.from("reports").select("*", { count: "exact", head: true }).eq("owner_id", uid).eq("status", "returned"),
          supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", uid),
        ]);

        const reports = reportsResult.data ?? [];
        const returnedCount = returnedCountResult.count ?? 0;
        const bookmarksCount = bookmarksCountResult.count ?? 0;

        setMyReports(
          reports.map((r: any) => ({ ...r, category_name: r.categories?.name ?? null } as Report))
        );
        setStats({ total: reports.length, returned: returnedCount, bookmarks: bookmarksCount });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({ total: 0, returned: 0, bookmarks: 0 });
        setMyReports([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const cards = [
    { label: "Laporan Saya", value: stats.total, icon: FileText, href: "/dashboard/my-reports" },
    { label: "Berhasil Kembali", value: stats.returned, icon: TrendingUp, href: "/dashboard/my-reports" },
    { label: "Bookmark", value: stats.bookmarks, icon: Bookmark, href: "/dashboard/bookmarks" },
  ];

  // Show loading skeleton while auth is still loading
  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-muted"></div>
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted"></Card>
          ))}
        </div>
      </div>
    );
  }

  // Render dashboard with profile data
  const displayName = profile?.username ?? "User";
  const fullName = profile?.full_name ?? "";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, @{displayName} 👋
          </h1>
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
