-- Waiver v2: record the optional photo/media release choice with the signature.
alter table public.waiver_acceptances
  add column if not exists media_consent boolean;
