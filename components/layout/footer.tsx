import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Instagram, Mail, MapPin } from "lucide-react";

const COLS = [
  {
    title: "Produk",
    links: [
      { href: "/reports", label: "Cari Barang" },
      { href: "/reports/new", label: "Buat Laporan" },
      { href: "/leaderboard", label: "Papan Peringkat" },
      { href: "/#cara-kerja", label: "Cara Kerja" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { href: "/#statistik", label: "Statistik" },
      { href: "/#faq", label: "FAQ" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privasi" },
      { href: "/terms", label: "Syarat & Ketentuan" },
      { href: "/security", label: "Keamanan" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container grid gap-6 sm:gap-10 py-8 sm:py-12 grid-cols-2 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image src="/temuin-logo.png" alt="Temuin" width={40} height={40} className="size-8 sm:size-10" />
          </Link>
          <p className="mt-2 sm:mt-3 max-w-xs text-xs sm:text-sm text-muted-foreground">
            Platform AI Lost &amp; Found untuk Indonesia. Barang hilang? Temuin aja.
          </p>
          <div className="mt-3 sm:mt-4 flex gap-2">
            {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid size-8 sm:size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-3.5 sm:size-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs sm:text-sm font-semibold">{col.title}</h4>
            <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="link-underline text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-center sm:justify-between gap-2 sm:flex-row py-4 sm:py-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Temuin. Dibuat dengan ❤️ untuk Indonesia.</p>
          <p className="flex items-center gap-1">
            <MapPin className="size-3" /> Melayani seluruh Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
