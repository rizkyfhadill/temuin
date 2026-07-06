import * as React from "react";
import {
  Sparkles,
  Link2,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  BadgeCheck,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { Badge as BadgeType, BadgeTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Link2,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  BadgeCheck,
};

const TIER_RING: Record<BadgeTier, string> = {
  bronze: "ring-amber-700/40",
  silver: "ring-slate-400/50",
  gold: "ring-yellow-400/60",
};

export function BadgeIcon({ badge, size = 18, className }: { badge: BadgeType; size?: number; className?: string }) {
  const Icon = ICONS[badge.icon] ?? Award;
  return (
    <span
      className={cn("grid place-items-center rounded-full text-white shadow-sm ring-2", TIER_RING[badge.tier])}
      style={{ width: size + 10, height: size + 10, background: badge.color, fontSize: size }}
    >
      <Icon style={{ width: size, height: size }} />
    </span>
  );
}

export function BadgeChip({
  badge,
  showLabel = true,
  className,
}: {
  badge: BadgeType;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft",
        className
      )}
      title={badge.description}
    >
      <BadgeIcon badge={badge} size={16} />
      {showLabel && <span>{badge.name}</span>}
    </span>
  );
}

export function BadgeShelf({
  badges,
  empty = "Belum ada badge.",
}: {
  badges: BadgeType[];
  empty?: string;
}) {
  if (!badges.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <BadgeChip key={b.id} badge={b} />
      ))}
    </div>
  );
}

// A grid of all badges.
//  - Omit `earnedKeys` to render a neutral "catalog" of every badge (e.g. on the leaderboard).
//  - Pass a Set of keys to highlight the viewer's earned badges and dim the rest.
export function BadgeGallery({
  all,
  earnedKeys,
}: {
  all: BadgeType[];
  earnedKeys?: Set<string>;
}) {
  const catalog = !earnedKeys;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {all.map((b) => {
        const earned = !catalog && earnedKeys!.has(b.key);
        return (
          <div
            key={b.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 transition-colors",
              catalog
                ? "border-border bg-card"
                : earned
                  ? "border-border bg-card"
                  : "border-dashed border-border bg-muted/30 opacity-70"
            )}
          >
            <div className={cn(!catalog && !earned && "grayscale")}>
              <BadgeIcon badge={b} size={20} />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                {b.name}
                {earned && <span className="text-[10px] font-bold uppercase text-success">dapat</span>}
              </p>
              <p className="text-xs text-muted-foreground">{b.description}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">Syarat: {b.criteria}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
