import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterBar } from "@/components/reports/filter-bar";
import { ReportCard } from "@/components/report-card";
import { getPublishedReports, getCategories } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Cari Barang Hilang & Ditemukan",
  description: "Jelajahi laporan barang hilang dan ditemukan di seluruh Indonesia.",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string; city?: string }>;
}) {
  const sp = await searchParams;
  const [reports, categories] = await Promise.all([
    getPublishedReports({
      q: sp.q,
      type: sp.type as "lost" | "found" | undefined,
      category: sp.category,
      city: sp.city,
      limit: 24,
    }),
    getCategories(),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cari Barang</h1>
        <p className="mt-2 text-muted-foreground">
          Temukan barang hilang atau ditemukan. {reports.length} laporan ditemukan.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <FilterBar categories={categories.map((c) => ({ name: c.name }))} />
      </Suspense>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>

      {reports.length === 0 && (
        <div className="mt-16 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-semibold">Tidak ada laporan</p>
          <p className="mt-1 text-sm text-muted-foreground">Coba ubah kata kunci atau filter kategori.</p>
        </div>
      )}
    </div>
  );
}
