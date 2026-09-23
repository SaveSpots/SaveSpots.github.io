/**
 * Creates a Square-hosted checkout page for a donation and returns its URL.
 * Handles both one-time gifts and monthly recurring giving.
 *
 * WHY HOSTED CHECKOUT, NOT AN INLINE CARD FORM: card data never touches
 * savespots.org this way, which keeps us on SAQ-A — the shortest PCI
 * self-assessment — instead of SAQ-A-EP. Square's page also brings Apple Pay,
 * Google Pay, Cash App Pay and 3-D Secure for free. The trade-off is one
 * redirect off-site; a donor never types a card number here.
 *
 * Docs: POST /v2/online-checkout/payment-links (Checkout API).
 */

import { NextResponse } from "next/server";
import { MAX_GIFT_USD, MIN_GIFT_USD, org } from "@/lib/donate-config";
import { SquareError, requireSquareConfig, squareFetch } from "@/lib/square";
import { ensureMonthlyVariationId } from "@/lib/square-donation-plan";
import { siteOrigin } from "@/lib/site-url";

// Square-hosted checkout is created per-request, so this can never be static.
export const dynamic = "force-dynamic";

type Frequency = "once" | "monthly";

interface DonateRequestBody {
  /** Whole US dollars. Cents are handled server-side to avoid float drift. */
  amount?: unknown;
  frequency?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
}

function asTrimmedString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export async function POST(request: Request) {
  let locationId: string;
  try {
    ({ locationId } = requireSquareConfig());
  } catch {
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

  const frequency: Frequency = body.frequency === "monthly" ? "monthly" : "once";

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

  const firstName = asTrimmedString(body.firstName, 60);
  const lastName = asTrimmedString(body.lastName, 60);
  const donorEmail = asTrimmedString(body.email, 254);
  const donorName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

  // Canonical origin: this URL is baked into the Square payment link, and a
  // donor finishing a gift should return to the domain they trusted with
  // their card, not the deploy host.
  const origin = siteOrigin(request.url);

  // A monthly gift charges a subscription plan variation, and Square requires
  // one variation per price point. This resolves (or creates) the variation
  // for this amount before the link is built.
  let subscriptionPlanId: string | undefined;
  if (frequency === "monthly") {
    try {
      subscriptionPlanId = await ensureMonthlyVariationId(amountCents);
    } catch (error) {
      console.error("[donate] Could not resolve a monthly plan variation:", {
        amountCents,
        errors: error instanceof SquareError ? error.errors : error,
      });
      return NextResponse.json(
        {
          error:
            "We could not set up a monthly gift right now. A one-time gift will work, or email us and we will take it from there.",
        },
        { status: 502 }
      );
    }
  }

  const itemName =
    frequency === "monthly"
      ? "Monthly donation to SaveSpots"
      : "Donation to SaveSpots";

  const payload = {
    // Square dedupes on this key, so a double-click cannot create two links.
    idempotency_key: crypto.randomUUID(),
    quick_pay: {
      name: itemName,
      // For a subscription this must match the variation's price exactly.
      price_money: { amount: amountCents, currency: "USD" },
      location_id: locationId,
    },
    checkout_options: {
      redirect_url: `${origin}/donate/thank-you?amount=${amountCents}&frequency=${frequency}`,
      // A donation ships nothing and should not prompt for a tip on top.
      ask_for_shipping_address: false,
      allow_tipping: false,
      // A coupon box on a donation page is noise at best and an invitation to
      // hunt for a discount code at worst.
      enable_coupon: false,
      enable_loyalty: false,
      ...(subscriptionPlanId ? { subscription_plan_id: subscriptionPlanId } : {}),
      accepted_payment_methods: {
        apple_pay: true,
        google_pay: true,
        // Square does not support Cash App Pay or Afterpay on subscriptions,
        // and sending them anyway makes the whole request fail.
        cash_app_pay: frequency === "once",
        // Buy-now-pay-later on a charitable gift is a support burden, not a feature.
        afterpay_clearpay: false,
      },
    },
    // Prefills Square's own checkout fields. The email is what makes Square
    // send its receipt; the name fields just save the donor retyping. Square
    // still asks for all of it and only requires the email, so sending
    // nothing here is harmless.
    pre_populated_data:
      donorEmail || firstName || lastName
        ? {
            ...(donorEmail ? { buyer_email: donorEmail } : {}),
            ...(firstName || lastName
              ? {
                  buyer_address: {
                    ...(firstName ? { first_name: firstName } : {}),
                    ...(lastName ? { last_name: lastName } : {}),
                  },
                }
              : {}),
          }
        : undefined,
    description: donorName ? `${itemName} from ${donorName}` : itemName,
  };

  try {
    const result = await squareFetch<{ payment_link?: { url?: string } }>(
      "/v2/online-checkout/payment-links",
      { method: "POST", body: payload }
    );

    if (!result.payment_link?.url) {
      console.error("[donate] Square returned no checkout URL:", result);
      return NextResponse.json(
        { error: "We could not start the payment. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: result.payment_link.url });
  } catch (error) {
    // Square's own error text can name internal fields, so it stays in the log.
    console.error("[donate] Square rejected the payment link request:", {
      frequency,
      amountCents,
      errors: error instanceof SquareError ? error.errors : error,
    });
    return NextResponse.json(
      { error: "We could not start the payment. Please try again." },
      { status: 502 }
    );
  }
}
