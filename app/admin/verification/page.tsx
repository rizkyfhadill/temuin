import { AdminReportsTable } from "@/components/admin/reports-table";

export default function AdminVerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi Laporan</h1>
        <p className="text-muted-foreground">Laporan baru menunggu persetujuan sebelum dipublikasikan.</p>
      </div>
      <AdminReportsTable scope="pending" />
    </div>
  );
}
