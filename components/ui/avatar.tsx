"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { avatarUrl } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
}

export function Avatar({ src, name, className, size = 36 }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "avatar"}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </span>
  );
}

export { avatarUrl };
