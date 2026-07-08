import type { MetadataRoute } from "next";
import { getPublishedReports } from "@/lib/data";

function parseDateOrFallback(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = ["", "/reports", "/leaderboard", "/login", "/register", "/privacy", "/terms", "/security"].map(
    (p) => ({ url: `${base}${p}`, lastModified: new Date() })
  );

  let dynamic: MetadataRoute.Sitemap = [];
  try {
    const reports = await getPublishedReports({ limit: 1000 });
    dynamic = reports.map((r) => ({
      url: `${base}/reports/${r.id}`,
      lastModified: parseDateOrFallback(r.updated_at ?? r.created_at, new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // No backend configured — static routes only.
  }

  return [...staticRoutes, ...dynamic];
}
