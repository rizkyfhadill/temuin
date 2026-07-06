import { Users, PackageSearch, PackageCheck, ArrowLeftRight, Clock, ShieldAlert } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/anim/reveal";

export interface Stats {
  totalUsers: number;
  totalReports: number;
  lost: number;
  found: number;
  returned: number;
  today: number;
  pending: number;
}

export function StatsSection({ stats }: { stats: Stats }) {
  const items = [
    { icon: Users, label: "Pengguna", value: stats.totalUsers },
    { icon: PackageSearch, label: "Total Laporan", value: stats.totalReports },
    { icon: ArrowLeftRight, label: "Barang Hilang / Temuan", value: stats.lost + stats.found },
    { icon: PackageCheck, label: "Berhasil Dikembalikan", value: stats.returned },
    { icon: Clock, label: "Laporan Hari Ini", value: stats.today },
    { icon: ShieldAlert, label: "Menunggu Verifikasi", value: stats.pending },
  ];

  return (
    <section id="statistik" className="scroll-mt-20 border-b border-border bg-card/40 py-16 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dampak Temuin</h2>
          <p className="mt-3 text-muted-foreground">
            Bersama komunitas, kita kembalikan barang berharga ke pemiliknya.
          </p>
        </div>
        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" stagger={0.06}>
          {items.map((it) => (
            <RevealItem key={it.label}>
              <div className="group h-full rounded-xl border border-border bg-background p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft">
                <div className="mx-auto grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <it.icon className="size-5" />
                </div>
                <p className="mt-3 text-2xl font-extrabold tabular-nums">
                  {new Intl.NumberFormat("id-ID", { notation: "compact" }).format(it.value)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{it.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
