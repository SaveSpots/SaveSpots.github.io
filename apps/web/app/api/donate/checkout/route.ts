/**
 * Creates a Square-hosted checkout page for a donation and returns its URL.
 *
 * WHY HOSTED CHECKOUT, NOT AN INLINE CARD FORM: card data never touches
 * savespots.org this way, which keeps us on SAQ-A — the shortest PCI
 * self-assessment — instead of SAQ-A-EP. Square's page also brings Apple Pay,
 * Google Pay, Cash App Pay and 3-D Secure for free. The trade-off is one
 * redirect off-site; a donor never types a card number here.
 *
 * The Square access token is server-only. It must never reach the browser, so
 * this route exists purely to hold it.
 *
 * Docs: POST /v2/online-checkout/payment-links (Checkout API).
 */

import { NextResponse } from "next/server";
import { MAX_GIFT_USD, MIN_GIFT_USD, org } from "@/lib/donate-config";

// Square's hosted checkout is created per-request, so this can never be static.
export const dynamic = "force-dynamic";

/**
 * Pinned rather than floating: Square treats the version header as an API
 * contract, and an unpinned request silently follows breaking changes.
 */
const SQUARE_VERSION = "2026-09-16";

function squareBaseUrl() {
  // Anything other than an explicit "production" stays on sandbox, so a
  // misconfigured deploy fails safe into test money rather than real money.
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

interface DonateRequestBody {
  /** Whole US dollars. Cents are handled server-side to avoid float drift. */
  amount?: unknown;
  name?: unknown;
  email?: unknown;
}

function asTrimmedString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export async function POST(request: Request) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!accessToken || !locationId) {
    // Deliberately vague to the donor, loud in the server logs: the donor can
    // do nothing about this, and the message would leak our config state.
    console.error(
      "[donate] SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID is not set; refusing to create a payment link."
    );
    return NextResponse.json(
      { error: "Donations are temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  let body: DonateRequestBody;
  try {
    body = (await request.json()) as DonateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < MIN_GIFT_USD || amount > MAX_GIFT_USD) {
    return NextResponse.json(
      {
        error: `Enter an amount between $${MIN_GIFT_USD} and $${MAX_GIFT_USD.toLocaleString()}. For larger gifts, email ${org.email}.`,
      },
      { status: 400 }
    );
  }

  // Square takes the smallest currency unit. Round after the multiply so a
  // value like 10.005 cannot round up to an extra cent on the donor.
  const amountCents = Math.round(amount * 100);

  const donorName = asTrimmedString(body.name, 120);
  const donorEmail = asTrimmedString(body.email, 254);

  const origin = new URL(request.url).origin;

  const payload = {
    // Square dedupes on this key, so a double-click cannot create two links.
    idempotency_key: crypto.randomUUID(),
    quick_pay: {
      name: "Donation to SaveSpots",
      price_money: { amount: amountCents, currency: "USD" },
      location_id: locationId,
    },
    checkout_options: {
      redirect_url: `${origin}/donate/thank-you?amount=${amountCents}`,
      // A donation ships nothing and should not prompt for a tip on top.
      ask_for_shipping_address: false,
      allow_tipping: false,
      accepted_payment_methods: {
        apple_pay: true,
        google_pay: true,
        cash_app_pay: true,
        // Buy-now-pay-later on a charitable gift is a support burden, not a feature.
        afterpay_clearpay: false,
      },
    },
    // Prefilling the email means Square emails the donor its own receipt.
    pre_populated_data: donorEmail ? { buyer_email: donorEmail } : undefined,
    description: donorName
      ? `Donation from ${donorName}`
      : "Donation to SaveSpots",
  };

  let response: Response;
  try {
    response = await fetch(`${squareBaseUrl()}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": SQUARE_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[donate] Could not reach Square:", error);
    return NextResponse.json(
      { error: "We could not reach our payment processor. Please try again." },
      { status: 502 }
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.payment_link?.url) {
    // Square's own error text can name internal fields, so it stays in the log.
    console.error("[donate] Square rejected the payment link request:", {
      status: response.status,
      errors: result?.errors,
    });
    return NextResponse.json(
      { error: "We could not start the payment. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: result.payment_link.url as string });
}
