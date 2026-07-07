import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/anim/reveal";

export function CtaSection() {
  return (
    <section className="border-b border-border py-12 sm:py-16 md:py-24">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-rose-500/10 px-4 sm:px-6 py-10 sm:py-14 text-center sm:md:px-12 shadow-soft">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
            </div>
            <span className="mx-auto mb-3 sm:mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="size-3 sm:size-3.5" /> Gratis untuk semua warga Indonesia
            </span>
            <h2 className="mx-auto max-w-2xl text-balance text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              Siap menemukan kembali barangmu?
            </h2>
            <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              Buat laporan dalam 30 detik atau jelajahi ribuan laporan serupa. Biarkan AI
              Temuin yang mencocokkannya untukmu.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3">
              <Button asChild size="lg" className="group text-sm sm:text-base">
                <Link href="/reports/new">
                  Buat Laporan <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-sm sm:text-base">
                <Link href="/reports">Jelajahi Laporan</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
