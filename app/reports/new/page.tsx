import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { CreateReportForm } from "@/components/reports/create-report-form";

export const metadata: Metadata = {
  title: "Buat Laporan",
  description: "Buat laporan barang hilang atau ditemukan dengan bantuan AI.",
};

export default async function NewReportPage() {
  const categories = await getCategories();
  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Buat Laporan Baru</h1>
        <p className="mt-2 text-muted-foreground">Unggah foto, biarkan AI membantu mengisi detailnya.</p>
      </div>
      <CreateReportForm categories={categories} />
    </div>
  );
}
