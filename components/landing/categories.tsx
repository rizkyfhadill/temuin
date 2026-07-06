import Link from "next/link";
import * as Icons from "lucide-react";
import type { Category } from "@/lib/types";
import { RevealGroup, RevealItem } from "@/components/anim/reveal";

export function Categories({ categories }: { categories: Category[] }) {
  return (
    <section id="kategori" className="scroll-mt-20 border-b border-border py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Kategori</h2>
          <p className="mt-3 text-muted-foreground">Jelajahi berdasarkan jenis barang.</p>
        </div>
        <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" stagger={0.05}>
          {categories.map((c) => {
            const Icon = (Icons as any)[c.icon || "Package"] || Icons.Package;
            return (
              <RevealItem key={c.id}>
                <Link
                  href={`/reports?category=${encodeURIComponent(c.name)}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center card-interactive"
                >
                  <span
                    className="grid size-12 place-items-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                    style={{ backgroundColor: c.color || "#DC2626" }}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="text-sm font-medium">{c.name}</span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
