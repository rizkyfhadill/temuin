# Deploy Temuin (Vercel + Supabase)

Panduan lengkap men-deploy **Temuin** ke produksi. Alur: siapkan Supabase → isi environment variables → deploy ke Vercel → verifikasi.

---

## 1. Prasyarat (akun)

- [Vercel](https://vercel.com) (gratis untuk personal project).
- [Supabase](https://supabase.com) (gratis tier cukup).
- (Opsional) Google Cloud Console — untuk login dengan Google.
- (Opsional) [Gemini API key](https://aistudio.google.com/apikey) — untuk AI sungguhan (tanpa key, app tetap jalan pakai heuristic).

---

## 2. Supabase

### a. Buat project
Buat project baru di Supabase. Catat **Project URL** dan **anon public key** (Settings → API).

### b. Jalankan schema & seed
Buka **SQL Editor → New query**, lalu jalankan **dua** file secara berurutan:

1. `supabase/schema.sql` — tabel, RLS, trigger (termasuk `handle_new_user` yang menyimpan `username`), kolom `points`, tabel `badges`/`user_badges`, dan realtime.
2. `supabase/seed.sql` — kategori + definisi badge.

> Jika project sudah pernah di-setup sebelumnya, **jalankan ulang `schema.sql`** — trigger `handle_new_user` dan tabel gamifikasi diperbarui di versi terbaru.

### c. Enable Auth providers
Authentication → Providers:
- **Email**: aktifkan. Untuk kemudahan lokal, bisa matikan *Confirm email*; jika aktif, pastikan *Use secure email links (PKCE)* aktif (link konfirmasi otomatis mengarah ke `/auth/callback`).
- **Google** (opsional): isi OAuth client ID/secret, lalu set callback ke `<SITE>/auth/callback`.

Authentication → URL Configuration:
- Site URL: `https://<domain-produksi-kamu>` (atau domain Vercel default).
- Redirect URLs: tambahkan `https://<domain-produksi-kamu>/auth/callback` dan varian `localhost` untuk dev.

### d. Buat admin (opsional tapi disarankan)
Setelah env `SUPABASE_SERVICE_ROLE_KEY` terisi di Vercel, jalankan lokal:
```bash
npm run create-admin            # admin@temuin.id + password acak
# atau: npm run create-admin kamu@email.com
```
Atau lewat dashboard: buat user di Authentication, lalu
```sql
update public.profiles set role = 'admin', verified = true where username = '<user>';
```

---

## 3. Environment Variables

Isi di **Vercel → Project → Settings → Environment Variables** (pilih Environment: Production/Preview/Development sesuai kebutuhan).

| Variable | Wajib | Contoh / Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service role key (buat `npm run create-admin` & route admin) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://temuin.vercel.app` — dipakai sitemap, metadata, canonical |
| `GEMINI_API_KEY` | ⛳ | key dari Google AI Studio (AI Vision + chat sungguhan) |
| `GEMINI_MODEL` | ⛳ | `gemini-2.0-flash` (default) |

> Tanpa `GEMINI_API_KEY`, AI tetap berjalan pakai heuristic deterministik (tidak error).

---

## 4. Deploy ke Vercel

### Cara A — Import dari Git (disarankan)
1. Push project ini ke GitHub/GitLab/Bitbucket.
2. Di Vercel: **Add New → Project → Import repository**.
3. Framework terdeteksi otomatis sebagai **Next.js** (build: `next build`, output: `next start`). Tidak perlu `vercel.json`.
4. Masukkan environment variables (langkah 3) di menu Deployments/Settings.
5. **Deploy**. Setelah selesai, kembali ke Environment Variables dan pastikan `NEXT_PUBLIC_SITE_URL` = URL produksi Vercel (atau domain custom).

### Cara B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel env add NEXT_PUBLIC_SUPABASE_URL   # ikuti prompt
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add GEMINI_API_KEY
vercel --prod
```

Pastikan `Node.js` di Vercel ≥ 18.18 (default Vercel sudah 20+). Tidak perlu setting `engines`.

---

## 5. Verifikasi setelah deploy

1. **Buka situs** → landing page render, animasi jalan, tidak ada error di console.
2. **Registrasi**: buat akun → `username` muncul di navbar, dashboard, dan profile, dan **bertahan saat refresh** (bug registrasi sudah diperbaiki: client upsert + trigger `handle_new_user` yang di-harden).
3. **Buat laporan** → upload foto → AI mengisi kategori/warna/deskripsi (pakai Gemini kalau `GEMINI_API_KEY` diisi).
4. **PWA / Offline**: buka di HTTPS, gunakan “Install app” / “Add to Home Screen” (manifest + service worker aktif hanya di production). Matikan internet → halaman fallback `offline.html` muncul.
5. **Admin**: `/admin` bisa diakses dengan akun role `admin`.
6. **SEO**: `https://<domain>/robots.txt` dan `/sitemap.xml` tersedia.

---

## 6. Catatan produksi

- **RLS aktif** untuk semua tabel; jangan hapus policy. Semua tulis dibatasi lewat `auth.uid()` atau RPC `SECURITY DEFINER`.
- **Service role key hanya di server** (`SUPABASE_SERVICE_ROLE_KEY`) — tidak pernah dikirim ke browser.
- **Service worker** hanya ter-register di `NODE_ENV=production`, jadi tidak mengganggu `npm run dev`.
- **Gambar remote** (`images.unsplash.com`, `*.supabase.co`, `api.dicebear.com`) sudah di-whitelist di `next.config.mjs`. Kalau menambah host gambar, tambahkan ke `images.remotePatterns`.
- **Realtime** (chat, notifikasi, live tracking) butuh Supabase terhubung; di mode demo (tanpa env) fitur ini degrade ke seed data.
- Setelah mengubah `supabase/schema.sql`, **jalankan ulang** di SQL Editor (idempoten berkat `if not exists` / `on conflict`).
