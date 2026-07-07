"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Lock, AtSign } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { formatDateTime } from "@/lib/utils";
import type { CommentRow } from "@/lib/data";

function parseMentions(body: string): string[] {
  return [...body.matchAll(/@([a-zA-Z0-9_]+)/g)].map((m) => m[1]);
}

export function Discussion({
  reportId,
  initialComments,
  locked,
}: {
  reportId: string;
  initialComments: CommentRow[];
  locked: boolean;
}) {
  const { user, profile, role, loading } = useAuth();
  const [comments, setComments] = React.useState<CommentRow[]>(initialComments);
  const [body, setBody] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const guest = !user && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!body.trim()) return;
    setPosting(true);
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      // Demo mode: optimistic local comment.
      setComments((c) => [
        ...c,
        {
          id: `local_${Date.now()}`,
          report_id: reportId,
          user_id: profile.id,
          parent_id: null,
          body: body.trim(),
          mentions: parseMentions(body),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: profile,
        },
      ]);
      setBody("");
      setPosting(false);
      toast.success("Komentar (demo) ditambahkan");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({
        report_id: reportId,
        user_id: user.id,
        body: body.trim(),
        mentions: parseMentions(body),
      })
      .select("*, author:profiles(*)")
      .single();
    setPosting(false);
    if (error) return toast.error(error.message);
    const mapped: CommentRow = {
      ...data,
      author: data.author
        ? { id: data.author.id, username: data.author.username, full_name: data.author.full_name, avatar_url: data.author.avatar_url, role: data.author.role, city: data.author.city, bio: data.author.bio, verified: data.author.verified, suspended: data.author.suspended, created_at: data.author.created_at, updated_at: data.author.updated_at }
        : undefined,
    };
    setComments((c) => [...c, mapped]);
    setBody("");
    toast.success("Komentar terkirim");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        Diskusi Laporan <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
      </h3>

      {guest ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <AtSign className="mx-auto mb-2 size-5" />
          <Link href={`/login?next=/reports/${reportId}`} className="font-medium text-primary hover:underline">
            Masuk
          </Link>{" "}
          untuk ikut berdiskusi, memberi petunjuk, atau mention @username.
        </div>
      ) : locked ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <Lock className="size-4" /> Komentar dikunci oleh admin.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tulis petunjuk, informasi, atau mention @username…"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Gunakan @username untuk mention.</span>
            <Button type="submit" size="sm" disabled={posting || !body.trim()}>
              <Send className="size-4" /> Kirim
            </Button>
          </div>
        </form>
      )}

      <div className="mt-5 space-y-4">
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Belum ada diskusi. Jadilah yang pertama!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar
              src={c.author?.avatar_url}
              name={c.author?.full_name || c.author?.username || c.user_id}
              size={36}
            />
            <div className="flex-1 rounded-lg border border-border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">
                  {c.author?.full_name ? c.author.full_name : `@${c.author?.username ?? c.user_id}`}
                </span>
                {c.author?.verified && <span className="text-xs text-primary">✓</span>}
                <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
