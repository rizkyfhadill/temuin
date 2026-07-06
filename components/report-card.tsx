"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Eye, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { Report } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export function ReportCard({ report }: { report: Report }) {
  const href = `/reports/${report.id}`;
  return (
    <Link href={href} className="group block">
      <Card className="card-hover overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {report.image_url ? (
            <Image
              src={report.image_url}
              alt={report.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">Tanpa foto</div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant={report.type === "lost" ? "destructive" : "success"}>
              {report.type === "lost" ? "Hilang" : "Ditemukan"}
            </Badge>
          </div>
          {report.category_name && (
            <div className="absolute right-3 top-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                {report.category_name}
              </Badge>
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{report.title}</h3>
            {report.status === "returned" && <StatusBadge status="returned" />}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {report.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {report.location}
              </span>
            )}
            {report.lost_found_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" /> {formatDate(report.lost_found_date)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <Avatar src={report.author?.avatar_url} name={report.author?.username} size={24} />
              <span className="text-xs font-medium">@{report.author?.username}</span>
              {report.author?.verified && <BadgeCheck className="size-3.5 text-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo(report.created_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
