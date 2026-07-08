"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";

// Subscribes to the report row and triggers a server refresh on any change,
// so admin verification/rejection/return is reflected live on this page.
export function LiveReportWatcher({ reportId }: { reportId: string }) {
  const router = useRouter();
  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;

    // Subscribe to report updates so the page refreshes on changes
    const ch = supabase
      .channel(`report:${reportId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports", filter: `id=eq.${reportId}` }, () => {
        router.refresh();
      })
      .subscribe();

    // Increment view count once on page load via server API; subscription will trigger refresh.
    (async () => {
      try {
        await fetch(`/api/reports/${reportId}/view`, { method: "POST" });
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [reportId, router]);

  return null;
}
