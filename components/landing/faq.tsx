"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/anim/reveal";

const FAQS = [
  { q: "Apakah saya harus login untuk melihat laporan?", a: "Tidak. Semua orang dapat melihat laporan, statistik, dan mencari barang tanpa login. Login hanya diperlukan untuk membuat laporan, bookmark, komentar, atau menghubungi pelapor." },
  { q: "Bagaimana AI Smart Match bekerja?", a: "Setelah laporan disetujui admin, AI secara otomatis mencari laporan yang mirip (kategori, warna, lokasi, waktu) dan memberi skor kecocokan beserta alasannya." },
  { q: "Apakah nomor WhatsApp saya ditampilkan?", a: "Tidak. Untuk melindungi privasi, kami tidak menampilkan nomor WA, email, atau alamat di halaman publik. Seluruh komunikasi dilakukan lewat chat internal Temuin." },
  { q: "Bagaimana jika laporan saya ditolak?", a: "Admin akan memberikan alasan penolakan. Kamu dapat memperbaiki laporan dan mengirimkannya kembali untuk diverifikasi." },
  { q: "Apakah aman melakukan serah terima?", a: "AI Safety Assistant akan mengingatkan untuk melakukan serah terima di tempat umum yang aman dan tidak membagikan alamat pribadi." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="group overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card transition-colors duration-200 hover:border-primary/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-3 sm:p-5 text-left font-medium transition-colors duration-200 hover:text-primary text-sm sm:text-base"
        aria-expanded={open}
      >
        {q}
        <ChevronDown className={cn("size-4 sm:size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-primary", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid overflow-hidden px-3 sm:px-5 text-xs sm:text-sm text-muted-foreground transition-all duration-200",
          open ? "grid-rows-[1fr] pb-3 sm:pb-5" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">{a}</div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-border py-12 sm:py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">Pertanyaan Umum</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">Hal yang sering ditanyakan pengguna.</p>
        </div>
        <RevealGroup className="mt-8 sm:mt-10 space-y-2 sm:space-y-3 px-2 sm:px-0" stagger={0.06}>
          {FAQS.map((f) => (
            <RevealItem key={f.q}>
              <FaqItem {...f} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
