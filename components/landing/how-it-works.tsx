import { Search, Camera, Sparkles, CheckCircle2, MessagesSquare } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/anim/reveal";

const STEPS = [
  { icon: Search, title: "Cari Barang", desc: "Jelajahi laporan barang hilang & ditemukan di seluruh Indonesia tanpa login." },
  { icon: Camera, title: "Buat Laporan", desc: "Unggah foto, biarkan AI menganalisis kategori, warna, dan deskripsi secara otomatis." },
  { icon: Sparkles, title: "AI Smart Match", desc: "AI mencocokkan laporan serupa dan memberi skor kecocokan secara otomatis." },
  { icon: MessagesSquare, title: "Chat Aman", desc: "Hubungi pelapor langsung lewat chat internal. Kontak pribadi tetap rahasia." },
  { icon: CheckCircle2, title: "Barang Kembali", desc: "Serah terima di tempat aman, lalu tandai ‘Barang Sudah Kembali’." },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 border-b border-border py-12 sm:py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">Cara Kerja Temuin</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
            Alur yang jelas, sederhana, dan mudah dipahami pengguna baru.
          </p>
        </div>
        <RevealGroup className="mt-8 sm:mt-12 grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5 px-2 sm:px-0" stagger={0.07}>
          {STEPS.map((s, i) => (
            <RevealItem key={s.title}>
            <div className="group relative h-full rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-5 card-interactive">
                <span className="absolute right-3 sm:right-4 top-3 sm:top-4 text-2xl sm:text-3xl font-black text-border/70">{i + 1}</span>
                <div className="grid size-9 sm:size-11 place-items-center rounded-lg sm:rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                  <s.icon className="size-4 sm:size-5" />
                </div>
                <h3 className="mt-3 sm:mt-4 font-semibold text-sm sm:text-base">{s.title}</h3>
                <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
