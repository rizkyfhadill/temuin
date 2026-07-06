"use client";

import * as React from "react";
import { Smile, Send, ImagePlus, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMOJIS = ["😀","😂","😍","😎","🤔","👍","🙏","🔥","💡","✅","❌","⚠️","📍","⏰","🎉","💬","❤️","🤝","📦","🔍"];

export function ChatInput({
  onSend,
  replyTo,
  onClearReply,
  onTyping,
  disabled,
}: {
  onSend: (text: string, image: File | null) => void;
  replyTo: { username: string; body: string } | null;
  onClearReply: () => void;
  onTyping: () => void;
  disabled?: boolean;
}) {
  const [text, setText] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  const send = () => {
    if (!text.trim() && !image) return;
    onSend(text.trim(), image);
    setText("");
    setImage(null);
    setShowEmoji(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="border-t border-border bg-card p-3">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs">
          <span className="truncate text-muted-foreground">
            Membalas <b>@{replyTo.username}</b>: {replyTo.body.slice(0, 40)}
          </span>
          <button onClick={onClearReply} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
        </div>
      )}
      {image && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
          <Paperclip className="size-3.5" /> {image.name}
          <button onClick={() => setImage(null)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        <Button variant="ghost" size="icon" type="button" onClick={() => fileRef.current?.click()} aria-label="Kirim gambar">
          <ImagePlus className="size-5" />
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" type="button" onClick={() => setShowEmoji((v) => !v)} aria-label="Emoji">
            <Smile className="size-5" />
          </Button>
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-20 grid w-56 grid-cols-5 gap-1 rounded-xl border border-border bg-card p-2 shadow-soft">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setText((t) => t + e);
                    taRef.current?.focus();
                  }}
                  className="rounded p-1 text-lg hover:bg-accent"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKey}
          placeholder="Tulis pesan…"
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <Button size="icon" type="button" onClick={send} disabled={disabled || (!text.trim() && !image)} aria-label="Kirim">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
