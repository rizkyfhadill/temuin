import type { Report, Category, Profile, Badge, LeaderboardEntry } from "./types";

// ============================================================
// Demo / fallback data. Used when Supabase env vars are absent
// so the whole UI is explorable out-of-the-box. Once you connect
// Supabase (run supabase/schema.sql + seed.sql) real data replaces this.
// ============================================================

export const SEED_CATEGORIES: Category[] = [
  { id: "c1", name: "Dompet", slug: "dompet", icon: "Wallet", color: "#DC2626", created_at: "" },
  { id: "c2", name: "Kunci", slug: "kunci", icon: "Key", color: "#2563EB", created_at: "" },
  { id: "c3", name: "Elektronik", slug: "elektronik", icon: "Smartphone", color: "#7C3AED", created_at: "" },
  { id: "c4", name: "Dokumen", slug: "dokumen", icon: "FileText", color: "#0891B2", created_at: "" },
  { id: "c5", name: "Kendaraan", slug: "kendaraan", icon: "Bike", color: "#16A34A", created_at: "" },
  { id: "c6", name: "Hewan Peliharaan", slug: "hewan", icon: "PawPrint", color: "#D97706", created_at: "" },
  { id: "c7", name: "Tas", slug: "tas", icon: "Briefcase", color: "#DB2777", created_at: "" },
  { id: "c8", name: "Perhiasan", slug: "perhiasan", icon: "Gem", color: "#CA8A04", created_at: "" },
  { id: "c9", name: "Pakaian", slug: "pakaian", icon: "Shirt", color: "#4F46E5", created_at: "" },
  { id: "c10", name: "Lainnya", slug: "lainnya", icon: "Package", color: "#64748B", created_at: "" },
];

const profiles: Record<string, Profile> = {
  u1: { id: "u1", username: "budi_s", full_name: "Budi Santoso", avatar_url: null, role: "user", city: "Jakarta", bio: null, verified: true, suspended: false, points: 320, created_at: "", updated_at: "" },
  u2: { id: "u2", username: "sari_w", full_name: "Sari Wijaya", avatar_url: null, role: "user", city: "Bandung", bio: null, verified: true, suspended: false, points: 540, created_at: "", updated_at: "" },
  u3: { id: "u3", username: "alex_p", full_name: "Alex Pratama", avatar_url: null, role: "user", city: "Surabaya", bio: null, verified: false, suspended: false, points: 95, created_at: "", updated_at: "" },
  u4: { id: "u4", username: "dewi_l", full_name: "Dewi Lestari", avatar_url: null, role: "user", city: "Yogyakarta", bio: null, verified: true, suspended: false, points: 210, created_at: "", updated_at: "" },
};

export const SEED_PROFILES = profiles;

function daysAgo(n: number) {
  return new Date(Date.now() - n * 864e5).toISOString();
}

export const SEED_REPORTS: Report[] = [
  {
    id: "r1", type: "lost", title: "Dompet kulit hitam berisi KTP", description: "Dompet kulit hitam merek Nature Republic, di dalamnya KTP atas nama Budi Santoso, kartu ATM BCA, dan uang tunai Rp200rb. Hilang saat naik KRL jurusan Bogor.",
    category_id: "c1", category_name: "Dompet", color: "Hitam", image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80", location: "Stasiun Kota, Jakarta", province: "DKI Jakarta", city: "Jakarta", lost_found_date: daysAgo(2), status: "published", owner_id: "u1", author: profiles.u1, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 1240, match_count: 2, created_at: daysAgo(2),
  },
  {
    id: "r2", type: "found", title: "Kunci motor ring satpam", description: "Ditemukan sepasang kunci motor dengan gantungan ring satpam warna kuning di lobby gedung. Silakan hubungi via chat untuk konfirmasi ciri.",
    category_id: "c2", category_name: "Kunci", color: "Kuning", image_url: "https://images.unsplash.com/photo-1587876931567-0642fc1981d4?w=600&q=80", location: "Lobby Graha Pena, Bandung", province: "Jawa Barat", city: "Bandung", lost_found_date: daysAgo(1), status: "published", owner_id: "u2", author: profiles.u2, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 530, match_count: 0, created_at: daysAgo(1),
  },
  {
    id: "r3", type: "lost", title: "iPhone 13 warna midnight", description: "iPhone 13 warna midnight, layar agak retak di pojok kanan, casing bening. Hilang di area kampus.", category_id: "c3", category_name: "Elektronik", color: "Biru", image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", location: "Universitas Indonesia, Depok", province: "DKI Jakarta", city: "Jakarta", lost_found_date: daysAgo(4), status: "published", owner_id: "u3", author: profiles.u3, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 980, match_count: 1, created_at: daysAgo(4),
  },
  {
    id: "r4", type: "found", title: "Kartu mahasiswa & ijazah SMA", description: "Ditemukan berkas berisi kartu mahasiswa dan ijazah SMA dalam map warna biru di taman kota.", category_id: "c4", category_name: "Dokumen", color: "Biru", image_url: "https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=600&q=80", location: "Taman Kota, Yogyakarta", province: "DI Yogyakarta", city: "Yogyakarta", lost_found_date: daysAgo(3), status: "published", owner_id: "u4", author: profiles.u4, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 412, match_count: 0, created_at: daysAgo(3),
  },
  {
    id: "r5", type: "lost", title: "Kucing persia cream hilang", description: "Kucing persia warna cream, jantan, memakai kalung merah. Hilang dari rumah sekitar sore hari.", category_id: "c6", category_name: "Hewan Peliharaan", color: "Putih", image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80", location: "Komplek BSD, Tangerang", province: "DKI Jakarta", city: "Jakarta", lost_found_date: daysAgo(5), status: "published", owner_id: "u1", author: profiles.u1, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 2100, match_count: 3, created_at: daysAgo(5),
  },
  {
    id: "r6", type: "found", title: "Jam tangan kasual hitam", description: "Jam tangan warna hitam tali kulit, ditemukan di dalam angkot rute 02.", category_id: "c8", category_name: "Perhiasan", color: "Hitam", image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", location: "Halte Dago, Bandung", province: "Jawa Barat", city: "Bandung", lost_found_date: daysAgo(2), status: "published", owner_id: "u2", author: profiles.u2, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 320, match_count: 0, created_at: daysAgo(2),
  },
  {
    id: "r7", type: "lost", title: "Tas ransel merah polytechnic", description: "Tas ransel merah dengan banyak sticker, isi buku dan laptop. Hilang di atas kereta.", category_id: "c7", category_name: "Tas", color: "Merah", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", location: "Stasiun Gambir, Jakarta", province: "DKI Jakarta", city: "Jakarta", lost_found_date: daysAgo(6), status: "published", owner_id: "u3", author: profiles.u3, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 760, match_count: 1, created_at: daysAgo(6),
  },
  {
    id: "r8", type: "found", title: "Sandal jepit biru", description: "Sepasang sandal jepit warna biru ditemukan di pantai.", category_id: "c9", category_name: "Pakaian", color: "Biru", image_url: null, location: "Pantai Parangtritis", province: "DI Yogyakarta", city: "Yogyakarta", lost_found_date: daysAgo(1), status: "published", owner_id: "u4", author: profiles.u4, rejection_reason: null, is_spam: false, comments_locked: false, view_count: 90, match_count: 0, created_at: daysAgo(1),
  },
];

export const SEED_STATS = {
  totalUsers: 12840,
  totalReports: 9340,
  lost: 5210,
  found: 4130,
  returned: 2870,
  today: 142,
  pending: 38,
};

// ---- Gamification: Badges ----
export const SEED_BADGES: Badge[] = [
  { id: "b1", key: "first_report", name: "Pelapor Perdana", description: "Membuat laporan pertama kali.", icon: "Sparkles", color: "#DC2626", tier: "bronze", criteria: "1 laporan dibuat" },
  { id: "b2", key: "connector", name: "Sang Penyambung", description: "Rajin membantu temukan barang.", icon: "Link2", color: "#2563EB", tier: "silver", criteria: "5 laporan dibuat" },
  { id: "b3", key: "good_samaritan", name: "Good Samaritan", description: "Mengembalikan barang temuan ke pemiliknya.", icon: "HeartHandshake", color: "#16A34A", tier: "gold", criteria: "1 barang temuan dikembalikan" },
  { id: "b4", key: "hero", name: "Pahlawan Temuin", description: "Banyak mempertemukan pemilik dengan barangnya.", icon: "ShieldCheck", color: "#CA8A04", tier: "gold", criteria: "3 barang berhasil dikembalikan" },
  { id: "b5", key: "chatty", name: "Ngobrol Asik", description: "Aktif di kolom diskusi.", icon: "MessagesSquare", color: "#7C3AED", tier: "silver", criteria: "10 komentar" },
  { id: "b6", key: "verified", name: "Terverifikasi", description: "Identitas sudah diverifikasi admin.", icon: "BadgeCheck", color: "#0891B2", tier: "bronze", criteria: "Profil terverifikasi" },
];

const badgeByKey = (k: string) => SEED_BADGES.find((b) => b.key === k)!;

// Demo leaderboard derived from seed profiles.
export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { id: "u2", username: "sari_w", full_name: "Sari Wijaya", avatar_url: null, verified: true, points: 540, reports_count: 12, returned_count: 3, badges: [badgeByKey("first_report"), badgeByKey("connector"), badgeByKey("good_samaritan"), badgeByKey("hero")] },
  { id: "u1", username: "budi_s", full_name: "Budi Santoso", avatar_url: null, verified: true, points: 320, reports_count: 7, returned_count: 2, badges: [badgeByKey("first_report"), badgeByKey("connector"), badgeByKey("good_samaritan")] },
  { id: "u4", username: "dewi_l", full_name: "Dewi Lestari", avatar_url: null, verified: true, points: 210, reports_count: 5, returned_count: 1, badges: [badgeByKey("first_report"), badgeByKey("good_samaritan"), badgeByKey("verified")] },
  { id: "u3", username: "alex_p", full_name: "Alex Pratama", avatar_url: null, verified: false, points: 95, reports_count: 3, returned_count: 0, badges: [badgeByKey("first_report")] },
];