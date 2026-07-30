-- Check-in flow v2: when the box is present and a restock is necessary, the
-- volunteer logs how many savekits they gave.

alter table public.restocks
  add column if not exists kits_given int check (kits_given >= 0);
