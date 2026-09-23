-- Let admins read QR scan analytics from the portal.
--
-- The table stays closed to everyone else: the redirect route writes with the
-- service role, and there is still no insert/update/delete policy, so a
-- browser key cannot forge scans to inflate the numbers.
--
-- Read-only, and admin-only rather than volunteer-wide. Scan data is not
-- sensitive on its own, but the portal's blast radius should not grow by
-- default — a volunteer has no reason to query it.

create policy "qr_scans admin read" on public.qr_scans
  for select using (public.is_admin());
