"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Search, ArrowLeft, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageBubble, type ChatMessage } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { LiveTracker } from "@/components/tracking/live-tracker";
import { MapPin } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn, timeAgo, formatDateTime } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface RoomView {
  id: string;
  report_id: string | null;
  other: Profile;
  last_message: string | null;
  last_message_at: string | null;
}

function MessagesInner() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseBrowserSafe();

  const [rooms, setRooms] = React.useState<RoomView[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(params.get("room"));
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [text, setText] = React.useState(""); // unused but kept for input sync
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null);
  const [typing, setTyping] = React.useState(false);
  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [loadingMsgs, setLoadingMsgs] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [aiOpen, setAiOpen] = React.useState(false);
  const [aiAnswer, setAiAnswer] = React.useState("");
  const [trackOpen, setTrackOpen] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const channelRef = React.useRef<any>(null);
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const myId = user?.id ?? profile?.id;

  // Load rooms
  React.useEffect(() => {
    if (authLoading || !supabase || !myId) {
      if (!authLoading) setLoadingRooms(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("id, report_id, user_a, user_b, last_message, last_message_at, profile_a:profiles!chat_rooms_user_a_fkey(*), profile_b:profiles!chat_rooms_user_b_fkey(*)")
        .or(`user_a.eq.${myId},user_b.eq.${myId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      const list: RoomView[] = (data ?? []).map((r: any) => {
        const other = r.user_a === myId ? r.profile_b : r.profile_a;
        return {
          id: r.id,
          report_id: r.report_id,
          other: other as Profile,
          last_message: r.last_message,
          last_message_at: r.last_message_at,
        };
      });
      setRooms(list);
      setLoadingRooms(false);
      if (!activeId && list[0]) setActiveId(list[0].id);
    })();
  }, [authLoading, supabase, myId, activeId]);

  // Load messages + subscribe
  React.useEffect(() => {
    if (authLoading || !supabase || !activeId || !myId) return;
    let cancelled = false;
    setLoadingMsgs(true);
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles(*)")
        .eq("room_id", activeId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const msgs: ChatMessage[] = (data ?? []).map(mapMsg);
      setMessages(msgs);
      setLoadingMsgs(false);
      scrollToBottom();
      // Mark unread as read
      markRead(msgs);
    })();

    const channel = supabase
      .channel(`room:${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${activeId}` }, (payload) => {
        setMessages((m) => [...m, mapMsg(payload.new)]);
        scrollToBottom();
        // If from other, mark read
        if (payload.new.sender_id !== myId) markReadOne(payload.new.id);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `room_id=eq.${activeId}` }, (payload) => {
        setMessages((m) => m.map((x) => (x.id === payload.new.id ? mapMsg(payload.new) : x)));
      })
      .on("broadcast", { event: "typing" }, () => {
        setTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [authLoading, supabase, activeId, myId]);

  function mapMsg(r: any): ChatMessage {
    return {
      ...r,
      sender: r.sender
        ? { id: r.sender.id, username: r.sender.username, full_name: r.sender.full_name, avatar_url: r.sender.avatar_url, role: r.sender.role, city: r.sender.city, bio: r.sender.bio, verified: r.sender.verified, suspended: r.sender.suspended, created_at: r.sender.created_at, updated_at: r.sender.updated_at }
        : undefined,
    } as ChatMessage;
  }

  const scrollToBottom = () => setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);

  const markRead = (msgs: ChatMessage[]) => {
    if (!supabase || !myId) return;
    msgs
      .filter((m) => m.sender_id !== myId && (!m.read_by || !m.read_by.includes(myId)))
      .forEach((m) => markReadOne(m.id));
  };
  const markReadOne = async (id: string) => {
    if (!supabase || !myId) return;
    const cur = messages.find((m) => m.id === id);
    const arr = Array.from(new Set([...(cur?.read_by ?? []), myId!]));
    await supabase.from("messages").update({ read_by: arr }).eq("id", id);
  };

  const send = async (body: string, image: File | null) => {
    if (!supabase || !myId || !activeId) return;
    let imageUrl: string | null = null;
    if (image) {
      const path = `${activeId}/${Date.now()}-${image.name}`;
      const { error } = await supabase.storage.from("chat-images").upload(path, image);
      if (!error) imageUrl = supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("messages").insert({
      room_id: activeId,
      sender_id: myId,
      body,
      image_url: imageUrl,
      reply_to: replyTo?.id ?? null,
      read_by: [myId],
    });
    if (error) return toast.error(error.message);
    // Update room last message
    await supabase.from("chat_rooms").update({ last_message: body || "📷 Gambar", last_message_at: new Date().toISOString() }).eq("id", activeId);
    setReplyTo(null);
  };

  const editMsg = async (m: ChatMessage, newBody: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("messages").update({ body: newBody, edited: true }).eq("id", m.id).eq("sender_id", myId);
    if (error) toast.error(error.message);
  };
  const deleteMsg = async (m: ChatMessage) => {
    if (!supabase) return;
    const { error } = await supabase.from("messages").update({ deleted: true, body: "" }).eq("id", m.id).eq("sender_id", myId);
    if (error) toast.error(error.message);
  };

  const onTyping = () => {
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: {} });
  };

  const activeRoom = rooms.find((r) => r.id === activeId);

  if (!supabase) {
    return (
      <CardEmpty title="Supabase belum terhubung">
        Hubungkan proyek Supabase untuk menggunakan fitur chat realtime.
      </CardEmpty>
    );
  }

  const filtered = search ? messages.filter((m) => m.body?.toLowerCase().includes(search.toLowerCase())) : messages;

  return (
    <div className="grid h-[calc(100vh-9rem)] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <div className={cn("flex flex-col border-r border-border", activeId && "hidden lg:flex")}>
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari percakapan…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin">
          {loadingRooms ? (
            <p className="p-4 text-sm text-muted-foreground">Memuat…</p>
          ) : rooms.length === 0 ? (
            <EmptyConversations />
          ) : (
            rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveId(r.id);
                  setSearch("");
                  router.replace(`/dashboard/messages?room=${r.id}`);
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-accent",
                  r.id === activeId && "bg-accent"
                )}
              >
                <Avatar src={r.other.avatar_url} name={r.other.username} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">@{r.other.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.last_message || "Belum ada pesan"}</p>
                </div>
                {r.last_message_at && <span className="text-[10px] text-muted-foreground">{timeAgo(r.last_message_at)}</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeRoom ? (
        <div className={cn("flex flex-col", !activeId && "hidden lg:flex")}>
          <div className="flex items-center gap-3 border-b border-border p-3">
            <button className="lg:hidden" onClick={() => setActiveId(null)} aria-label="Kembali">
              <ArrowLeft className="size-5" />
            </button>
            <Avatar src={activeRoom.other.avatar_url} name={activeRoom.other.username} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">@{activeRoom.other.username}</p>
              <p className="text-xs text-muted-foreground">{typing ? "sedang mengetik…" : "Pesan aman di Temuin"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setAiOpen((v) => !v)} title="AI Assistant"><Sparkles className="size-4 text-primary" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setTrackOpen(true)} title="Live Tracking"><MapPin className="size-4 text-primary" /></Button>
          </div>

          {aiOpen && (
            <div className="border-b border-border bg-primary/5 p-3 text-sm">
              <p className="font-medium text-primary">AI Safety Assistant</p>
              <p className="mt-1 text-muted-foreground">
                Tips: minta penemu menjelaskan ciri khusus barang, dan lakukan serah terima di tempat umum yang aman.
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={async () => {
                const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "apakah laporan ini kemungkinan cocok?" }) });
                const j = await res.json();
                setAiAnswer(j.answer);
              }}>Analisis kecocokan</Button>
              {aiAnswer && <p className="mt-2 rounded-lg bg-card p-2 text-xs">{aiAnswer}</p>}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scroll-thin p-4">
            {loadingMsgs ? (
              <div className="grid h-full place-items-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <MessageSquare className="mx-auto mb-2 size-8" />
                  Mulai percakapan dengan @{activeRoom.other.username}
                </div>
              </div>
            ) : (
              filtered.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isOwn={m.sender_id === myId}
                  otherAvatar={activeRoom.other.avatar_url}
                  onReply={setReplyTo}
                  onEdit={(msg) => {
                    const nb = prompt("Edit pesan:", msg.body || "");
                    if (nb && nb !== msg.body) editMsg(msg, nb);
                  }}
                  onDelete={deleteMsg}
                />
              ))
            )}
          </div>

          <ChatInput onSend={send} replyTo={replyTo ? { username: replyTo.sender?.username ?? "?", body: replyTo.body ?? "" } : null} onClearReply={() => setReplyTo(null)} onTyping={onTyping} />

          <LiveTracker
            open={trackOpen}
            onClose={() => setTrackOpen(false)}
            roomId={activeId}
            otherName={activeRoom?.other.username ?? ""}
          />
        </div>
      ) : (
        <div className="hidden items-center justify-center text-sm text-muted-foreground lg:flex">Pilih percakapan</div>
      )}
    </div>
  );
}

function CardEmpty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid h-[60vh] place-items-center rounded-xl border border-dashed border-border p-10 text-center">
      <div>
        <MessageSquare className="mx-auto mb-3 size-10 text-muted-foreground" />
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
      <div>
        <MessageSquare className="mx-auto mb-2 size-8" />
        Belum ada percakapan. Buka detail laporan dan klik “Kirim Pesan”.
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Memuat…</div>}>
      <MessagesInner />
    </Suspense>
  );
}
