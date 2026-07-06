import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Medal, Star, FileText, RotateCcw, ArrowLeft } from "lucide-react";
import { getLeaderboard, getBadges } from "@/lib/data";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeShelf, BadgeGallery } from "@/components/badges/badge-shelf";
import type { BadgeTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Papan Peringkat",
  description:
    "Papan peringkat pengguna Temuin — koleksi poin, laporan, dan badge dari komunitas Lost & Found Indonesia.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Papan Peringkat · Temuin",
    description: "Pengguna paling aktif membantu menemukan barang hilang di Indonesia.",
  },
};

const TIER_LABEL: Record<BadgeTier, string> = {
  bronze: "Perunggu",
  silver: "Perak",
  gold: "Emas",
};

export default async function LeaderboardPage() {
  const [board, allBadges] = await Promise.all([getLeaderboard(50), getBadges()]);
  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="container max-w-4xl py-10">
      <header className="mb-8 text-center">
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Trophy className="size-6" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Papan Peringkat</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Apresiasi untuk warga yang paling aktif membantu menemukan barang hilang. Kumpulkan poin
          lewat laporan, diskusi, dan pengembalian barang.
        </p>
      </header>

      {/* Podium */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {podium.map((e, i) => {
          const medal = [<Trophy key="1" className="size-5 text-yellow-500" />, <Medal key="2" className="size-5 text-slate-400" />, <Medal key="3" className="size-5 text-amber-700" />][i];
          return (
            <Card key={e.id} className={i === 0 ? "sm:order-2 sm:scale-[1.03] border-primary/40" : i === 1 ? "sm:order-1" : "sm:order-3"}>
              <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  #{i + 1} {medal}
                </div>
                <Avatar src={e.avatar_url} name={e.full_name ?? e.username} size={56} />
                <p className="font-semibold">@{e.username}</p>
                <p className="text-lg font-bold text-primary">{e.points} poin</p>
                <BadgeShelf badges={e.badges} empty="" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full list */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="size-4 text-primary" /> Peringkat Lengkap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {board.map((e, i) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-7 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                <Avatar src={e.avatar_url} name={e.full_name ?? e.username} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate font-medium">
                    @{e.username}
                    {e.verified && <span className="text-primary" title="Terverifikasi">✓</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><FileText className="size-3" />{e.reports_count} laporan</span>
                    <span className="inline-flex items-center gap-1"><RotateCcw className="size-3" />{e.returned_count} kembali</span>
                  </div>
                </div>
                <div className="hidden sm:block"><BadgeShelf badges={e.badges} empty="" /></div>
                <span className="shrink-0 font-bold text-primary">{e.points}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Badge explorer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Koleksi Badge</CardTitle>
          <p className="text-sm text-muted-foreground">
            Raih badge dengan berbagai aksi. Berikut seluruh badge yang bisa didapat.
          </p>
        </CardHeader>
        <CardContent>
          <BadgeGallery all={allBadges} />
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {(["gold", "silver", "bronze"] as BadgeTier[]).map((t) => (
              <span key={t} className="rounded-full border border-border bg-muted/40 px-2 py-0.5">
                {TIER_LABEL[t]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Cari atau buat laporan
        </Link>
      </div>
    </div>
  );
}
