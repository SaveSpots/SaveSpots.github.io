-- SECURITY FIX: any signed-in user could make themselves an admin.
--
-- The "profiles self update" policy from 20260724000000_init_portal.sql is:
--
--   create policy "profiles self update" on public.profiles
--     for update using (auth.uid() = id);
--
-- It has no WITH CHECK clause. For UPDATE, Postgres falls back to the USING
-- expression as the check on the NEW row — and `auth.uid() = id` is still true
-- after the update, because the id never changes. So a volunteer could simply
-- PATCH their own profile with {"role":"admin"} and gain the admin dashboard,
-- plus every table guarded by public.is_admin().
--
-- Verified against production 2026-07-30: a plain signed-in account promoted
-- itself with one REST call.
--
-- Fix: role changes are rejected unless the caller is already an admin. A
-- trigger rather than a WITH CHECK clause, because the check needs the OLD row's
-- role, and a subquery back into public.profiles inside its own RLS policy
-- recurses. is_admin() is already security-definer, so it reads the caller's
-- role without tripping RLS.
--
-- No legitimate client path writes `role` — saveOnboarding() updates only phone
-- and emergency contact — so this raises instead of silently reverting. If it
-- ever fires in the app, that is a bug or an attack, and both should be loud.

create or replace function public.enforce_role_change_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'only an admin can change profiles.role'
      using errcode = '42501';   -- insufficient_privilege
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_change on public.profiles;
create trigger profiles_enforce_role_change
  before update on public.profiles
  for each row
  execute function public.enforce_role_change_is_admin();

-- Tighten the policy too, so intent is readable at the policy level rather than
-- only in a trigger someone might not notice.
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
