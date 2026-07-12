-- SaveSpots portal schema.
-- Run in Supabase SQL editor (or `supabase db push`). Idempotent-ish: safe to
-- re-run early in development. RLS is ON everywhere — the anon/auth client can
-- only do what these policies allow.

-- Nearby-box search needs geographic distance.
create extension if not exists postgis;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (host / volunteer / admin)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'volunteer' check (role in ('host', 'volunteer', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- saveboxes: a hosted SaveBox at a location
-- status: pending = submitted for review, active = live, retired = removed
-- ---------------------------------------------------------------------------
create table if not exists public.saveboxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  -- generated geography point for fast distance queries
  geo geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored,
  hours text,                        -- free text, e.g. "Mon-Fri 9-5"
  status text not null default 'pending' check (status in ('pending', 'active', 'retired')),
  host_id uuid references public.profiles (id) on delete set null,
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists saveboxes_geo_idx on public.saveboxes using gist (geo);
create index if not exists saveboxes_status_idx on public.saveboxes (status);

-- ---------------------------------------------------------------------------
-- restocks: a report that a box was restocked / its current kit count
-- ---------------------------------------------------------------------------
create table if not exists public.restocks (
  id uuid primary key default gen_random_uuid(),
  savebox_id uuid not null references public.saveboxes (id) on delete cascade,
  kits_remaining int not null check (kits_remaining >= 0),
  needs_restock boolean not null default false,
  note text,
  reported_by uuid references public.profiles (id) on delete set null,
  reported_at timestamptz not null default now()
);

create index if not exists restocks_box_idx on public.restocks (savebox_id, reported_at desc);

-- ---------------------------------------------------------------------------
-- nearby_saveboxes: active boxes within radius_m of a point, nearest first
-- ---------------------------------------------------------------------------
create or replace function public.nearby_saveboxes(
  in_lat double precision,
  in_lng double precision,
  radius_m double precision default 8000
)
returns table (
  id uuid,
  name text,
  address text,
  city text,
  lat double precision,
  lng double precision,
  hours text,
  status text,
  distance_m double precision
)
language sql
stable
as $$
  select b.id, b.name, b.address, b.city, b.lat, b.lng, b.hours, b.status,
         st_distance(b.geo, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography) as distance_m
  from public.saveboxes b
  where b.status = 'active'
    and st_dwithin(b.geo, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography, radius_m)
  order by distance_m asc;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.saveboxes enable row level security;
alter table public.restocks enable row level security;

-- profiles: a user reads/updates only their own row.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- saveboxes: any signed-in user sees ACTIVE boxes (the public map). A user also
-- sees boxes they submitted (to track review status).
drop policy if exists "saveboxes read active or own" on public.saveboxes;
create policy "saveboxes read active or own" on public.saveboxes
  for select using (
    status = 'active' or submitted_by = auth.uid()
  );

-- Any signed-in user can submit a new box (lands as 'pending' for review).
drop policy if exists "saveboxes insert own" on public.saveboxes;
create policy "saveboxes insert own" on public.saveboxes
  for insert with check (submitted_by = auth.uid());

-- restocks: readable for any active box; insertable by any signed-in user.
drop policy if exists "restocks read" on public.restocks;
create policy "restocks read" on public.restocks
  for select using (
    exists (
      select 1 from public.saveboxes b
      where b.id = restocks.savebox_id
        and (b.status = 'active' or b.submitted_by = auth.uid())
    )
  );

drop policy if exists "restocks insert own" on public.restocks;
create policy "restocks insert own" on public.restocks
  for insert with check (reported_by = auth.uid());
