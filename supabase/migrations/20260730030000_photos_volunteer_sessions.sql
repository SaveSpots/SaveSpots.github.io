-- Check-in photos + volunteer timer sessions.

-- Photo attached to a check-in (public URL in the checkin-photos bucket).
alter table public.restocks
  add column if not exists photo_url text;

-- ---------------------------------------------------------------------------
-- volunteer_sessions: start/stop timer per volunteer
-- ---------------------------------------------------------------------------
create table if not exists public.volunteer_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);

create index if not exists volunteer_sessions_user_idx
  on public.volunteer_sessions (user_id, started_at desc);

alter table public.volunteer_sessions enable row level security;

drop policy if exists "sessions self read" on public.volunteer_sessions;
create policy "sessions self read" on public.volunteer_sessions
  for select using (user_id = auth.uid());

drop policy if exists "sessions self insert" on public.volunteer_sessions;
create policy "sessions self insert" on public.volunteer_sessions
  for insert with check (user_id = auth.uid());

drop policy if exists "sessions self update" on public.volunteer_sessions;
create policy "sessions self update" on public.volunteer_sessions
  for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage bucket for check-in photos (public read, signed-in upload)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', true)
on conflict (id) do nothing;

drop policy if exists "checkin photos upload" on storage.objects;
create policy "checkin photos upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'checkin-photos');

drop policy if exists "checkin photos read" on storage.objects;
create policy "checkin photos read" on storage.objects
  for select using (bucket_id = 'checkin-photos');
