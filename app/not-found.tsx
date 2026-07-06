import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-8" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold">404</h1>
        <p className="mt-2 text-muted-foreground">Halaman yang kamu cari tidak ditemukan.</p>
        <Button asChild className="mt-6">
          <Link href="/"><Home className="size-4" /> Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
