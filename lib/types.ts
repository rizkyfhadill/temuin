// ============================================================
// Temuin - Domain Types
// These mirror the Postgres tables defined in supabase/schema.sql
// ============================================================

export type Role = "guest" | "user" | "admin";

export type ReportType = "lost" | "found";

export type ReportStatus =
  | "draft"
  | "pending" // Menunggu Verifikasi
  | "approved" // Disetujui (ready to publish)
  | "published" // Dipublikasikan (live to public)
  | "rejected" // Ditolak
  | "returned"; // Berhasil Dikembalikan

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  city: string | null;
  bio: string | null;
  verified: boolean;
  suspended: boolean;
  points?: number; // reputation points for the leaderboard
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null; // lucide icon name
  color: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  category_id: string | null;
  category_name?: string; // joined
  color: string | null;
  image_url: string | null;
  location: string | null;
  reward: string | null;
  province: string | null;
  city: string | null;
  reported_at: string | null;
  lost_found_date: string | null;
  status: ReportStatus;
  owner_id: string; // author
  author?: Profile; // joined
  rejection_reason: string | null;
  is_spam: boolean;
  comments_locked: boolean;
  view_count: number;
  match_count?: number; // joined count of ai matches
  created_at: string;
  updated_at?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  report_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  mentions: string[] | null; // usernames
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ChatRoom {
  id: string;
  report_id: string | null;
  user_a: string; // participant ids
  user_b: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  image_url: string | null;
  reply_to: string | null;
  edited: boolean;
  deleted: boolean;
  read_by: string[] | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export type NotificationType =
  | "report_approved"
  | "report_rejected"
  | "ai_match"
  | "new_comment"
  | "reply_comment"
  | "new_message"
  | "mention"
  | "item_found"
  | "interest";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

export interface AiMatch {
  id: string;
  source_report_id: string;
  matched_report_id: string;
  score: number; // 0..1
  reason: string;
  created_at: string;
  matched_report?: Report;
}

// ---- Gamification: Badges & Leaderboard ----
export type BadgeTier = "bronze" | "silver" | "gold";

export interface Badge {
  id: string;
  key: string; // stable machine key
  name: string;
  description: string;
  icon: string; // lucide icon name (see BADGE_ICONS map)
  color: string; // hex accent
  tier: BadgeTier;
  criteria: string; // human readable unlock condition
}

export interface UserBadge {
  badge: Badge;
  awarded_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean;
  points: number;
  reports_count: number;
  returned_count: number;
  badges: Badge[];
}

// ---- Display / UI helpers ----
export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "Draft",
  pending: "Menunggu Verifikasi",
  approved: "Disetujui",
  published: "Dipublikasikan",
  rejected: "Ditolak",
  returned: "Berhasil Dikembalikan",
};

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  lost: "Barang Hilang",
  found: "Barang Ditemukan",
};
