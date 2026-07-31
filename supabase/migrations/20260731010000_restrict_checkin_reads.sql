-- Require a login to read check-in reports.
--
-- The original policy checked only that the box was active, with no condition on
-- the caller, so anyone holding the anon key — which ships inside the published
-- app bundle and the web JS, i.e. anyone at all — could read every check-in:
-- free-text notes, photo URLs, and the reporter's user id.
--
-- Verified against production before this change: an unauthenticated request to
-- /rest/v1/restocks returned rows.
--
-- Nothing public needs this. The marketing site's map uses hardcoded locations,
-- and both the app and the portal are behind auth. SaveBox locations themselves
-- stay publicly readable on purpose — helping people find naloxone is the point.

drop policy if exists "restocks read" on public.restocks;
create policy "restocks read" on public.restocks
  for select
  to authenticated
  using (
    exists (
      select 1 from public.saveboxes b
      where b.id = restocks.savebox_id
        and (b.status = 'active' or b.submitted_by = auth.uid())
    )
  );
