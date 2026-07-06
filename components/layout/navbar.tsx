"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, X, Plus, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/reports", label: "Cari Barang" },
  { href: "/leaderboard", label: "Papan Peringkat" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#kategori", label: "Kategori" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const { role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/reports?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg leading-none">T</span>
          </span>
          <span className="text-lg tracking-tight">Temuin</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "link-underline rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  pathname === n.href && "text-foreground"
                )}
              >
                {n.label}
              </Link>
            ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submitSearch} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari barang hilang…"
              className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>

          <ThemeToggle />

          {!loading && role !== "guest" && (
            <Link href="/dashboard/notifications" aria-label="Notifikasi" className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent">
              <Bell className="size-[18px]" />
            </Link>
          )}

          {!loading && role !== "guest" ? (
            <UserNav />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={role !== "guest" ? "/reports/new" : "/login"}>
              <Plus className="size-4" /> Lapor
            </Link>
          </Button>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <form onSubmit={submitSearch} className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari barang hilang…"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </form>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={role !== "guest" ? "/reports/new" : "/login"}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" /> Buat Laporan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
