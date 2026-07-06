import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privasi", description: "Kebijakan privasi Temuin." };

const SECTIONS = [
  { h: "Data yang Kami Kumpulkan", p: "Kami hanya mengumpulkan data yang kamu berikan (nama, email, laporan barang) dan data teknis minimal untuk meningkatkan layanan." },
  { h: "Kontak Pribadi Tetap Rahasia", p: "Temuin tidak pernah menampilkan nomor WhatsApp, email, atau alamat rumah di halaman publik. Seluruh komunikasi dilakukan melalui fitur chat internal." },
  { h: "Berbagi Data", p: "Kami tidak menjual data pengguna kepada pihak ketiga. Data hanya digunakan untuk menjalankan platform dan keamanan." },
  { h: "Hak Kamu", p: "Kamu dapat meminta penghapusan akun dan data kapan saja melalui pengaturan atau menghubungi admin." },
];

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Kebijakan Privasi</h1>
      <p className="mt-2 text-muted-foreground">Terakhir diperbarui: 2026. Komunikasi aman, data terlindungi.</p>
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
