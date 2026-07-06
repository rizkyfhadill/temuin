# Temuin — Platform AI Lost & Found Indonesia

> **Barang hilang? Temuin aja.**

Temuin is a modern, mobile-first **AI Lost & Found** platform for Indonesia built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Auth · DB · Realtime · Storage), and **next-themes** (Light/Dark). It implements the full flow from the blueprint: landing page → search → detail → login → dashboard → AI-assisted report creation → admin verification → AI Smart Match → internal chat → serah terima → returned.

---

## ✨ Features

- **Public landing page** — Hero, Cara Kerja, Statistik, Laporan Terbaru, Kategori, FAQ, Footer. No login required to browse.
- **Auth (Supabase)** — Email/Password + Google OAuth. Profiles auto-created on signup.
- **Role Based Access Control** — `guest` / `user` / `admin` enforced in middleware **and** Postgres RLS.
- **User Dashboard** — Beranda, Laporan Saya, Pesan, Bookmark, Notifikasi, Profil, Pengaturan.
- **Report creation** — multi-step, photo upload, **mock AI** auto-fills category/color/description, then status `pending` (Menunggu Verifikasi).
- **Admin Dashboard** — Analytics (stats + SVG charts), Verifikasi, Laporan, Pengguna, Kategori, Komentar, Spam, Pengaturan.
- **AI Smart Match** — deterministic scoring of similar published reports (no API key needed).
- **Realtime Chat** — bubbles, read receipts, typing indicator, reply, edit/delete own, image upload, emoji, search.
- **Discussion / comments** — forum-style per report with `@mentions`.
- **Notifications** — realtime, with unread badges.
- **Privacy-first** — no WhatsApp/email/address shown publicly; all comms via internal chat.
- **Gamification** — reputation **points** + unlockable **badges** (Pelapor Perdana, Sang Penyambung, Good Samaritan, Pahlawan Temuin, Ngobrol Asik, Terverifikasi) with a public **Papan Peringkat / leaderboard** at `/leaderboard`. Points & badges are computed server-side by a Supabase trigger (`recalc_reputation`).
- **PWA / Offline** — installable web app with a service worker (`public/sw.js`): app-shell precache, network-first navigations with an offline fallback page, cache-first static assets. Manifest lives in `app/manifest.ts`.
- **Theming** — full Light/Dark/System with design tokens; respects `prefers-reduced-motion`.
- **Performance** — lazy-friendly App Router, `next/image`, code-split routes, no heavy UI libs.

> **AI** uses **Gemini** (`lib/ai.ts`) for real image analysis (Vision) and the chat safety assistant. Set `GEMINI_API_KEY` in `.env.local` (get one at aistudio.google.com/apikey). Without a key, it gracefully falls back to a deterministic heuristic so the flow still works with zero configuration. Smart Match scoring is deterministic (category/color/location/date) by design.

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
#   → fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Set up the database
#   Open your Supabase project → SQL Editor → run supabase/schema.sql, then supabase/seed.sql
#   (If you ran schema.sql before, re-run it — it now adds the `points` column,
#    `badges`/`user_badges` tables, and the reputation triggers.)

# 4. Enable Auth providers
#   Supabase → Authentication → Providers → enable Email and Google.
#   Add redirect URL: <your-site>/auth/callback  (e.g. http://localhost:3000/auth/callback)

# 5. Run
npm run dev        # http://localhost:3000
```

The site degrades gracefully: without Supabase env vars it still renders using built-in **seed/demo data** (`lib/seed-data.ts`), so you can explore the UI immediately.

---

## 🌐 Deployment (Vercel + Supabase)

Panduan lengkap ada di **[DEPLOY.md](./DEPLOY.md)** — mulai dari setup Supabase (schema, seed, auth providers), environment variables, hingga verifikasi produksi (registrasi, PWA/offline, admin). Ringkasnya:

1. Jalankan `supabase/schema.sql` lalu `supabase/seed.sql` di SQL Editor Supabase.
2. Isi env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (+ opsional `GEMINI_API_KEY`).
3. Import repo ke Vercel (terdeteksi sebagai Next.js otomatis) → Deploy.
4. `npm run create-admin` untuk akun admin.

---

## 👑 Create an Admin account

Once env vars are set, create a working admin login with the bundled script
(uses your `SUPABASE_SERVICE_ROLE_KEY`, so it can create users and flip their role):

```bash
npm run create-admin
# → creates admin@temuin.id with a random strong password, prints it,
#   promotes the profile to role = 'admin'.
# Custom:  npm run create-admin you@email.com  (random password)
#          npm run create-admin you@email.com StrongPass123!
```

Then log in at `/login` → you'll have access to `/admin`. Re-running the script
is idempotent (it promotes an existing user instead of duplicating).

> Prefer the dashboard? Create any user via Supabase → Authentication → Users,
> then run:
> ```sql
> update public.profiles set role = 'admin', verified = true
> where username = '<that username>';
> ```

---

## 🔐 Auth configuration (Supabase)

- **Providers**: enable *Email* and *Google* (Auth → Providers). For Google, add
  the OAuth client ID/secret and set the callback to
  `<SITE>/auth/callback`.
- **Site URL / Redirects**: set Site URL to `http://localhost:3000` and add
  `http://localhost:3000/auth/callback` to *Redirect URLs*.
- **Email confirmation**: for the smoothest local dev, you can turn OFF
  *Confirm email* (Auth → Providers → Email). If you keep it ON, either enable
  *Use secure email links (PKCE)* (the confirm link hits `/auth/callback` and
  logs the user in) **or** just click the link in the email — Supabase verifies
  it and lands you logged-in on the Site URL. Password reset (`/forgot`) follows
  the same `/auth/callback` flow.
- The `auth/users` trigger (`handle_new_user`) auto-creates a `profiles` row from
  the signup metadata (username/full_name/city).

All permission checks are re-validated server-side via Postgres **RLS**
(`supabase/schema.sql`) on top of the `middleware.ts` route guards.

---

## 🗂️ Project structure

```
app/
  (auth)/login, register        # auth pages
  auth/callback/route.ts        # OAuth / email confirmation handler
  reports/                      # public browse + [id] detail + new (create)
  dashboard/                    # user dashboard (all menus)
  admin/                        # admin dashboard (all menus)
  api/ai/{analyze,chat}/route   # mock AI endpoints
  api/chat/rooms/route          # create chat room
  api/admin/users/route         # privileged user mgmt (service role)
components/
  ui/        layout/  landing/  reports/  chat/  admin/
lib/          supabase (browser/server/admin), ai, data, rbac, types, utils
middleware.ts # route protection + role redirect
supabase/     schema.sql · seed.sql
```

---

## 🔐 Security notes

- All `/dashboard` and `/admin` routes are gated by `middleware.ts`.
- Every Create/Update/Delete/Verify is re-checked server-side via Postgres **RLS** (see `supabase/schema.sql`).
- Notifications are inserted only through a `SECURITY DEFINER` RPC so admin flows can notify report owners without exposing insert to clients.
- Privileged user deletion/role changes go through a server route using the **service role** key (never shipped to the browser).

---

## 🏆 Gamification — Points, Badges & Leaderboard

Temuin rewards helpful community members:

- **Points** (`profiles.points`) are recomputed automatically by the `recalc_reputation()`
  SECURITY DEFINER function whenever a report's status changes, a comment is posted, or a
  profile is verified:
  `points = published×5 + comments×2 + found_returned×50 + lost_returned×25`.
- **Badges** are awarded by the same function based on thresholds (see `supabase/seed.sql`
  for the full list). Earned badges are stored in `user_badges` and shown on the user's
  profile (`/dashboard/profile`) and on the public **Papan Peringkat** page (`/leaderboard`).
- The leaderboard (`app/leaderboard/page.tsx`) is a public, server-rendered page that works
  out-of-the-box with seed data and switches to live Supabase data once configured.

Both the leaderboard and profile badge UI gracefully fall back to `lib/seed-data.ts` when
Supabase isn't configured.

---

## 📲 PWA / Offline support

Temuin is installable and works offline:

- `public/sw.js` — service worker that precaches the app shell, serves navigations
  network-first (falling back to `public/offline.html`), and caches static assets
  cache-first. Supabase/API requests are never cached.
- `components/providers/pwa-register.tsx` — registers the worker **only in production**
  (`NODE_ENV === 'production'`) so it never interferes with `next dev` hot-reload.
- `app/manifest.ts` — web app manifest with icons (`public/pwa-icon.svg`, maskable +
  any), theme color, and `standalone` display.
- `public/offline.html` — branded offline fallback page.

To test: `npm run build && npm run start`, open the site over `http://localhost:3000`
(or any HTTPS deploy), and use your browser's "Install app" / "Add to Home Screen".

---

## 🎯 Performance & a11y targets

- Core Web Vitals optimized (LCP/CLS/INP), `next/image` for all imagery, route-level code splitting, minimal dependencies.
- Aims for Lighthouse 95–100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO.
- Fully responsive (mobile → ultrawide) and `prefers-reduced-motion` aware.
