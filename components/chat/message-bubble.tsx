"use client";

import * as React from "react";
import { Check, CheckCheck, MoreVertical, Pencil, Trash2, Reply } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { Message, Profile } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";

export interface ChatMessage extends Message {
  replyToMessage?: ChatMessage | null;
}

export function MessageBubble({
  message,
  isOwn,
  otherAvatar,
  onReply,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  isOwn: boolean;
  otherAvatar?: string | null;
  onReply: (m: ChatMessage) => void;
  onEdit: (m: ChatMessage) => void;
  onDelete: (m: ChatMessage) => void;
}) {
  const [menu, setMenu] = React.useState(false);
  const read = message.read_by && message.read_by.length > 1;

  if (message.deleted) {
    return (
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <span className="rounded-lg bg-muted px-3 py-2 text-xs italic text-muted-foreground">
          Pesan dihapus
        </span>
      </div>
    );
  }

  return (
    <div className={cn("group flex gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
          <Avatar
            src={otherAvatar}
            name={message.sender?.full_name || message.sender?.username || "Pengguna"}
            size={28}
            className="mt-auto"
          />
          <span className="truncate">@{message.sender?.username || message.sender?.full_name || "pengguna"}</span>
        </div>
      )}
      <div className={cn("relative max-w-[78%]", isOwn && "items-end")}>
        {message.replyToMessage && !message.replyToMessage.deleted && (
          <div className="mb-1 rounded-lg border-l-2 border-primary/50 bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
            @{message.replyToMessage.sender?.username || message.replyToMessage.sender?.full_name || "pengguna"}: {message.replyToMessage.body?.slice(0, 60)}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm shadow-sm",
            isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-muted text-foreground"
          )}
        >
          {message.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <a href={message.image_url} target="_blank" rel="noreferrer">
              <img src={message.image_url} alt="lampiran" className="mb-1 max-h-56 rounded-lg object-cover" />
            </a>
          )}
          {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        </div>
        <div className={cn("mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground", isOwn && "justify-end")}>
          <span>{formatDateTime(message.created_at)}</span>
          {isOwn &&
            (read ? <CheckCheck className="size-3 text-primary" /> : <Check className="size-3" />)}
        </div>

        {/* Hover actions */}
        <div className={cn("absolute -top-3 opacity-0 transition-opacity group-hover:opacity-100", isOwn ? "left-0" : "right-0")}>
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 shadow-sm">
            <button onClick={() => onReply(message)} className="rounded-full p-1 hover:bg-accent" title="Balas"><Reply className="size-3.5" /></button>
            {isOwn && (
              <>
                <button onClick={() => onEdit(message)} className="rounded-full p-1 hover:bg-accent" title="Edit"><Pencil className="size-3.5" /></button>
                <button onClick={() => onDelete(message)} className="rounded-full p-1 hover:bg-accent text-destructive" title="Hapus"><Trash2 className="size-3.5" /></button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
