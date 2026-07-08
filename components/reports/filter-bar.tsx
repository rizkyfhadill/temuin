"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getProvinces, getRegencies } from "@/lib/region";
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
  const [provinces, setProvinces] = React.useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = React.useState<{ id: string; name: string }[]>([]);
  const [province, setProvince] = React.useState(params.get("province") ?? "");
  const [city, setCity] = React.useState(params.get("city") ?? "");

  const push = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    router.push(`/reports?${sp.toString()}`);
  };

  const activeType = params.get("type") ?? "";
  const activeCat = params.get("category") ?? "";

  React.useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProvinces();
  }, []);

  React.useEffect(() => {
    const loadCities = async () => {
      if (!province) {
        setCities([]);
        return;
      }

      const selected = provinces.find((p) => p.name === province);
      if (!selected) return;

      try {
        const data = await getRegencies(selected.id);
        setCities(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCities();
  }, [province, provinces]);

  React.useEffect(() => {
    setProvince(params.get("province") ?? "");
    setCity(params.get("city") ?? "");
  }, [params]);

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q });
        }}
        className="grid gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[1fr_auto]"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
          <Search className="size-5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari laporan..."
            className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <Button type="submit" size="sm" className="h-11 w-full sm:w-auto text-sm">
          Cari
        </Button>
      </form>

      <div className="grid gap-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {TYPES.map((t) => {
              const isActive = activeType === t.value;
              const variant =
                t.value === "lost"
                  ? "destructive"
                  : t.value === "found"
                  ? "success"
                  : isActive
                  ? "default"
                  : "outline";

              return (
                <Button
                  key={t.value}
                  type="button"
                  variant={variant}
                  size="sm"
                  onClick={() => push({ type: t.value })}
                  className={cn(
                    "min-w-[88px] px-3 text-xs sm:text-sm",
                    isActive && "shadow-glow"
                  )}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>
          {(activeType || activeCat || q || province || city) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                router.push("/reports");
              }}
              className="h-11 w-full sm:w-auto text-sm"
            >
              Reset Filter
            </Button>
          )}
        </div>

        <div className="flex min-h-[48px] overflow-x-auto rounded-3xl border border-border bg-background p-3">
          <div className="flex items-center gap-2">
            {categories.map((c) => (
              <button key={c.name} onClick={() => push({ category: activeCat === c.name ? "" : c.name })}>
                <Badge
                  variant={activeCat === c.name ? "secondary" : "outline"}
                  className={cn(
                    "cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-xs sm:text-sm",
                    activeCat === c.name && "bg-secondary"
                  )}
                >
                  {c.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="province" className="text-xs sm:text-sm text-muted-foreground">Provinsi</Label>
            <select
              id="province"
              value={province}
              onChange={(e) => {
                const nextProvince = e.target.value;
                setProvince(nextProvince);
                setCity("");
                push({ province: nextProvince, city: "" });
              }}
              className="mt-2 h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Semua provinsi</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.name}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="city" className="text-xs sm:text-sm text-muted-foreground">Kota</Label>
            <select
              id="city"
              value={city}
              onChange={(e) => {
                const nextCity = e.target.value;
                setCity(nextCity);
                push({ city: nextCity });
              }}
              disabled={!province}
              className="mt-2 h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{province ? `Semua kota di ${province}` : "Pilih provinsi dulu"}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
