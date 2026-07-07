"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, ShieldCheck, MessageSquare, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Ambient background: mesh gradient + animated blobs + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] via-background to-background" />
        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute -right-10 top-8 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl animate-blob [animation-delay:-6s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl animate-blob [animation-delay:-12s]" />
      </div>

      <div className="container grid items-center gap-8 py-12 sm:gap-12 sm:py-16 md:grid-cols-2 md:py-28">
        {/* Left: copy */}
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <Badge variant="default" className="mb-4 sm:mb-5 gap-1.5 py-1 pl-2 pr-3 text-xs sm:text-sm">
              <Sparkles className="size-3 sm:size-3.5" /> Didukung AI Smart Match
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Barang hilang?{" "}
            <span className="relative inline-block bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
              Temuin
            </span>{" "}
            aja.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-4 sm:mt-5 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Platform Lost &amp; Found AI pertama untuk Indonesia. Laporkan, cocokkan dengan
            cerdas, dan terhubung langsung dengan penemu — semuanya aman di dalam Temuin.
          </motion.p>

          <motion.form
            action="/reports"
            method="get"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-6 sm:mt-7 flex max-w-md items-center gap-2 rounded-lg sm:rounded-xl border border-border bg-card p-1.5 shadow-soft transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring"
          >
            <Search className="ml-2 size-4 sm:size-5 shrink-0 text-muted-foreground" />
            <input
              name="q"
              placeholder="Cari dompet, kunci, hp…"
              className="h-9 sm:h-10 flex-1 bg-transparent px-1 text-sm outline-none"
            />
            <Button type="submit" size="sm" className="shrink-0 text-xs sm:text-sm">
              Cari
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-2 sm:gap-3"
          >
            <Button asChild size="lg" className="group text-sm sm:text-base">
              <Link href="/reports/new">
                Buat Laporan <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-sm sm:text-base">
              <Link href="/reports">Jelajahi Laporan</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-7 sm:mt-8 flex flex-wrap gap-3 sm:gap-5 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-3.5 sm:size-4 text-primary" /> Verifikasi Admin
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="size-3.5 sm:size-4 text-primary" /> Chat Aman
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> AI Match
            </span>
          </motion.div>
        </div>

        {/* Right: floating visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative"
        >
          <div className="relative mx-auto max-w-md">
            {/* Main report card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <Badge variant="destructive">Hilang</Badge>
                <span className="text-xs text-muted-foreground">2 jam lalu</span>
              </div>
              <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-muted">
                <div className="absolute inset-0 bg-dot opacity-40" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
                  <MapPin className="size-3.5 text-primary" /> Stasiun Kota, Jakarta
                </div>
              </div>
              <p className="mt-3 font-semibold">Dompet kulit hitam berisi KTP</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">B</span>
                  @budi_s
                </span>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  92% cocok
                </span>
              </div>
            </div>

            {/* Floating AI-match chip */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-3 -top-5 rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-soft backdrop-blur"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5 text-primary" /> AI menemukan kecocokan
              </span>
            </motion.div>

            {/* Floating found card */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:block"
            >
              <p className="text-[11px] text-muted-foreground">Ditemukan</p>
              <p className="text-sm font-semibold">Kunci motor ring satpam</p>
              <Badge variant="success" className="mt-1">
                Selesai
              </Badge>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
