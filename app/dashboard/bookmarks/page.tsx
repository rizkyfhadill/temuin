"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/report-card";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import type { Report } from "@/lib/types";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    // Wait for auth to be loaded and user to be present
    if (authLoading || !supabase || !user) {
      if (!authLoading) setLoading(false); // Only set false if auth is done and no user
      return;
    }
    
    // User is authenticated, fetch bookmarks
    (async () => {
      try {
        const { data } = await supabase
          .from("bookmarks")
          .select("report:reports(*, categories(name))")
          .eq("user_id", user.id);
        const list = (data ?? [])
          .map((b: any) => b.report)
          .filter(Boolean)
          .map((r: any) => ({ ...r, category_name: r.categories?.name ?? null } as Report));
        setReports(list);
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  // Show loading skeleton while auth is still loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bookmark</h1>
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : reports.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <Bookmark className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">Belum ada bookmark</p>
          <Button asChild className="mt-4"><Link href="/reports">Jelajahi Laporan <Plus className="size-4" /></Link></Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{reports.map((r) => <ReportCard key={r.id} report={r} />)}</div>
      )}
    </div>
  );
}
