-- Every check-in must have a photo, and the nearby list must expose each box's
-- most recent check-in so volunteers can sort by "not checked in a while".

-- Remove the one legacy test check-in that predates the photo requirement, so
-- the NOT NULL below applies cleanly with no historical exceptions.
delete from public.restocks where photo_url is null;

-- Enforce the rule at the database, not just the UI.
alter table public.restocks
  alter column photo_url set not null;

-- Rebuild nearby_saveboxes to also return the latest check-in per box.
drop function if exists public.nearby_saveboxes(double precision, double precision, double precision);

create function public.nearby_saveboxes(
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
  distance_m double precision,
  last_checked_at timestamptz,
  last_box_gone boolean,
  last_replaced boolean,
  last_needs_restock boolean,
  last_kits_given int,
  last_note text,
  last_photo_url text
)
language sql
stable
as $$
  select b.id, b.name, b.address, b.city, b.lat, b.lng, b.hours, b.status,
         st_distance(b.geo, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography) as distance_m,
         r.reported_at as last_checked_at,
         r.box_gone as last_box_gone,
         r.replaced as last_replaced,
         r.needs_restock as last_needs_restock,
         r.kits_given as last_kits_given,
         r.note as last_note,
         r.photo_url as last_photo_url
  from public.saveboxes b
  left join lateral (
    select reported_at, box_gone, replaced, needs_restock, kits_given, note, photo_url
    from public.restocks
    where savebox_id = b.id
    order by reported_at desc
    limit 1
  ) r on true
  where b.status = 'active'
    and st_dwithin(b.geo, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography, radius_m)
  order by distance_m asc;
$$;
