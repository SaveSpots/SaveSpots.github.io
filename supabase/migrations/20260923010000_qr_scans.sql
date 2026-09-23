-- QR scan tracking for printed donation codes.
--
-- Each printed design encodes https://savespots.org/qr/<code>, which records a
-- row here and redirects to /donate. Storing the code rather than one shared
-- URL is what makes it possible to tell a flyer from a table tent from a
-- sticker on a SaveBox.

create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),

  -- Which printed design was scanned. Free text, not an enum: new codes get
  -- printed faster than migrations get written, and an unknown code should
  -- still record rather than 500.
  code text not null,
  scanned_at timestamptz not null default now(),

  -- Coarse client signals. Deliberately NOT the IP address: a scan is an
  -- anonymous act by someone who has not donated or consented to anything,
  -- and a raw IP would make this table personal data for no analytical gain.
  user_agent text,
  referer text,
  -- Netlify geo headers, city-level at most.
  country text
);

create index if not exists qr_scans_code_scanned_at_idx
  on public.qr_scans (code, scanned_at desc);

create index if not exists qr_scans_scanned_at_idx
  on public.qr_scans (scanned_at desc);

-- ---------------------------------------------------------------------------
-- RLS on, no policies: writes come from the redirect route using the service
-- role, reads come from the admin view using the same. Nothing reaches this
-- from a browser key.
-- ---------------------------------------------------------------------------
alter table public.qr_scans enable row level security;

-- ---------------------------------------------------------------------------
-- Daily rollup, so the admin view does not pull every row to count them.
-- security_invoker stays OFF (the default) so the view runs as its owner and
-- can read through RLS; it exposes only aggregates, never a single scan.
-- ---------------------------------------------------------------------------
create or replace view public.qr_scan_daily as
select
  code,
  date_trunc('day', scanned_at) as day,
  count(*) as scans
from public.qr_scans
group by code, date_trunc('day', scanned_at);
