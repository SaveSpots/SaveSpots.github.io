import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  NO_GOODS_OR_SERVICES,
  TAX_DEDUCTIBLE_NOTICE,
  org,
} from "@/lib/donate-config";
import { socials } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Thank you | SaveSpots",
  // This page is only meaningful to the person who just gave; keep it out of search.
  robots: "noindex, nofollow",
};

/**
 * NOTE ON THE AMOUNT SHOWN HERE: Square appends nothing to redirect_url that
 * we did not put there ourselves, so `amount` is the figure we asked Square to
 * charge — it is not proof of a settled payment, and a visitor can edit it in
 * the address bar. It is displayed as a courtesy confirmation only. The
 * receipt of record is the one Square emails the donor. Hooking the
 * `payment.updated` webhook up to our own records is the next step; see
 * DONATIONS.md.
 */
function formatAmount(raw: string | undefined): string | null {
  if (!raw) return null;
  const cents = Number.parseInt(raw, 10);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { amount?: string };
}) {
  const amount = formatAmount(searchParams.amount);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-theme-red px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-theme-red-dark/20 md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-theme-red/10">
          <CheckCircle2 className="h-8 w-8 text-theme-red" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-theme-red-dark md:text-4xl">
          Thank you.
        </h1>

        <p className="mt-4 text-lg font-medium leading-relaxed text-theme-red-dark/70">
          {amount ? (
            <>
              Your <span className="font-bold text-theme-red-dark">{amount}</span>{" "}
              gift goes straight into naloxone, test strips, and the boxes that
              hold them.
            </>
          ) : (
            <>
              Your gift goes straight into naloxone, test strips, and the boxes
              that hold them.
            </>
          )}
        </p>

        <div className="mt-8 rounded-2xl bg-cream p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-red/70">
            For your records
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-theme-red-dark/75">
            Square has emailed your payment receipt. {TAX_DEDUCTIBLE_NOTICE}{" "}
            {NO_GOODS_OR_SERVICES}
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-theme-red-dark/75">
            Need a formal acknowledgment letter? Email{" "}
            <a
              href={`mailto:${org.email}`}
              className="font-semibold underline underline-offset-2"
            >
              {org.email}
            </a>
            .
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-theme-red px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-theme-red-light"
          >
            Back to SaveSpots
          </Link>

          {socials.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <span className="text-sm font-medium text-theme-red-dark/60">
                Help us reach more people:
              </span>
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="text-theme-red transition-colors hover:text-theme-red-light"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <Image
        src="/assets/SaveSpotsLogo.png"
        alt="SaveSpots"
        width={1000}
        height={1000}
        className="mt-10 h-8 w-auto opacity-70"
        style={{ objectFit: "contain" }}
      />
    </main>
  );
}
