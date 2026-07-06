import { AdminReportsTable } from "@/components/admin/reports-table";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Laporan</h1>
        <p className="text-muted-foreground">Lihat, setujui, tolak, edit, hapus, dan tandai spam.</p>
      </div>
      <AdminReportsTable scope="all" />
    </div>
  );
}
