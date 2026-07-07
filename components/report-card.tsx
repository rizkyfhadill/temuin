"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { Report } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export function ReportCard({ report }: { report: Report }) {
  const href = `/reports/${report.id}`;
  return (
    <Link href={href} className="group block h-full">
      <Card className="card-hover flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
        {/* Image Container - Fixed Aspect Ratio */}
        <div className="relative h-40 w-full flex-shrink-0 overflow-hidden bg-muted">
          {report.image_url ? (
            <Image
              src={report.image_url}
              alt={report.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Tanpa Foto
            </div>
          )}
          
          {/* Badge Overlay */}
          <div className="absolute inset-0 flex items-start justify-between p-3">
            <Badge 
              variant={report.type === "lost" ? "destructive" : "success"}
              className="text-xs font-semibold"
            >
              {report.type === "lost" ? "Hilang" : "Ditemukan"}
            </Badge>
            {report.category_name && (
              <Badge 
                variant="secondary" 
                className="bg-background/85 text-xs font-medium backdrop-blur"
              >
                {report.category_name}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Container - Flexible Growth */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2 min-h-[2.5rem]">
            <h3 className="line-clamp-2 font-semibold leading-snug text-base flex-1">
              {report.title}
            </h3>
            {report.status === "returned" && (
              <div className="flex-shrink-0">
                <StatusBadge status="returned" />
              </div>
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
            {report.description}
          </p>

          {/* Location & Date */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            {report.location && (
              <div className="inline-flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 flex-shrink-0" />
                <span className="truncate">{report.location}</span>
              </div>
            )}
            {report.lost_found_date && (
              <div className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 flex-shrink-0" />
                <span>{formatDate(report.lost_found_date)}</span>
              </div>
            )}
          </div>

          {/* Footer - Author & Time */}
          <div className="mt-auto border-t border-border pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar 
                  src={report.author?.avatar_url} 
                  name={report.author?.username} 
                  size={28}
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="truncate text-xs font-medium">@{report.author?.username}</span>
                    {report.author?.verified && (
                      <BadgeCheck className="size-3.5 flex-shrink-0 text-primary" />
                    )}
                  </div>
                </div>
              </div>
              <span className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo(report.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
