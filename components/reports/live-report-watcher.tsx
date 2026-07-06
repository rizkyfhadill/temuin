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
    const ch = supabase
      .channel(`report:${reportId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports", filter: `id=eq.${reportId}` }, () => {
        router.refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [reportId, router]);

  return null;
}
