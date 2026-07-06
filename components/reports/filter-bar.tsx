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
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q });
        }}
        className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-soft"
      >
        <Search className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul atau deskripsi…"
          className="border-0 shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Cari
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => push({ type: t.value })}>
            <Badge variant={activeType === t.value ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {t.label}
            </Badge>
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        {categories.map((c) => (
          <button key={c.name} onClick={() => push({ category: activeCat === c.name ? "" : c.name })}>
            <Badge
              variant={activeCat === c.name ? "secondary" : "outline"}
              className={cn("cursor-pointer px-3 py-1.5", activeCat === c.name && "bg-secondary")}
            >
              {c.name}
            </Badge>
          </button>
        ))}
        {(activeType || activeCat || q) && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); router.push("/reports"); }}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
