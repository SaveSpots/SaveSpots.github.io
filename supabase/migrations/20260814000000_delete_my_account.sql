-- Apple App Store guideline 5.1.1(v): apps that offer account creation must
-- offer in-app account deletion. Security definer so a volunteer can remove
-- their own auth.users row; the profiles cascade wipes personal data
-- (profile, waiver acceptances, volunteer sessions), while check-ins and
-- saveboxes keep their rows with the reporter anonymized — their FKs are
-- ON DELETE SET NULL, so community supply data survives.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
