import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HeartHandshake, MapPin, Repeat } from "lucide-react";

import { DonateForm } from "@/components/donate/donate-form";
import {
  TAX_DEDUCTIBLE_NOTICE,
  UNRESTRICTED_NOTICE,
  org,
} from "@/lib/donate-config";

export const metadata: Metadata = {
  title: "Donate | SaveSpots",
  description:
    "Fund naloxone and fentanyl test strips in the neighborhoods that need them most. $25 stocks a SaveKit, $150 places a SaveBox. SaveSpots is a 501(c)(3) nonprofit — your gift is tax-deductible.",
  alternates: { canonical: "https://savespots.org/donate" },
  openGraph: {
    title: "Donate to SaveSpots",
    description:
      "Every SaveBox puts overdose reversal within reach. Fund the next one.",
    url: "https://savespots.org/donate",
  },
};

const reasons = [
  {
    icon: MapPin,
    title: "Where people already are",
    body: "SaveBoxes go where people live their lives: gas stations, corner stores, barber shops and more.",
  },
  {
    icon: Repeat,
    title: "Stocked, not just placed",
    body: "SaveBoxes only save lives if they're full. Donations fund the restock cycle, not just the install.",
  },
  {
    icon: HeartHandshake,
    title: "Volunteer-run",
    body: "Our team is unpaid. Your gift buys supplies and logistics, not salaries.",
  },
];

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-theme-red">
      {/* Deliberately minimal chrome: the site nav is a set of scroll links to
          the homepage, and every one of them is a way to abandon a half-filled
          donation form. One clear way back is enough. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SaveSpots
        </Link>
        <Image
          src="/assets/SaveSpotsLogo.png"
          alt="SaveSpots"
          width={1000}
          height={1000}
          className="h-9 w-auto"
          style={{ objectFit: "contain" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pt-12">
        {/* Flex on mobile, grid on desktop, so `order` can put the amount
            picker directly under the headline on a phone. Donors who arrive
            ready to give should not have to scroll past three arguments to
            find the buttons; the arguments move below the fold instead. */}
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
          {/* The ask */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Donate
            </p>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              An overdose is reversible. Only if the naloxone is close enough.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/85 md:text-xl">
              SaveSpots places free naloxone and fentanyl test strips in our
              cities, then keeps them stocked. Your gift funds the supplies, the
              boxes, restocks, and logistical costs associated with our
              research-driven mission.
            </p>

          </div>

          {/* Why give — below the form on mobile, beside it on desktop. */}
          <div className="order-3 space-y-6 lg:col-start-1 lg:row-start-2 lg:mt-4">
            {reasons.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    {title}
                  </h2>
                  <p className="mt-1 max-w-md text-base font-medium leading-relaxed text-white/75">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The form */}
          <div className="order-2 lg:sticky lg:top-8 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <DonateForm />

            <div className="mt-6 space-y-3 text-sm font-medium leading-relaxed text-white/70">
              <p>{TAX_DEDUCTIBLE_NOTICE}</p>
              <p>{UNRESTRICTED_NOTICE}</p>
              <p>
                Prefer to give another way, or donate in kind?{" "}
                <a
                  href={`mailto:${org.email}`}
                  className="font-semibold text-white underline underline-offset-2"
                >
                  Email us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
