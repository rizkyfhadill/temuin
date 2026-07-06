"use client";

import * as React from "react";
import { Users, FileText, ArrowLeftRight, PackageCheck, Clock, ShieldAlert, Activity, PieChart, MapPin } from "lucide-react";
import { StatCard, BarChart, DonutChart, AreaChart } from "@/components/admin/charts";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { SUPABASE_LIVE } from "@/lib/data";

export default function AdminDashboard() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      // Demo analytics derived from seed.
      setData({
        totalUsers: 12840, totalReports: 9340, lost: 5210, found: 4130, returned: 2870, today: 142, pending: 38,
        activity: [12, 18, 15, 22, 19, 27, 24],
        categories: [
          { label: "Dompet", value: 1820, color: "#DC2626" },
          { label: "Kunci", value: 1240, color: "#2563EB" },
          { label: "Elektronik", value: 2110, color: "#7C3AED" },
          { label: "Dokumen", value: 980, color: "#0891B2" },
          { label: "Lainnya", value: 3190, color: "#64748B" },
        ],
        cities: [
          { label: "Jakarta", value: 3120 },
          { label: "Bandung", value: 1840 },
          { label: "Surabaya", value: 1510 },
          { label: "Yogyakarta", value: 1120 },
          { label: "Medan", value: 760 },
        ],
      });
      return;
    }
    (async () => {
      const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
      const [
        users, total, lost, found, returned, today, pending,
        cats, cities, activityRows,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("type", "lost"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("type", "found"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "returned"),
        supabase.from("reports").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 864e5).toISOString()),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reports").select("categories(name)").eq("status", "published"),
        supabase.from("reports").select("city"),
        supabase.from("reports").select("created_at").gte("created_at", since7).order("created_at"),
      ]);
      // Aggregate
      const catMap = new Map<string, number>();
      (cats.data ?? []).forEach((r: any) => {
        const n = r.categories?.name || "Lainnya";
        catMap.set(n, (catMap.get(n) ?? 0) + 1);
      });
      const palette = ["#DC2626", "#2563EB", "#7C3AED", "#0891B2", "#16A34A", "#D97706", "#64748B"];
      const categories = [...catMap.entries()].map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
      const cityMap = new Map<string, number>();
      (cities.data ?? []).forEach((r: any) => { if (r.city) cityMap.set(r.city, (cityMap.get(r.city) ?? 0) + 1); });
      const citiesArr = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));

      // 7-day activity buckets
      const buckets = new Array(7).fill(0);
      (activityRows.data ?? []).forEach((r: any) => {
        const day = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 864e5);
        if (day >= 0 && day < 7) buckets[6 - day]++;
      });

      setData({
        totalUsers: users.count ?? 0, totalReports: total.count ?? 0, lost: lost.count ?? 0,
        found: found.count ?? 0, returned: returned.count ?? 0, today: today.count ?? 0, pending: pending.count ?? 0,
        activity: buckets, categories, cities: citiesArr,
      });
    })();
  }, []);

  if (!data) return <p className="text-sm text-muted-foreground">Memuat analitik…</p>;

  const cards = [
    { label: "Total User", value: data.totalUsers, icon: Users, sub: "Pengguna terdaftar" },
    { label: "Total Laporan", value: data.totalReports, icon: FileText, sub: "Semua laporan" },
    { label: "Barang Hilang", value: data.lost, icon: ArrowLeftRight, sub: "Laporan hilang" },
    { label: "Barang Ditemukan", value: data.found, icon: ArrowLeftRight, sub: "Laporan temuan" },
    { label: "Berhasil Dikembalikan", value: data.returned, icon: PackageCheck, sub: "Barang kembali" },
    { label: "Laporan Hari Ini", value: data.today, icon: Clock, sub: "24 jam terakhir" },
    { label: "Menunggu Verifikasi", value: data.pending, icon: ShieldAlert, sub: "Perlu tinjauan" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">Kontrol penuh kualitas & keamanan platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-2 p-5 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold"><Activity className="size-4 text-primary" /> Grafik Aktivitas (7 hari)</h3>
          <AreaChart data={data.activity} />
        </Card>
        <Card className="space-y-2 p-5">
          <h3 className="flex items-center gap-2 font-semibold"><PieChart className="size-4 text-primary" /> Grafik Kategori</h3>
          <DonutChart data={data.categories} />
        </Card>
      </div>

      <Card className="space-y-2 p-5">
        <h3 className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-primary" /> Grafik Kota Teratas</h3>
        <BarChart data={data.cities} />
      </Card>
    </div>
  );
}
