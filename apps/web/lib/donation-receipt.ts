/**
 * The contribution acknowledgment we email a donor. Server-only.
 *
 * WHY THIS EXISTS AND SQUARE'S RECEIPT IS NOT ENOUGH: Square sends a payment
 * receipt — proof a card was charged. IRS Publication 1771 requires something
 * different for a gift of $250 or more: a contemporaneous written
 * acknowledgment naming the organization, the amount, the date, and stating
 * that no goods or services were provided in exchange. Without that sentence
 * the donor cannot deduct the gift. Square does not produce it.
 *
 * We send it for every gift, not only those over $250, because the threshold
 * is a floor on what the IRS requires, not a ceiling on what is useful.
 */

import {
  NO_GOODS_OR_SERVICES,
  TAX_DEDUCTIBLE_NOTICE,
  org,
} from "@/lib/donate-config";

const FROM = "SaveSpots <noreply@savespots.org>";

export interface ReceiptInput {
  to: string;
  firstName?: string | null;
  amountCents: number;
  paidAt: Date;
  isRecurring: boolean;
}

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });
}

/** Escapes values that reach the HTML body. Donor names are attacker-controlled. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReceiptEmail(input: ReceiptInput): {
  subject: string;
  html: string;
  text: string;
} {
  const amount = formatUsd(input.amountCents);
  const date = formatDate(input.paidAt);
  const greeting = input.firstName
    ? `Thank you, ${input.firstName}.`
    : "Thank you.";
  const recurringLine = input.isRecurring
    ? "This is a recurring monthly gift. To change or cancel it, reply to this email."
    : "";

  const subject = `Your ${amount} donation to SaveSpots`;

  const text = [
    greeting,
    "",
    `Your gift of ${amount} on ${date} goes straight into naloxone, fentanyl test strips, and the SaveBoxes that hold them.`,
    recurringLine,
    "",
    "--- For your tax records ---",
    `Organization: ${org.legalName}`,
    `EIN: ${org.ein}`,
    `Amount: ${amount}`,
    `Date: ${date}`,
    "",
    TAX_DEDUCTIBLE_NOTICE,
    NO_GOODS_OR_SERVICES,
    "",
    `Questions: ${org.email}`,
    "savespots.org",
  ]
    .filter((line) => line !== "")
    .join("\n");

  // Inline styles and a table-free layout: every notable email client strips
  // <style> blocks, and Gmail's clipping kicks in around 102KB.
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F2E9E3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#431b26;">${escapeHtml(greeting)}</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#431b26;opacity:0.8;">
        Your gift of <strong style="opacity:1;">${amount}</strong> on ${date} goes straight
        into naloxone, fentanyl test strips, and the SaveBoxes that hold them.
      </p>
      ${
        recurringLine
          ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#431b26;opacity:0.7;">${recurringLine}</p>`
          : ""
      }
      <div style="margin:24px 0;padding:20px;background:#FBF6F3;border-radius:16px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5a2532;font-weight:700;">
          For your tax records
        </p>
        <p style="margin:0 0 4px;font-size:14px;line-height:1.7;color:#431b26;">
          <strong>Organization:</strong> ${escapeHtml(org.legalName)}<br />
          <strong>EIN:</strong> ${escapeHtml(org.ein)}<br />
          <strong>Amount:</strong> ${amount}<br />
          <strong>Date:</strong> ${date}
        </p>
        <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#431b26;opacity:0.75;">
          ${escapeHtml(TAX_DEDUCTIBLE_NOTICE)} ${escapeHtml(NO_GOODS_OR_SERVICES)}
        </p>
      </div>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#431b26;opacity:0.6;">
        Questions? Email <a href="mailto:${escapeHtml(org.email)}" style="color:#5a2532;">${escapeHtml(org.email)}</a> ·
        <a href="https://savespots.org" style="color:#5a2532;">savespots.org</a>
      </p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}

/** Sends via Resend. Throws on failure so the caller can record why. */
export async function sendReceiptEmail(input: ReceiptInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const { subject, html, text } = buildReceiptEmail(input);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [input.to],
      reply_to: org.email,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend returned ${response.status}: ${detail.slice(0, 300)}`);
  }
}
