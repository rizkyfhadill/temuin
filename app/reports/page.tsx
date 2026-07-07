import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterBar } from "@/components/reports/filter-bar";
import { ReportCard } from "@/components/report-card";
import { Pagination } from "@/components/pagination";
import { getPublishedReports, getPublishedReportsCount, getCategories } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Cari Barang Hilang & Ditemukan",
  description: "Jelajahi laporan barang hilang dan ditemukan di seluruh Indonesia.",
};

const ITEMS_PER_PAGE = 12;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string; city?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10));
  
  const [reports, totalCount, categories] = await Promise.all([
    getPublishedReports({
      q: sp.q,
      type: sp.type as "lost" | "found" | undefined,
      category: sp.category,
      city: sp.city,
      limit: ITEMS_PER_PAGE,
      page: currentPage - 1,
    }),
    getPublishedReportsCount({
      q: sp.q,
      type: sp.type as "lost" | "found" | undefined,
      category: sp.category,
      city: sp.city,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Reset to page 1 if current page is out of range
  if (currentPage > totalPages && totalPages > 0) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Cari Barang</h1>
          <p className="mt-2 text-muted-foreground">Halaman tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cari Barang</h1>
        <p className="mt-2 text-muted-foreground">
          Temukan barang hilang atau ditemukan. {totalCount} laporan ditemukan.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <FilterBar categories={categories.map((c) => ({ name: c.name }))} />
      </Suspense>

      {reports.length > 0 ? (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/reports"
            />
          )}
        </>
      ) : (
        <div className="mt-16 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-semibold">Tidak ada laporan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba ubah kata kunci atau filter kategori.
          </p>
        </div>
      )}
    </div>
  );
}
