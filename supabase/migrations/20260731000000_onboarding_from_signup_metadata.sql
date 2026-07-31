-- Persist onboarding details that arrive with the sign-up itself.
--
-- Previously the apps called signUp() and then PATCHed the profile with phone
-- and emergency contact. That only works when signUp returns a session. Once
-- email confirmation was enabled it stopped returning one, so the follow-up
-- write was skipped (mobile) or rejected by RLS (web) — and every volunteer who
-- signed up after that lost their phone and emergency contact silently.
--
-- The apps now pass those fields in signUp's metadata, which survives without a
-- session. This trigger copies them into the profile at creation time, so the
-- data lands in one atomic step with no second authenticated request.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, phone, emergency_contact_name, emergency_contact_phone
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'emergency_contact_name', ''),
    nullif(new.raw_user_meta_data ->> 'emergency_contact_phone', '')
  );
  return new;
end;
$$;
