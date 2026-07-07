import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReportCard } from "@/components/report-card";
import type { Report } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/anim/reveal";

export function LatestReports({ reports }: { reports: Report[] }) {
  return (
    <section id="laporan-terbaru" className="border-b border-border py-16 md:py-24">
      <div className="container">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Laporan Terbaru</h2>
            <p className="mt-3 text-muted-foreground">
              Lihat langsung tanpa login. Temukan barang yang kamu cari.
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/reports">
              Lihat Semua <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
        <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" delay={0.05}>
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
