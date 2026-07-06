import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, MessageSquare, Eye } from "lucide-react";

export const metadata: Metadata = { title: "Keamanan", description: "Bagaimana Temuin menjaga keamananmu." };

const ITEMS = [
  { icon: ShieldCheck, h: "Role Based Access Control", p: "Setiap halaman dashboard dilindungi middleware. User tidak dapat mengakses dashboard admin." },
  { icon: Lock, h: "Validasi Server", p: "Seluruh operasi Create, Update, Delete, dan Verify dicek izin aksesnya di server, bukan hanya di sisi klien." },
  { icon: MessageSquare, h: "Chat Internal Aman", p: "Nomor WhatsApp, email, dan alamat tidak pernah ditampilkan. Komunikasi sepenuhnya di dalam platform." },
  { icon: Eye, h: "Privasi Terlindungi", p: "Informasi pribadi hanya dibagikan sukarela melalui percakapan jika kedua belah pihak menginginkannya." },
];

export default function SecurityPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Keamanan</h1>
      <p className="mt-2 text-muted-foreground">Keamanan dan privasi adalah prioritas utama Temuin.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ITEMS.map((it) => (
          <div key={it.h} className="rounded-xl border border-border bg-card p-5">
            <it.icon className="size-6 text-primary" />
            <h2 className="mt-3 font-semibold">{it.h}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{it.p}</p>
          </div>
        ))}
      </div>
      <p className="mt-10"><Link href="/" className="text-primary hover:underline">← Kembali ke beranda</Link></p>
    </div>
  );
}
