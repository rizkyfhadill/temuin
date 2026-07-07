# Fix: Apply RLS Policy Update untuk Profiles

## Masalah

Komentar menampilkan "User [UUID]" bukan nama real user karena RLS policy memblok akses ke profile user lain.

## Solusi: Update RLS Policy

Jalankan SQL berikut di **Supabase Dashboard → SQL Editor**:

```sql
-- Drop existing restrictive policies
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;

-- Create new policies: allow public read of profiles
create policy "profiles_select" on public.profiles
  for select using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());
```

## Penjelasan

- **profiles_select**: `using (true)` = siapa saja bisa baca profile (username, full_name, avatar, bio, dll adalah data publik)
- **profiles_insert**: Hanya bisa insert profile own ID (saat signup)
- **profiles_update**: Hanya bisa update profile sendiri atau admin bisa update semua

## Setelah Execute

Komentar akan menampilkan nama real user: "Rizky Fadillah" atau "admin", bukan UUID.

## Verifikasi

Buka `/reports/[id]` dan cek diskusi - harusnya semua username/full_name sudah tampil.
