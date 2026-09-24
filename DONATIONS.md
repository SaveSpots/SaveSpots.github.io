# Donations — Square setup, compliance, and what still needs doing

Covers `/donate`, `/donate/thank-you`, and `POST /api/donate/checkout`.

---

## 1. What was built

| Piece | File |
|---|---|
| Donate page (amount picker, donor fields, trust copy) | `apps/web/app/donate/page.tsx` |
| Amount picker + submit logic | `apps/web/components/donate/donate-form.tsx` |
| Server route that creates the Square checkout | `apps/web/app/api/donate/checkout/route.ts` |
| Post-payment confirmation / on-screen acknowledgment | `apps/web/app/donate/thank-you/page.tsx` |
| Legal strings, EIN, gift tiers | `apps/web/lib/donate-config.ts` |
| Square API client (token, base URL, pinned version) | `apps/web/lib/square.ts` |
| Monthly giving: amount -> subscription plan variation | `apps/web/lib/square-donation-plan.ts` |
| Donate button in nav + footer | `apps/web/components/layout/navbar.tsx`, `footer.tsx` |

`Donate` is now the only filled button in the nav bar. `Volunteer Portal` dropped to
an outline so there is exactly one primary action sitewide.

---

## 2. Why Square-hosted checkout and not a card form on our site

Square offers three ways in. We took the middle one.

| Option | What it is | Why not / why yes |
|---|---|---|
| Payment link made by hand in the Square Dashboard | One static "Donate" URL | No preset amounts, no impact copy, no redirect back to our thank-you page, no donor metadata. Fine as a backup, bad as the product. |
| **Checkout API payment links (what we built)** | Our server calls Square, Square returns a one-time hosted checkout URL, donor is redirected | Card data never touches savespots.org. Apple Pay / Google Pay / Cash App Pay and 3-D Secure come free. Preset amounts and impact copy stay ours. |
| Web Payments SDK | Card fields embedded in our page, tokenized client-side, charged server-side | No redirect, fully branded — but it pulls us from PCI **SAQ-A** into **SAQ-A-EP**, a much longer annual self-assessment, because our page would serve the payment form. Not worth it for a volunteer-run nonprofit. |

The practical consequence: **we never see, transmit, or store a card number.** That
is the single most important property of this design and it should not be traded
away for the sake of removing one redirect.

---

## 3. Getting it live (Square side — this part is yours)

### 3.1 Create the application
1. <https://developer.squareup.com/apps> — sign in with the Square account that owns the nonprofit's bank link.
2. **+** to create an application. Name it `SaveSpots Web`.

### 3.2 Grab sandbox credentials first
3. In the app, switch the top toggle to **Sandbox**.
4. **Credentials** → copy the **Sandbox Access Token**.
5. **Locations** → copy the **Sandbox Location ID**.

### 3.3 Grab production credentials
6. Flip the toggle to **Production**.
7. **Credentials** → **Production Access Token**. This one charges real cards — treat it like a bank password.
8. **Locations** → **Production Location ID**.

### 3.4 Required OAuth scopes
If you ever move from a personal access token to OAuth, the token needs:
`PAYMENTS_WRITE`, `ORDERS_READ`, `ORDERS_WRITE`.

### 3.5 Nonprofit pricing — do this, it is real money
Square gives approved 501(c)(3) organizations a discounted processing rate
(standard online is 2.9% + 30¢; the nonprofit rate is lower). It is **not
automatic** — apply through Square Support with the IRS determination letter.
On $10,000 of annual giving the difference is roughly $50–$70. Apply before
volume ramps.

---

## 4. Environment variables

Set these in **Netlify → Site configuration → Environment variables** (the live
site builds on Netlify; `netlify.toml` is the source of truth) and in
`apps/web/.env.local` for local work.

```
SQUARE_ACCESS_TOKEN=<production or sandbox access token>
SQUARE_LOCATION_ID=<matching location id>
SQUARE_ENVIRONMENT=production
```

**These are server-only. Never prefix them with `NEXT_PUBLIC_`** — that would
publish the access token to every browser that loads the site, and anyone could
then issue refunds and read the full payment history.

`SQUARE_ENVIRONMENT` fails safe: any value other than the exact string
`production` routes to Square's sandbox. A deploy that forgets the variable
takes fake money, not real money.

The sandbox and production tokens are **not interchangeable** — a production
token against the sandbox host returns `UNAUTHORIZED`, and vice versa. Keep the
environment and the token in sync.

---

## 5. How a payment is actually authorized

```
donor picks $50 on /donate
      │
      ▼
POST /api/donate/checkout        (our server; holds the secret token)
      │  validates amount, converts to cents, adds an idempotency key
      ▼
POST connect.squareup.com/v2/online-checkout/payment-links
      │  Square-Version: 2026-09-16, Bearer <SQUARE_ACCESS_TOKEN>
      ▼
Square returns { payment_link: { url } }
      │
      ▼
browser redirects to Square's hosted checkout
      │  donor enters card / taps Apple Pay — on Square's domain, not ours
      ▼
Square authorizes and captures with the card networks, emails its own receipt
      │
      ▼
redirect back to /donate/thank-you?amount=5000
```

Money lands in the Square balance and pays out to the linked bank account on
Square's normal schedule (next business day by default).

Guards already in the route:
- Amount must be a finite number between `$1` and `$10,000` (typo ceiling, not policy).
- Cents are computed with `Math.round(amount * 100)` so floating point cannot overcharge by a cent.
- A fresh `idempotency_key` per request — a double-click cannot create two links.
- Square's raw error text goes to the server log, never to the donor.
- Missing credentials return a 503 with a neutral message instead of a stack trace.

---

## 6. 501(c)(3) compliance — what a donation page must carry

Yes, the tax status is relevant. It changes what the page is legally required to say.

### On the page (done)
- **Legal name and EIN.** Donors need the EIN to substantiate the deduction. It is in the footer sitewide and on `/donate`.
- **Tax-deductibility statement.** "…tax-deductible to the extent allowed by law." Never promise a deduction outright — that depends on the donor's own tax situation.
- **Unrestricted-gift notice.** The `$50 covers test strips` framing is marketing, not an earmark. The notice keeps it honest: gifts are unrestricted and go where the need is greatest. Without it, tier copy can create a restricted-gift obligation you then have to honor and account for.

### On the receipt (partly done)
IRS Publication 1771:
- A gift of **$250 or more** requires a **contemporaneous written acknowledgment** stating the amount and **"no goods or services were provided in exchange."** Missing that sentence, the donor loses the deduction.
- A **quid pro quo** gift over **$75** (donor gets a t-shirt, gala seat, etc.) requires a good-faith estimate of the item's value and a statement that only the excess is deductible. **We currently give nothing back, so this does not apply — the moment you add donor swag, it does.**

Right now `/donate/thank-you` displays that language on screen and Square emails a
payment receipt. **That combination is thin for gifts ≥ $250** — see §8.

### Still outstanding
- [ ] **Replace the placeholder EIN** in `apps/web/lib/donate-config.ts`. It currently reads `00-0000000`. This is the one blocker before promoting the page.
- [ ] **Confirm the legal name** matches the IRS determination letter exactly (`SaveSpots NFP` is a guess).
- [ ] **Illinois charitable solicitation registration.** Illinois requires charities soliciting in-state to register with the Attorney General's Charitable Trust Bureau (Form CO-1 / CO-2, annual AG990-IL). Soliciting online from an Illinois address counts. Confirm registration is current.
- [ ] **Multi-state solicitation.** ~40 states require registration to solicit residents. A public donate button is technically a solicitation in all of them. Most small nonprofits accept this risk and register where they actively fundraise; know that you are making that choice, not missing it.
- [ ] **Refund policy.** Add a line for it. Standard practice: refunds honored on request within 30 days for mistakes or duplicates.

---

## 7. What makes a donation page convert — and what we did about it

Researched against nonprofit fundraising norms; each row says what the page does.

| Principle | In our page |
|---|---|
| One ask, no competing CTAs | `/donate` strips the site nav to a single "Back to SaveSpots" link. Every nav item is an exit. |
| Specific, concrete impact beats abstract need | "An overdose is reversible. Only if the naloxone is close enough." Tier lines name supplies, not budget categories. |
| Preset amounts with one pre-selected | Four tiers, `$50` featured and selected on load. Anchoring — a blank field converts worse than a chosen default. |
| Custom amount always available | Yes, and focusing it deselects the tiers. |
| Minimum possible fields | Name and email only, both optional. Every extra field costs donors. |
| Mobile first | Below `lg` the form sits directly under the headline; the three "why give" blocks move below it. Amount buttons are full-width tap targets. |
| Digital wallets | Apple Pay, Google Pay and Cash App Pay are enabled on the Square checkout. On mobile these convert far better than typed cards. |
| Visible trust signals | "Processed securely by Square", explicit "SaveSpots never sees or stores your card details", EIN, contact email. |
| Volunteer-run / overhead transparency | "Our team is unpaid. Your gift buys supplies and logistics, not salaries." Overhead anxiety is a top reason people abandon. |
| Thank-you page that does work | Confirms the amount, carries the tax language, offers a formal letter, and asks for a share. |
| No tipping prompt, no BNPL | Both disabled. A tip prompt on a charitable gift reads as a second ask; buy-now-pay-later on a donation is a support burden. |

### Deliberately deferred
- **"Cover the processing fee" checkbox.** Easy win, typically 50–80% opt-in. Add `amount + (amount * 0.029 + 0.30)` as an optional line.
- **A real impact number in the hero.** Live SaveSpot count already exists in Supabase; surfacing it on `/donate` would be strong social proof.

---

## 7a. Monthly giving (Subscriptions API)

Recurring donors are worth several times a one-time donor, so `/donate` carries a
One-time / Monthly toggle. One-time is the default — defaulting a visitor into a
recurring charge is a chargeback waiting to happen.

### The constraint that shapes the design

Square cannot charge an arbitrary recurring amount from a payment link. A donor
subscribes to a **subscription plan variation**, and a variation has a **fixed
price**. So every distinct monthly amount needs its own catalog variation.

Two bad options and the one we took:

- Pre-create a variation per suggested tier, reject custom monthly amounts — donors who want $37/month are turned away.
- Create a variation per donor — the catalog fills with thousands of near-identical objects.
- **Create variations lazily and reuse them.** The first donor to give $37/month creates `SaveSpots Monthly Giving — $37.00`; every later $37 donor reuses it. The catalog grows with the number of *distinct amounts*, not the number of donors.

`lib/square-donation-plan.ts` does this. It memoizes within a server instance and
falls back to reading the catalog on a cold start, so the cache is never a source
of truth.

### The call chain

```
frequency: "monthly"
      │
      ▼
ensureMonthlyVariationId(amountCents)
      │  GET /v2/catalog/list?types=SUBSCRIPTION_PLAN          find or create "SaveSpots Monthly Giving"
      │  GET /v2/catalog/list?types=SUBSCRIPTION_PLAN_VARIATION find or create the $X/month variation
      ▼
CreatePaymentLink with checkout_options.subscription_plan_id = <variation id>
      │  quick_pay.price_money must match the variation price exactly
      ▼
Square checkout shows "$25.00 / month"
```

### Details that are easy to get wrong

- `subscription_plan_id` takes the **variation** id, not the plan id. Passing the plan id fails.
- The phase uses `pricing.price_money`, not `pricing.price`. Square's own guide pages disagree with each other here; `price_money` is what API version `2026-09-16` accepts. Verified against production.
- `periods` is **omitted** on purpose. Setting it would silently end the donor's giving after N months.
- Square does **not** support Cash App Pay or Afterpay on subscriptions. The route turns Cash App Pay off for monthly gifts; sending it anyway fails the whole request.
- `enable_coupon: false` and `enable_loyalty: false` are set on both flows. A coupon box on a donation page invites people to go hunting for a discount code.

### Cancellation

Donors currently cancel by emailing us, and we cancel from the Square Dashboard
(**Payments & orders → Subscriptions**). That is honest and it is what the page
says, but it is manual. A self-serve cancel link is worth building once monthly
volume is real.

---

## 7b. Branding the Square checkout page

The checkout page is Square's, not ours, so branding is a **Dashboard setting —
there is no API for it**. Out of the box it is a plain white page with
"SaveSpots NFP" as text and no logo.

**Square Dashboard → Payments & orders → Payment links → Settings → Branding**

| Control | Set it to | Why |
|---|---|---|
| Logo | `apps/web/public/assets/SaveSpotsLogo.png` | Without it the page is a bare text header, which reads as a phishing risk to a cautious donor. |
| Button colour | `#5a2532` | `theme-red`, the brand backbone. |
| Button shape | Rounded / pill | The shape system in `BRAND_GUIDE.md` is locked to pills. |
| Font | Closest geometric sans in the dropdown | Plus Jakarta Sans is not offered; pick the nearest. |

The logo also comes from **Location settings**, so set it there too if the
branding panel does not pick it up.

**What you cannot change:** the page layout, the Square footer, and the
`checkout.square.site` domain. Square's hosted checkout cannot be white-labelled.
That is the price of staying on PCI SAQ-A — see §2. Full brand control means
embedding the Web Payments SDK and taking on SAQ-A-EP.

---

## 7c. Receipts: what donors actually get

Three different documents get confused with each other. They are not the same thing.

| | What it is | Who sends it | Status |
|---|---|---|---|
| Payment receipt | Proof a card was charged | Square, automatically | Working |
| Contribution acknowledgment | The IRS document a donor needs to deduct the gift | Us | **Needs the Dashboard step below** |
| Year-end summary | One letter totalling a donor's giving for the year | Us | Not built — needs the webhook |

### Every donor does get a receipt

Square's hosted checkout marks the email field `aria-required="true"` and will not
submit without it, so there is no path where a donor pays and no receipt is sent.
The optional email box on `/donate` only pre-fills that field through
`pre_populated_data.buyer_email` — it saves the donor retyping, it is not what
makes the receipt happen. Leaving it blank costs nothing.

### What Square's receipt does NOT say

It is a payment receipt. It does not carry the IRS language, and Square does not
generate tax-compliant donation receipts on its own.

IRS Publication 1771: a gift of **$250 or more** needs a contemporaneous written
acknowledgment stating the amount and that **no goods or services were provided
in exchange**. Without that sentence the donor cannot claim the deduction.

### The fix — Square Dashboard, once, two minutes

**Square Dashboard → Settings → Receipts → Custom Text**

Paste this (it matches the strings in `apps/web/lib/donate-config.ts`, so keep
the two in sync if either changes):

```
Thank you for supporting SaveSpots. SaveSpots NFP is a tax-exempt organization
under Section 501(c)(3) of the Internal Revenue Code (EIN 39-3700157).
Contributions are tax-deductible to the extent allowed by law. No goods or
services were provided in exchange for this contribution.
Questions: sameer@savespots.org
```

That footer lands on every Square receipt, which turns each one into a valid
acknowledgment for gifts of any size — including the $250+ ones that legally
require it. **Until this is set, donors giving $250 or more have no document
that satisfies the IRS.**

`/donate/thank-you` already shows the same language on screen, but an on-screen
page a donor may never revisit is weak substantiation. The emailed receipt is
what they keep.

### Built: the acknowledgment pipeline

`POST /api/donate/webhook` is subscribed to Square's `payment.updated` event
(subscription `wbhk_2750acebf4474f538416882e1acebf2a`). On a COMPLETED payment it
writes a row to `public.donations` and emails the donor a Pub. 1771-compliant
acknowledgment via Resend, from `noreply@savespots.org`.

Things worth knowing before changing any of it:

- **The signature check is the whole security model.** The endpoint is public. Square signs `notification_url + raw_body`, so the URL in `SQUARE_WEBHOOK_NOTIFICATION_URL` must match the subscription EXACTLY — change one and the other stops verifying. The raw body is hashed before parsing, because re-serializing JSON changes whitespace and key order and the signature would never match again.
- **Deliveries are at-least-once.** `square_payment_id` is unique and the insert ignores duplicates. That is what stops one gift producing five acknowledgment emails.
- **Failure handling is asymmetric on purpose.** A storage failure returns 500 so Square retries; losing a donation record is worse than a duplicate delivery, which the unique constraint absorbs. An email failure returns 200 and records the reason in `receipt_error` — a retry would hit the duplicate guard and skip the email forever, so the stored error is what a sweep job reads instead.
- **`public.donations` has RLS on and no policies.** Only the service role can reach it. The portal has volunteer logins, and a volunteer has no business reading donor names, emails and amounts. Verified: an anon insert is rejected with `42501`.

Verified in production: forged and unsigned requests get 401; a correctly signed
event records the gift and emails the receipt; a replay of the same event returns
`duplicate` and sends nothing. A real $1 donation went through the whole path.

### Still not built

- **Year-end summary letters.** A monthly donor giving $25 gets twelve separate acknowledgments and no annual total. Standard practice is one January letter. The data is now there to generate them.
- **A retry sweep** for rows where `receipt_error` is set and `receipt_sent_at` is null.

---

## 8. Next steps, in priority order

1. **Put the real EIN in `donate-config.ts`.** Still `00-0000000`. Blocker before promoting the page. (The legal name `SaveSpots NFP` is confirmed — it matches the Square location.)
2. **Rotate the Square access token.** The production token was pasted into a chat transcript during setup. Revoke and regenerate it in **Developer → Credentials**, then set the new value in Netlify only.
3. ~~Set the three env vars in Netlify.~~ **Done** — all three are set on the `savespots` site and verified against production. Note that setting variables does not touch a running site; a rebuild was needed for the functions to pick them up.
3b. **Set the receipt Custom Text in the Square Dashboard** — §7c. Two minutes, and until it is done no donor giving $250 or more has an IRS-valid acknowledgment.
4. **Brand the Square checkout page** — §7b, five minutes in the Dashboard.
5. **Run one real $1 donation from your own card and refund it.** Then one $1 monthly gift; cancel the subscription from the Dashboard. Do not skip the monthly test — it exercises a different code path.
6. **Apply for Square's nonprofit processing rate.**
7. **Add the `payment.updated` webhook.** We still have no record of a donation in our own systems — only Square's dashboard. A route verifying the `x-square-hmacsha256-signature` header against `SQUARE_WEBHOOK_SIGNATURE_KEY` and writing to a Supabase `donations` table would give you a donor list, annual totals for the Form 990, and proper year-end acknowledgment letters. **This is the real gap for gifts of $250 or more.**
8. **Self-serve subscription cancellation** once monthly volume justifies it.
9. **Confirm Illinois AG charitable registration is current** — see §6.

### A note on the thank-you page amount
`/donate/thank-you` reads the amount from the query string, which is the figure
*we asked Square to charge* — not proof of a settled payment, and editable in the
address bar. It is a courtesy confirmation. The receipt of record is Square's
email. Step 5 is what turns it into something authoritative.
