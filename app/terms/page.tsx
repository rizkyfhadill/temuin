import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Syarat & Ketentuan", description: "Syarat dan ketentuan Temuin." };

const SECTIONS = [
  { h: "Penggunaan", p: "Temuin adalah platform Lost & Found untuk membantu mempertemukan barang dengan pemiliknya. Kamu bertanggung jawab atas kebenaran laporan." },
  { h: "Larangan", p: "Dilarang melaporkan barang ilegal, menyebarkan spam, atau menyalahgunakan fitur chat untuk penipuan." },
  { h: "Verifikasi", p: "Laporan baru melewati proses moderasi admin sebelum dipublikasikan demi kualitas dan keamanan." },
  { h: "Serah Terima", p: "Lakukan serah terima di tempat umum yang aman. Temuin tidak bertanggung jawab atas kerugian dari transaksi antar pengguna." },
];

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Syarat & Ketentuan</h1>
      <div className="mt-10 space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="mt-1 text-muted-foreground">{s.p}</p>
          </div>
        ))}
      </div>
      <p className="mt-10"><Link href="/" className="text-primary hover:underline">← Kembali ke beranda</Link></p>
    </div>
  );
}
