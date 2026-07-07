"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "", label: "Semua" },
  { value: "lost", label: "Hilang" },
  { value: "found", label: "Ditemukan" },
];

export function FilterBar({ categories }: { categories: { name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  const push = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    router.push(`/reports?${sp.toString()}`);
  };

  const activeType = params.get("type") ?? "";
  const activeCat = params.get("category") ?? "";

  return (
    <div className="space-y-3 sm:space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q });
        }}
        className="flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-border bg-card p-1 sm:p-1.5 shadow-soft"
      >
        <Search className="ml-2 size-4 sm:size-5 shrink-0 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari…"
          className="border-0 shadow-none focus-visible:ring-0 text-sm"
        />
        <Button type="submit" size="sm" className="shrink-0 text-xs sm:text-sm">
          Cari
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => push({ type: t.value })}>
            <Badge variant={activeType === t.value ? "default" : "outline"} className="cursor-pointer px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
              {t.label}
            </Badge>
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        {categories.map((c) => (
          <button key={c.name} onClick={() => push({ category: activeCat === c.name ? "" : c.name })}>
            <Badge
              variant={activeCat === c.name ? "secondary" : "outline"}
              className={cn("cursor-pointer px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm", activeCat === c.name && "bg-secondary")}
            >
              {c.name}
            </Badge>
          </button>
        ))}
        {(activeType || activeCat || q) && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); router.push("/reports"); }} className="text-xs sm:text-sm h-7 sm:h-8">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
