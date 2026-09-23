/**
 * Square webhook: records completed donations and emails the donor a proper
 * 501(c)(3) contribution acknowledgment.
 *
 * SECURITY: this endpoint is public and anyone can POST to it. The HMAC
 * signature check below is the ONLY thing separating a real Square event from
 * a forged one, so it runs before the body is parsed or trusted, and it
 * compares in constant time. A request that fails it is rejected outright —
 * we never fall back to "looks like a payment, record it anyway".
 *
 * IDEMPOTENCY: Square delivers at least once and retries on any non-2xx, so
 * the same payment can arrive several times. `square_payment_id` is unique in
 * the database and the insert ignores duplicates, which is what stops a donor
 * getting five acknowledgment emails for one gift.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendReceiptEmail } from "@/lib/donation-receipt";

export const dynamic = "force-dynamic";
// The signature is computed over the raw body, so this must run on Node,
// not the edge runtime.
export const runtime = "nodejs";

/**
 * Square signs (notification_url + raw_body). The URL must match what is
 * registered on the subscription EXACTLY — scheme, host and path. If the
 * subscription points at https://savespots.org/api/donate/webhook, that
 * exact string is what gets hashed, which is why it is configuration rather
 * than something derived from the incoming request (an attacker controls
 * the Host header; they do not control this).
 */
function notificationUrl(): string {
  return (
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ??
    "https://savespots.org/api/donate/webhook"
  );
}

function isSignatureValid(rawBody: string, provided: string | null): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !provided) return false;

  const expected = createHmac("sha256", key)
    .update(notificationUrl() + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  // timingSafeEqual throws on a length mismatch, so check that first — and
  // length alone leaks nothing useful about the key.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface SquarePayment {
  id?: string;
  order_id?: string;
  status?: string;
  amount_money?: { amount?: number; currency?: string };
  buyer_email_address?: string;
  created_at?: string;
  shipping_address?: { first_name?: string; last_name?: string };
  billing_address?: { first_name?: string; last_name?: string };
}

export async function POST(request: Request) {
  // Read the body as text, never as JSON first: re-serializing would change
  // whitespace and key order and the signature would never match.
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");

  if (!isSignatureValid(rawBody, signature)) {
    console.error("[donate-webhook] Rejected a request with an invalid signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payment: SquarePayment | undefined = event?.data?.object?.payment;

  // Square sends several event types on one subscription. Anything that is
  // not a settled payment is acknowledged and ignored — returning non-2xx
  // would make Square retry an event we are never going to act on.
  if (!payment?.id || payment.status !== "COMPLETED") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const amountCents = payment.amount_money?.amount;
  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const address = payment.billing_address ?? payment.shipping_address;
  const paidAt = payment.created_at ? new Date(payment.created_at) : new Date();
  // A subscription payment carries no order the way a one-off does; Square
  // sets a subscription id on the order instead. Treating a missing order id
  // as recurring would be wrong, so this reads the event's own flag.
  const isRecurring = Boolean(event?.data?.object?.subscription_id);

  const supabase = getSupabaseAdmin();

  // onConflict + ignoreDuplicates makes the retry a no-op rather than an
  // error, and `select` tells us whether THIS call was the one that inserted.
  const { data: inserted, error: insertError } = await supabase
    .from("donations")
    .upsert(
      {
        square_payment_id: payment.id,
        square_order_id: payment.order_id ?? null,
        amount_cents: amountCents,
        currency: payment.amount_money?.currency ?? "USD",
        status: payment.status,
        donor_email: payment.buyer_email_address ?? null,
        donor_first_name: address?.first_name ?? null,
        donor_last_name: address?.last_name ?? null,
        is_recurring: isRecurring,
        paid_at: paidAt.toISOString(),
      },
      { onConflict: "square_payment_id", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  if (insertError) {
    // Return 500 so Square retries: losing a donation record is worse than
    // a duplicate delivery, which the unique constraint already absorbs.
    console.error("[donate-webhook] Could not record the donation:", insertError);
    return NextResponse.json({ error: "Storage failed." }, { status: 500 });
  }

  // No row back means a previous delivery already handled this payment, so
  // the email has been sent (or already failed and been logged). Stop here.
  if (!inserted) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const donorEmail = payment.buyer_email_address;
  if (!donorEmail) {
    // Square requires an email at checkout, so this should not happen — but
    // the gift is recorded either way and someone can follow up by hand.
    console.warn("[donate-webhook] Payment has no buyer email:", payment.id);
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    await sendReceiptEmail({
      to: donorEmail,
      firstName: address?.first_name ?? null,
      amountCents,
      paidAt,
      isRecurring,
    });
    await supabase
      .from("donations")
      .update({ receipt_sent_at: new Date().toISOString() })
      .eq("id", inserted.id);
  } catch (error) {
    // The money arrived and the record exists; only the email failed. Record
    // why and return 200 — a retry would re-run the whole handler, and the
    // duplicate guard above would then skip the email forever. The stored
    // error is what a retry sweep reads.
    const message = error instanceof Error ? error.message : String(error);
    console.error("[donate-webhook] Receipt email failed:", message);
    await supabase
      .from("donations")
      .update({ receipt_error: message.slice(0, 500) })
      .eq("id", inserted.id);
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
