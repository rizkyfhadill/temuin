"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  end?: boolean; // exact match for active
}

export function DashboardNav({
  items,
  className,
  orientation = "vertical",
}: {
  items: NavItem[];
  className?: string;
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  const isActive = (href: string, end?: boolean) =>
    end ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  if (orientation === "horizontal") {
    // Mobile bottom bar
    return (
      <nav className={cn("flex items-stretch justify-around", className)}>
        {items.slice(0, 5).map((it) => {
          const active = isActive(it.href, it.end);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <it.icon className="size-5" />
                {it.badge ? (
                  <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {it.badge > 9 ? "9+" : it.badge}
                  </span>
                ) : null}
              </span>
              {it.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("grid gap-1", className)}>
      {items.map((it) => {
        const active = isActive(it.href, it.end);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <it.icon className="size-[18px]" />
            <span className="flex-1">{it.label}</span>
            {it.badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {it.badge > 99 ? "99+" : it.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
