import type { Role } from "./types";

// ============================================================
// Role Based Access Control helpers
// All authorization is re-checked server-side; these are UI/route guards.
// ============================================================

export const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  user: 1,
  admin: 2,
};

export function hasRole(role: Role | undefined, required: Role): boolean {
  if (!role) return required === "guest";
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

export function isAdmin(role: Role | undefined): boolean {
  return role === "admin";
}

export function canManageReport(
  userRole: Role | undefined,
  ownerId: string,
  currentUserId: string | undefined
): boolean {
  if (userRole === "admin") return true;
  return !!currentUserId && ownerId === currentUserId;
}

// Capability matrix for documentation / UI gating.
export const CAPABILITIES = {
  guest: ["view_landing", "search", "view_report", "view_stats"],
  user: [
    "login",
    "create_report",
    "edit_own_report",
    "delete_own_report",
    "bookmark",
    "comment",
    "view_ai_match",
    "edit_profile",
    "receive_notification",
    "chat",
  ],
  admin: [
    "all_user",
    "approve_report",
    "reject_report",
    "edit_any_report",
    "delete_any_report",
    "mark_spam",
    "lock_comments",
    "manage_users",
    "change_role",
    "view_analytics",
  ],
} as const;
