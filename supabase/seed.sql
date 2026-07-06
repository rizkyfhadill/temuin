-- ============================================================
-- Temuin — Seed Data (optional demo content)
-- NOTE: profiles are usually created automatically when a user
-- signs up (see handle_new_user trigger). The rows below are for
-- quick local demoing. Adjust IDs/emails to match your test users,
-- or simply sign up via /register to create real profiles.
-- ============================================================

-- Insert a demo admin + categories. Reports reference owner_id,
-- so create at least one profile first (via signup) and replace
-- the UUID below, OR run this after registering a user.

insert into public.categories (name, slug, icon, color) values
  ('Dompet', 'dompet', 'Wallet', '#DC2626'),
  ('Kunci', 'kunci', 'Key', '#2563EB'),
  ('Elektronik', 'elektronik', 'Smartphone', '#7C3AED'),
  ('Dokumen', 'dokumen', 'FileText', '#0891B2'),
  ('Kendaraan', 'kendaraan', 'Bike', '#16A34A'),
  ('Hewan Peliharaan', 'hewan', 'PawPrint', '#D97706'),
  ('Tas', 'tas', 'Briefcase', '#DB2777'),
  ('Perhiasan', 'perhiasan', 'Gem', '#CA8A04'),
  ('Pakaian', 'pakaian', 'Shirt', '#4F46E5'),
  ('Lainnya', 'lainnya', 'Package', '#64748B')
on conflict (slug) do nothing;

-- To seed sample reports, first create a profile (sign up in the app),
-- then run something like:
--
-- insert into public.reports (type, title, description, category_id, color, location, city, lost_found_date, status, owner_id)
-- select 'lost', 'Dompet kulit hitam', 'Dompet kulit hitam berisi KTP.', c.id, 'Hitam', 'Stasiun Kota', 'Jakarta', now() - interval '2 days', 'published', '<YOUR_USER_ID>'
-- from public.categories c where c.slug = 'dompet';

-- ============================================================
-- Badge definitions (gamification / leaderboard)
-- ============================================================
insert into public.badges (key, name, description, icon, color, tier, criteria) values
  ('first_report', 'Pelapor Perdana', 'Membuat laporan pertama kali.', 'Sparkles', '#DC2626', 'bronze', '1 laporan dibuat'),
  ('connector', 'Sang Penyambung', 'Rajin membantu temukan barang.', 'Link2', '#2563EB', 'silver', '5 laporan dibuat'),
  ('good_samaritan', 'Good Samaritan', 'Mengembalikan barang temuan ke pemiliknya.', 'HeartHandshake', '#16A34A', 'gold', '1 barang temuan dikembalikan'),
  ('hero', 'Pahlawan Temuin', 'Banyak mempertemukan pemilik dengan barangnya.', 'ShieldCheck', '#CA8A04', 'gold', '3 barang berhasil dikembalikan'),
  ('chatty', 'Ngobrol Asik', 'Aktif di kolom diskusi.', 'MessagesSquare', '#7C3AED', 'silver', '10 komentar'),
  ('verified', 'Terverifikasi', 'Identitas sudah diverifikasi admin.', 'BadgeCheck', '#0891B2', 'bronze', 'Profil terverifikasi')
on conflict (key) do nothing;
