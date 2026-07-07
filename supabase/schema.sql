-- ============================================================
-- Temuin - Supabase Schema
-- Run this in your Supabase SQL Editor (Project → SQL → New query).
-- Then run supabase/seed.sql for demo data.
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('guest','user','admin')),
  city text,
  bio text,
  verified boolean default false,
  suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- ---------- reports ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost','found')),
  title text not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  color text,
  image_url text,
  location text,
  city text,
  lost_found_date date,
  status text not null default 'pending'
    check (status in ('draft','pending','approved','published','rejected','returned')),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  rejection_reason text,
  is_spam boolean default false,
  comments_locked boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_owner_idx on public.reports(owner_id);
create index if not exists reports_created_idx on public.reports(created_at desc);

-- ---------- bookmarks ----------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, report_id)
);

-- ---------- comments ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  mentions text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists comments_report_idx on public.comments(report_id);

-- ---------- chat_rooms ----------
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists chat_rooms_participants_idx on public.chat_rooms(user_a, user_b);

-- ---------- messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  image_url text,
  reply_to uuid references public.messages(id) on delete set null,
  edited boolean default false,
  deleted boolean default false,
  read_by text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists messages_room_idx on public.messages(room_id, created_at);

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read);

-- ---------- ai_matches (optional persistence) ----------
create table if not exists public.ai_matches (
  id uuid primary key default gen_random_uuid(),
  source_report_id uuid references public.reports(id) on delete cascade,
  matched_report_id uuid references public.reports(id) on delete cascade,
  score numeric not null,
  reason text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.reports enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_matches enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
-- Allow anyone to read public profile fields (username, full_name, avatar_url, bio, verified, role, city)
-- Users can only modify their own profile; admins can modify any profile
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- categories (everyone reads; only admin writes)
create policy "categories_select" on public.categories for select using (true);
create policy "categories_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- reports
create policy "reports_select" on public.reports for select
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());
create policy "reports_insert" on public.reports for insert with check (owner_id = auth.uid());
create policy "reports_update" on public.reports for update
  using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "reports_delete" on public.reports for delete using (owner_id = auth.uid() or public.is_admin());

-- bookmarks
create policy "bookmarks_all" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- comments
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (user_id = auth.uid());
create policy "comments_update" on public.comments for update using (user_id = auth.uid() or public.is_admin());
create policy "comments_delete" on public.comments for delete using (user_id = auth.uid() or public.is_admin());

-- chat_rooms
create policy "rooms_select" on public.chat_rooms for select
  using (user_a = auth.uid() or user_b = auth.uid() or public.is_admin());
create policy "rooms_insert" on public.chat_rooms for insert
  with check (user_a = auth.uid() or user_b = auth.uid());
create policy "rooms_update" on public.chat_rooms for update
  using (user_a = auth.uid() or user_b = auth.uid() or public.is_admin());

-- messages
create policy "messages_select" on public.messages for select
  using (exists (select 1 from public.chat_rooms r where r.id = room_id and (r.user_a = auth.uid() or r.user_b = auth.uid())) or public.is_admin());
create policy "messages_insert" on public.messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from public.chat_rooms r where r.id = room_id and (r.user_a = auth.uid() or r.user_b = auth.uid())));
create policy "messages_update" on public.messages for update
  using (sender_id = auth.uid() or exists (select 1 from public.chat_rooms r where r.id = room_id and (r.user_a = auth.uid() or r.user_b = auth.uid())) or public.is_admin());

-- notifications
create policy "notifications_select" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_update" on public.notifications for update using (user_id = auth.uid());
-- Inserts happen via SECURITY DEFINER rpc (see create_notification).

-- ai_matches
create policy "aim_select" on public.ai_matches for select using (true);

-- ============================================================
-- Triggers & functions
-- ============================================================

-- Auto-create a profile when a new auth user signs up.
-- Robust: guarantees a non-null, unique username and never fails the signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1));
  uname text := base;
  n int := 1;
begin
  -- Ensure username uniqueness without ever aborting the signup.
  while exists (select 1 from public.profiles where username = uname) loop
    n := n + 1;
    uname := base || n::text;
  end loop;

  insert into public.profiles (id, username, full_name, city, role, points)
  values (new.id, uname, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'city', 'user', 0)
  on conflict (id) do update set
    username = coalesce(public.profiles.username, excluded.username),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    city = coalesce(public.profiles.city, excluded.city);
  return new;
exception when others then
  -- Never block account creation if profile enrichment fails.
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep chat_rooms.last_message in sync.
create or replace function public.set_room_last_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.chat_rooms
  set last_message = coalesce(new.body, '📷 Gambar'),
      last_message_at = now(),
      updated_at = now()
  where id = new.room_id;
  return new;
end;
$$;

drop trigger if exists on_message_inserted on public.messages;
create trigger on_message_inserted
  after insert on public.messages
  for each row execute function public.set_room_last_message();

-- Secure notification creation (bypasses RLS so admin flows can notify owners).
create or replace function public.create_notification(
  p_user_id uuid, p_type text, p_title text, p_body text, p_href text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, title, body, href)
  values (p_user_id, p_type, p_title, p_body, p_href);
end;
$$;

-- ============================================================
-- Storage buckets & policies
-- ============================================================
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true), ('chat-images', 'chat-images', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "report_images_read" on storage.objects for select using (bucket_id = 'report-images');
create policy "report_images_write" on storage.objects for insert with check (bucket_id = 'report-images' and auth.role() = 'authenticated');
create policy "report_images_delete" on storage.objects for delete using (bucket_id = 'report-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "chat_images_read" on storage.objects for select using (bucket_id = 'chat-images');
create policy "chat_images_write" on storage.objects for insert with check (bucket_id = 'chat-images' and auth.role() = 'authenticated');

-- Avatars: public read; authenticated users upload to their own folder (user_id/...).
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Enable Realtime for live chat, typing (via broadcast), notifications,
-- report status changes (live tracking), and chat rooms.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.chat_rooms;
alter publication supabase_realtime add table public.reports;

-- ============================================================
-- Gamification: reputation points, badges & leaderboard
-- ============================================================

-- Points column on profiles (reputation score for the leaderboard).
alter table public.profiles add column if not exists points integer not null default 0;

-- Badge definitions (seeded via supabase/seed.sql).
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  icon text,
  color text,
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold')),
  criteria text,
  created_at timestamptz default now()
);

-- Which badges a user has earned.
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  unique (user_id, badge_id)
);
create index if not exists user_badges_user_idx on public.user_badges(user_id);

-- Recompute a user's points + award/keep badges based on their activity.
create or replace function public.recalc_reputation(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_published int := 0;
  v_returned int := 0;
  v_comments int := 0;
  v_found_returned int := 0;
  v_lost_returned int := 0;
  v_verified boolean := false;
  b_rec record;
begin
  select count(*) into v_published from public.reports where owner_id = p_user_id and status = 'published';
  select count(*) into v_returned from public.reports where owner_id = p_user_id and status = 'returned';
  select count(*) into v_comments from public.comments where user_id = p_user_id;
  select count(*) into v_found_returned from public.reports where owner_id = p_user_id and status = 'returned' and type = 'found';
  select count(*) into v_lost_returned from public.reports where owner_id = p_user_id and status = 'returned' and type = 'lost';
  select verified into v_verified from public.profiles where id = p_user_id;

  update public.profiles
    set points = (v_published * 5) + (v_comments * 2) + (v_found_returned * 50) + (v_lost_returned * 25)
    where id = p_user_id;

  for b_rec in select id, key from public.badges loop
    if (b_rec.key = 'first_report'   and v_published >= 1)
    or (b_rec.key = 'connector'      and v_published >= 5)
    or (b_rec.key = 'good_samaritan' and v_returned >= 1)
    or (b_rec.key = 'hero'           and v_returned >= 3)
    or (b_rec.key = 'chatty'         and v_comments >= 10)
    or (b_rec.key = 'verified'       and v_verified)
    then
      insert into public.user_badges (user_id, badge_id) values (p_user_id, b_rec.id)
      on conflict (user_id, badge_id) do nothing;
    end if;
  end loop;
end;
$$;

create or replace function public.recalc_reputation_reports()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    perform public.recalc_reputation(new.owner_id);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.recalc_reputation(new.owner_id);
  end if;
  return null;
end;
$$;

drop trigger if exists on_report_reputation on public.reports;
create trigger on_report_reputation
  after insert or update on public.reports
  for each row execute function public.recalc_reputation_reports();

create or replace function public.recalc_reputation_comments()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recalc_reputation(new.user_id);
  return null;
end;
$$;

drop trigger if exists on_comment_reputation on public.comments;
create trigger on_comment_reputation
  after insert on public.comments
  for each row execute function public.recalc_reputation_comments();

create or replace function public.recalc_reputation_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.verified is distinct from new.verified then
    perform public.recalc_reputation(new.id);
  end if;
  return null;
end;
$$;

drop trigger if exists on_profile_reputation on public.profiles;
create trigger on_profile_reputation
  after update on public.profiles
  for each row execute function public.recalc_reputation_profile();

-- RLS for badges & user_badges.
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "badges_select" on public.badges for select using (true);
create policy "user_badges_select" on public.user_badges for select using (user_id = auth.uid() or public.is_admin());
create policy "user_badges_admin" on public.user_badges for all using (public.is_admin()) with check (public.is_admin());

-- Surface badge earn/loss live in the app.
alter publication supabase_realtime add table public.user_badges;
