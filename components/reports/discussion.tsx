"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Lock, AtSign, X } from "lucide-react";
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

function renderMentions(text: string): (string | React.ReactNode)[] {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const regex = /@([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add mention as highlighted span
    parts.push(
      <span key={`mention-${match.index}`} className="font-semibold text-primary">
        @{match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
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
  const [replyTo, setReplyTo] = React.useState<CommentRow | null>(null);
  const guest = !user && !loading;
  const commentsContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments added
  React.useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

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
          parent_id: replyTo?.id ?? null,
          body: body.trim(),
          mentions: parseMentions(body),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: profile,
        },
      ]);
      setBody("");
      setReplyTo(null);
      setPosting(false);
      toast.success("Komentar (demo) ditambahkan");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({
        report_id: reportId,
        user_id: user.id,
        parent_id: replyTo?.id ?? null,
        body: body.trim(),
        mentions: parseMentions(body),
      })
      .select("*, author:profiles(*)")
      .single();
    setPosting(false);
    if (error) return toast.error(error.message);
    const mapped: CommentRow = {
      ...data,
      author: data.author && data.author.id
        ? { id: data.author.id, username: data.author.username, full_name: data.author.full_name, avatar_url: data.author.avatar_url, role: data.author.role, city: data.author.city, bio: data.author.bio, verified: data.author.verified, suspended: data.author.suspended, created_at: data.author.created_at, updated_at: data.author.updated_at }
        : profile ? { id: profile.id, username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url, role: profile.role, city: profile.city, bio: profile.bio, verified: profile.verified, suspended: profile.suspended, created_at: profile.created_at, updated_at: profile.updated_at } : undefined,
    };
    setComments((c) => [...c, mapped]);
    setBody("");
    setReplyTo(null);
    toast.success("Komentar terkirim");
  };

  return (
    <div className="rounded-lg sm:rounded-xl border border-border bg-card p-3 sm:p-5">
      <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
        Diskusi Laporan <span className="text-xs sm:text-sm font-normal text-muted-foreground">({comments.length})</span>
      </h3>

      {guest ? (
        <div className="mt-4 rounded-lg border border-dashed border-border p-4 sm:p-6 text-center text-xs sm:text-sm text-muted-foreground">
          <AtSign className="mx-auto mb-2 size-4 sm:size-5" />
          <Link href={`/login?next=/reports/${reportId}`} className="font-medium text-primary hover:underline">
            Masuk
          </Link>{" "}
          untuk ikut berdiskusi, memberi petunjuk, atau mention @username.
        </div>
      ) : locked ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 sm:p-4 text-xs sm:text-sm text-warning">
          <Lock className="size-4" /> Komentar dikunci oleh admin.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 rounded-lg border-l-2 border-primary bg-primary/5 p-2 sm:p-3">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Balas ke{" "}
                <span className="font-semibold text-foreground">
                  @{replyTo.author?.username || replyTo.user_id.slice(0, 8)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-auto rounded p-1 hover:bg-primary/10"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tulis petunjuk, informasi, atau mention @username…"
            rows={3}
            className="text-sm"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">Gunakan @username untuk mention.</span>
            <Button type="submit" size="sm" disabled={posting || !body.trim()} className="w-full sm:w-auto">
              <Send className="size-4" /> Kirim
            </Button>
          </div>
        </form>
      )}

      {/* Comments Container - Scrollable if more than 4 */}
      <div
        ref={commentsContainerRef}
        className={`mt-4 sm:mt-5 space-y-3 sm:space-y-4 ${
          comments.length > 4 ? "max-h-[600px] overflow-y-auto rounded-lg border border-border bg-background p-2 sm:p-3" : ""
        }`}
      >
        {comments.length === 0 && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground">Belum ada diskusi. Jadilah yang pertama!</p>
        )}
        {comments.map((c) => {
          const displayName = c.author?.full_name ? c.author.full_name : (c.author?.username ? `@${c.author.username}` : `User ${c.user_id.slice(0, 8)}`);
          const isReply = c.parent_id !== null;
          const parentComment = isReply ? comments.find((cm) => cm.id === c.parent_id) : null;

          return (
            <div key={c.id} className={isReply ? "ml-4 sm:ml-6 border-l-2 border-muted pl-2 sm:pl-3" : ""}>
              {parentComment && (
                <div className="mb-2 text-xs text-muted-foreground">
                  Balas ke{" "}
                  <span className="font-semibold">
                    @{parentComment.author?.username || parentComment.user_id.slice(0, 8)}
                  </span>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <Avatar
                  src={c.author?.avatar_url}
                  name={c.author?.full_name || c.author?.username || c.user_id}
                  size={32}
                  className="flex-shrink-0"
                />
                <div className="flex-1 rounded-lg border border-border bg-background p-2 sm:p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold line-clamp-1">
                      {displayName}
                    </span>
                    {c.author?.verified && <span className="text-xs text-primary">✓</span>}
                    <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {renderMentions(c.body)}
                  </p>
                  {!locked && !guest && (
                    <button
                      onClick={() => setReplyTo(c)}
                      className="mt-1 sm:mt-2 text-xs font-medium text-primary hover:underline"
                    >
                      Balas
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
