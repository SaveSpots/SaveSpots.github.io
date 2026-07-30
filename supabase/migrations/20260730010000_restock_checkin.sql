-- Check-in flow: a report now answers "is the box gone?" and, if gone,
-- "did you replace it?" — plus the existing "needs restock soon" flag.
-- Kit count becomes optional (the new mobile flow doesn't ask for it).

alter table public.restocks
  add column if not exists box_gone boolean not null default false,
  add column if not exists replaced boolean,
  alter column kits_remaining drop not null;
