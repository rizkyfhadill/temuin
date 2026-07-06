import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/lib/types";

const MAP: Record<ReportStatus, { variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "muted"; label: string }> = {
  draft: { variant: "muted", label: "Draft" },
  pending: { variant: "warning", label: "Menunggu Verifikasi" },
  approved: { variant: "default", label: "Disetujui" },
  published: { variant: "success", label: "Dipublikasikan" },
  rejected: { variant: "destructive", label: "Ditolak" },
  returned: { variant: "success", label: "Berhasil Dikembalikan" },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const { variant, label } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
