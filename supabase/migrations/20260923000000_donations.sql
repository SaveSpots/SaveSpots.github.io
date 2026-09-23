-- Donation records written by the Square webhook.
--
-- WHY THIS TABLE EXISTS: before it, the only record of a gift lived in
-- Square's dashboard. That is enough to see money arrive and nothing else —
-- no donor list, no annual totals for the Form 990, and no way to send the
-- year-end acknowledgment letters a 501(c)(3) is expected to provide.

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),

  -- Square's payment id. Unique because webhooks are at-least-once: Square
  -- retries on any non-2xx, so the same payment.updated event can arrive
  -- several times and must not create several rows.
  square_payment_id text not null unique,
  square_order_id text,

  -- Smallest currency unit, matching Square. Never store dollars as float.
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD',

  -- Square's own status string (COMPLETED, APPROVED, FAILED, CANCELED...).
  -- Kept raw rather than mapped to a boolean so a refund or a late failure
  -- can be reconciled without guessing what we collapsed it into.
  status text not null,

  donor_email text,
  donor_first_name text,
  donor_last_name text,

  -- True when the payment came from a subscription plan variation.
  is_recurring boolean not null default false,

  -- When our acknowledgment email actually went out. Null means it has not
  -- been sent, which makes a retry sweep trivial to write later.
  receipt_sent_at timestamptz,
  receipt_error text,

  -- The event's own timestamp from Square, not ours; a retry hours later
  -- must not move the gift's date, which appears on the tax acknowledgment.
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists donations_donor_email_idx
  on public.donations (donor_email);

create index if not exists donations_paid_at_idx
  on public.donations (paid_at desc);

-- ---------------------------------------------------------------------------
-- RLS: nobody reaches this table with the anon or an authenticated key.
--
-- Donation records carry donor names, emails and amounts. The portal has
-- volunteer logins, and a volunteer has no business reading the donor list.
-- With RLS enabled and no policy granting access, every request except one
-- using the service-role key is denied. The webhook uses the service role,
-- which bypasses RLS by design; that key is server-only.
-- ---------------------------------------------------------------------------
alter table public.donations enable row level security;

-- Deliberately no policies. Adding one later is an explicit decision to make
-- donor data reachable from a client, and should be reviewed as such.
