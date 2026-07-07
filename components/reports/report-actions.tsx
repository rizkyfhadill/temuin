"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Bookmark, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/types";

export function ReportActions({
  reportId,
  ownerId,
  status,
}: {
  reportId: string;
  ownerId: string;
  status: ReportStatus;
}) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [bookmarked, setBookmarked] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [returned, setReturned] = React.useState(status === "returned");
  const isOwner = !!user && user.id === ownerId;

  React.useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    supabase
      .from("bookmarks")
      .select("id")
      .eq("report_id", reportId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data));
  }, [user, reportId]);

  const requireLogin = () => {
    toast.error("Silakan login untuk melanjutkan");
    router.push(`/login?next=/reports/${reportId}`);
  };

  const startChat = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    const json = await res.json();
    setBusy(false);
    if (json.roomId) {
      router.push(`/dashboard/messages?room=${json.roomId}`);
    } else if (res.status === 401) {
      requireLogin();
    } else {
      toast.error(json.error || "Gagal membuat percakapan");
    }
  };

  const toggleBookmark = async () => {
    if (!user) return requireLogin();
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      setBookmarked((v) => !v);
      toast.success("Bookmark (demo) disimpan secara lokal");
      return;
    }
    setBusy(true);
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("report_id", reportId).eq("user_id", user.id);
      setBookmarked(false);
      toast.success("Bookmark dihapus");
    } else {
      await supabase.from("bookmarks").insert({ report_id: reportId, user_id: user.id });
      setBookmarked(true);
      toast.success("Disimpan ke bookmark");
    }
    setBusy(false);
  };

  const markReturned = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !user) return;
    setBusy(true);
    const { error } = await supabase.from("reports").update({ status: "returned" }).eq("id", reportId).eq("owner_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    setReturned(true);
    toast.success("Tandai barang sudah kembali");
  };

  const guest = !loading && role === "guest";

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={startChat} disabled={busy || (isOwner ? true : false)} className="flex-1 sm:flex-none">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
        {guest ? "Masuk untuk Berdiskusi" : isOwner ? "Ini laporan Anda" : "💬 Kirim Pesan"}
      </Button>

      <Button variant="outline" onClick={toggleBookmark} disabled={busy || guest} className={cn(bookmarked && "text-primary")}>
        <Bookmark className={cn("size-4", bookmarked && "fill-primary")} />
        {bookmarked ? "Tersimpan" : "Bookmark"}
      </Button>

      {isOwner && !returned && (
        <Button variant="success" onClick={markReturned} disabled={busy}>
          <CheckCircle2 className="size-4" /> Tandai Sudah Kembali
        </Button>
      )}
      {returned && (
        <span className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" /> Berhasil Dikembalikan
        </span>
      )}
    </div>
  );
}
