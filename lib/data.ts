import { getSupabaseServer } from "./supabase/server";
import { scoreMatch } from "./ai";
import {
  SEED_REPORTS,
  SEED_CATEGORIES,
  SEED_STATS,
  SEED_PROFILES,
  SEED_BADGES,
  SEED_LEADERBOARD,
} from "./seed-data";
import type { Report, Category, Profile, Badge, LeaderboardEntry } from "./types";

export const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---------- Categories ----------
export async function getCategories(): Promise<Category[]> {
  if (!SUPABASE_LIVE) return SEED_CATEGORIES;
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase.from("categories").select("*").order("name");
    return (data as Category[]) ?? SEED_CATEGORIES;
  } catch {
    return SEED_CATEGORIES;
  }
}

// ---------- Published reports (public) ----------
export interface ReportQuery {
  q?: string;
  category?: string;
  type?: "lost" | "found";
  city?: string;
  limit?: number;
  page?: number;
}

export async function getPublishedReports(opts: ReportQuery = {}): Promise<Report[]> {
  const { q, category, type, city, limit = 12, page = 0 } = opts;

  if (!SUPABASE_LIVE) {
    let r = [...SEED_REPORTS];
    if (type) r = r.filter((x) => x.type === type);
    if (category) r = r.filter((x) => x.category_name === category);
    if (city) r = r.filter((x) => x.city === city);
    if (q)
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(q.toLowerCase()) ||
          x.description.toLowerCase().includes(q.toLowerCase())
      );
    return r.slice(page * limit, page * limit + limit);
  }

  try {
    const supabase = await getSupabaseServer();
    let query = supabase
      .from("reports")
      .select("*, author:profiles(*), categories(name)")
      .eq("status", "published");

    if (type) query = query.eq("type", type);
    if (category) query = query.eq("categories.name", category);
    if (city) query = query.eq("city", city);
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

    const { data } = await query
      .order("created_at", { ascending: false })
      .range(page * limit, page * limit + limit - 1);

    return (data ?? []).map(mapReportRow);
  } catch {
    return SEED_REPORTS;
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  if (!SUPABASE_LIVE) return SEED_REPORTS.find((r) => r.id === id) ?? null;
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("reports")
      .select("*, author:profiles(*), categories(name)")
      .eq("id", id)
      .single();
    return data ? mapReportRow(data) : null;
  } catch {
    return SEED_REPORTS.find((r) => r.id === id) ?? null;
  }
}

// ---------- AI Smart Match (computed locally from published reports) ----------
export async function getAiMatches(reportId: string) {
  const report = await getReportById(reportId);
  if (!report || report.status !== "published") return [];
  const others = (await getPublishedReports({ limit: 200 })).filter((r) => r.id !== reportId);
  const matches = others
    .map((c) => {
      const { score, reason } = scoreMatch(report, c);
      return { id: `m_${reportId}_${c.id}`, source_report_id: reportId, matched_report_id: c.id, score, reason, created_at: c.created_at, matched_report: c };
    })
    .filter((m) => m.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  return matches;
}

// ---------- Comments / discussion ----------
export interface CommentRow {
  id: string;
  report_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  mentions: string[] | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export async function getComments(reportId: string): Promise<CommentRow[]> {
  if (!SUPABASE_LIVE) return [];
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("comments")
      .select(
        "*, author:profiles(username, full_name, avatar_url, role, city, bio, verified, suspended, created_at, updated_at)"
      )
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
    return (data ?? []).map((r: any) => ({
      ...r,
      author: r.author
        ? { id: r.user_id, username: r.author.username, full_name: r.author.full_name, avatar_url: r.author.avatar_url, role: r.author.role, city: r.author.city, bio: r.author.bio, verified: r.author.verified, suspended: r.author.suspended, created_at: r.author.created_at, updated_at: r.author.updated_at }
        : undefined,
    }));
  } catch {
    return [];
  }
}

export async function getStats() {
  if (!SUPABASE_LIVE) return SEED_STATS;
  try {
    const supabase = await getSupabaseServer();
    const [{ count: total }, { count: lost }, { count: found }, { count: returned }, { count: pending }] =
      await Promise.all([
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("type", "lost"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("type", "found"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "returned"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
    const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const since = new Date(Date.now() - 864e5).toISOString();
    const { count: today } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since);
    return {
      totalUsers: users ?? 0,
      totalReports: total ?? 0,
      lost: lost ?? 0,
      found: found ?? 0,
      returned: returned ?? 0,
      today: today ?? 0,
      pending: pending ?? 0,
    };
  } catch {
    return SEED_STATS;
  }
}

// ---------- Gamification: Badges & Leaderboard ----------
export async function getBadges(): Promise<Badge[]> {
  if (!SUPABASE_LIVE) return SEED_BADGES;
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("badges")
      .select("*")
      .order("tier", { ascending: false });
    return (data as Badge[]) ?? SEED_BADGES;
  } catch {
    return SEED_BADGES;
  }
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (!SUPABASE_LIVE) return SEED_LEADERBOARD.find((e) => e.id === userId)?.badges ?? [];
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("user_badges")
      .select("badges(*)")
      .eq("user_id", userId);
    return ((data ?? []) as any[])
      .map((r) => r.badges)
      .filter(Boolean) as Badge[];
  } catch {
    return [];
  }
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!SUPABASE_LIVE) return SEED_LEADERBOARD.slice(0, limit);
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, avatar_url, verified, points, role, suspended, user_badges(badges(*))"
      )
      .eq("suspended", false)
      .order("points", { ascending: false })
      .limit(limit);
    const rows = (data ?? []) as any[];
    const ids = rows.map((r) => r.id);
    let rc: any[] = [];
    if (ids.length) {
      const { data: counts } = await supabase
        .from("reports")
        .select("owner_id, status")
        .in("owner_id", ids);
      rc = counts ?? [];
    }
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      verified: r.verified,
      points: r.points ?? 0,
      reports_count: rc.filter((x) => x.owner_id === r.id).length,
      returned_count: rc.filter((x) => x.owner_id === r.id && x.status === "returned").length,
      badges: (r.user_badges ?? [])
        .map((ub: any) => ub?.badges)
        .filter(Boolean) as Badge[],
    }));
  } catch {
    return SEED_LEADERBOARD.slice(0, limit);
  }
}

// Map a Supabase joined row → our Report type.
function mapReportRow(row: any): Report {
  return {
    ...row,
    category_name: row.categories?.name ?? null,
    author: row.author
      ? ({
          id: row.author.id,
          username: row.author.username,
          full_name: row.author.full_name,
          avatar_url: row.author.avatar_url,
          role: row.author.role,
          city: row.author.city,
          bio: row.author.bio,
          verified: row.author.verified,
          suspended: row.author.suspended,
          created_at: row.author.created_at,
          updated_at: row.author.updated_at,
        } as Profile)
      : undefined,
  } as Report;
}
