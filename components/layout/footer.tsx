import Link from "next/link";
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
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg leading-none">T</span>
            </span>
            <span className="text-lg">Temuin</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Platform AI Lost &amp; Found untuk Indonesia. Barang hilang? Temuin aja.
          </p>
          <div className="mt-4 flex gap-2">
            {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Temuin. Dibuat dengan ❤️ untuk Indonesia.</p>
          <p className="flex items-center gap-1">
            <MapPin className="size-3" /> Melayani seluruh Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
