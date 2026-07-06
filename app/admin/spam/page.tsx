import { AdminReportsTable } from "@/components/admin/reports-table";

export default function AdminSpamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Spam</h1>
        <p className="text-muted-foreground">Kelola laporan yang ditandai sebagai spam.</p>
      </div>
      <AdminReportsTable scope="spam" />
    </div>
  );
}
