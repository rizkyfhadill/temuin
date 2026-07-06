import * as React from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-lg" style={{ backgroundColor: (accent ?? "#DC2626") + "1a", color: accent ?? "#DC2626" }}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function BarChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-primary transition-all duration-500"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 60;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6 rounded-xl border border-border bg-card p-5">
      <svg viewBox="0 0 160 160" className="size-36">
        <circle cx="80" cy="80" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="18" />
        {data.map((d) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx="80" cy="80" r={r} fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += len;
          return seg;
        })}
        <text x="80" y="76" textAnchor="middle" className="fill-foreground text-lg font-bold">{total}</text>
        <text x="80" y="94" textAnchor="middle" className="fill-muted-foreground text-[10px]">Total</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label} <span className="text-muted-foreground">({d.value})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AreaChart({ data, labels }: { data: number[]; labels?: string[] }) {
  const w = 600, h = 160;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 20) - 10}`);
  const path = `M ${pts.join(" L ")}`;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w},${h} L 0,${h} Z`} fill="url(#ag)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
