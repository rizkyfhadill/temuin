import type { Metadata } from "next";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Tag, Palette, BadgeCheck, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { ReportActions } from "@/components/reports/report-actions";
import { Discussion } from "@/components/reports/discussion";
import { AiMatchList } from "@/components/reports/ai-match-list";
import { LiveReportWatcher } from "@/components/reports/live-report-watcher";
import { ShareButton } from "@/components/reports/share-button";
import { JsonLd } from "@/components/seo/json-ld";
import { getReportById, getAiMatches, getComments } from "@/lib/data";
import { getSupabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) return { title: "Laporan tidak ditemukan" };
  return {
    title: `${report.title} — ${report.type === "lost" ? "Hilang" : "Ditemukan"}`,
    description: report.description.slice(0, 160),
  };
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isGuest = !user;
  const [matches, comments] = await Promise.all([getAiMatches(id), getComments(id)]);

  return (
    <div className="container py-4 sm:py-8">
      <LiveReportWatcher reportId={id} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: report.title,
          description: report.description,
          image: report.image_url ? [report.image_url] : undefined,
          category: report.category_name,
          color: report.color,
          brand: { "@type": "Brand", name: "Temuin" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "IDR", availability: "https://schema.org/InStock" },
        }}
      />
      <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3 sm:size-4" /> Kembali ke pencarian
      </Link>

      <div className="mt-4 sm:mt-5 grid gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/10] w-full bg-muted">
              {report.image_url ? (
                <Image
                  src={report.image_url}
                  alt={report.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground text-sm">Tanpa foto</div>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={report.type === "lost" ? "destructive" : "success"} className="text-xs sm:text-sm">
                  {report.type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
                </Badge>
                {report.status !== "published" && <StatusBadge status={report.status} />}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{report.title}</h1>
              <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">{report.description}</p>
            </div>
          </Card>

          <Discussion reportId={report.id} initialComments={comments} locked={report.comments_locked} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 sm:space-y-6">
          <Card className="space-y-4 p-3 sm:p-5">
            <ReportActions reportId={report.id} ownerId={report.owner_id} status={report.status} />
            <ShareButton title={report.title} url={`/reports/${report.id}`} />
            <div className="grid grid-cols-2 gap-2 sm:gap-3 border-t border-border pt-3 sm:pt-4 text-xs sm:text-sm">
              {report.location && (
                <Info icon={MapPin} label="Lokasi" value={report.location} />
              )}
              {report.lost_found_date && (
                <Info icon={Calendar} label="Tanggal" value={formatDate(report.lost_found_date)} />
              )}
              {report.category_name && <Info icon={Tag} label="Kategori" value={report.category_name} />}
              {report.color && <Info icon={Palette} label="Warna" value={report.color} />}
              <Info icon={Eye} label="Dilihat" value={String(report.view_count)} />
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-3 sm:p-5">
            <Avatar
              src={report.author?.avatar_url}
              name={report.author?.full_name || report.author?.username || "Pengguna"}
              size={40}
              className="flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1 font-semibold text-sm">
                {report.author?.full_name ? report.author.full_name : `@${report.author?.username ?? "pengguna"}`}
                {report.author?.verified && <BadgeCheck className="size-4 text-primary flex-shrink-0" />}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {report.author?.username ? `@${report.author.username}` : "Pengguna Temuin"}
              </p>
            </div>
          </Card>

          <AiMatchList matches={matches} />
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3 sm:size-3.5 flex-shrink-0" /> {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
