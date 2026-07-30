-- Onboarding (phone, emergency contact, waiver) + admin role capabilities.

-- ---------------------------------------------------------------------------
-- Profile onboarding fields
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists phone text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists waiver_signed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Waiver acceptances: immutable audit trail for e-sign records.
-- Keep one row per acceptance: version, typed signature, timestamp, UA.
-- ---------------------------------------------------------------------------
create table if not exists public.waiver_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  waiver_version text not null,
  signature_name text not null,
  accepted_at timestamptz not null default now(),
  user_agent text
);

alter table public.waiver_acceptances enable row level security;

drop policy if exists "waiver self read" on public.waiver_acceptances;
create policy "waiver self read" on public.waiver_acceptances
  for select using (user_id = auth.uid());

drop policy if exists "waiver self insert" on public.waiver_acceptances;
create policy "waiver self insert" on public.waiver_acceptances
  for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- is_admin(): security-definer so policies can check the caller's role
-- without recursing into profiles RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Admin policies
-- ---------------------------------------------------------------------------
drop policy if exists "saveboxes admin read" on public.saveboxes;
create policy "saveboxes admin read" on public.saveboxes
  for select using (public.is_admin());

drop policy if exists "saveboxes admin update" on public.saveboxes;
create policy "saveboxes admin update" on public.saveboxes
  for update using (public.is_admin());

drop policy if exists "restocks admin read" on public.restocks;
create policy "restocks admin read" on public.restocks
  for select using (public.is_admin());

drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles
  for select using (public.is_admin());

drop policy if exists "sessions admin read" on public.volunteer_sessions;
create policy "sessions admin read" on public.volunteer_sessions
  for select using (public.is_admin());
