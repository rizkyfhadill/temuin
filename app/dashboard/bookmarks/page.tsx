"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/report-card";
import { PaginationCompact } from "@/components/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import type { Report } from "@/lib/types";

const ITEMS_PER_PAGE = 12;

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
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

  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedReports = reports.slice(startIdx, endIdx);

  // Show loading skeleton while auth is still loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedReports.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
          {totalPages > 1 && (
            <PaginationCompact
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/dashboard/bookmarks"
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
