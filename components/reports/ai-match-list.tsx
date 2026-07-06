"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiMatch } from "@/lib/types";

export function AiMatchList({ matches }: { matches: AiMatch[] }) {
  if (matches.length === 0) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
        <Sparkles className="size-5" /> AI Smart Match
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Laporan serupa yang mungkin cocok dengan laporan ini.
      </p>
      <div className="mt-4 space-y-3">
        {matches.map((m) => (
          <Link key={m.id} href={`/reports/${m.matched_report_id}`}>
            <Card className="flex items-center gap-4 p-4 card-hover">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.matched_report?.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{m.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="default">{Math.round(m.score * 100)}% cocok</Badge>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
