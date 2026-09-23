"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  MAX_GIFT_USD,
  MIN_GIFT_USD,
  giftTiers,
  org,
} from "@/lib/donate-config";

type Selection = { kind: "tier"; amount: number } | { kind: "custom" };
type Frequency = "once" | "monthly";

const defaultTier = giftTiers.find((tier) => tier.featured) ?? giftTiers[0];

export function DonateForm() {
  const [selection, setSelection] = useState<Selection>({
    kind: "tier",
    amount: defaultTier.amount,
  });
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = useMemo(() => {
    if (selection.kind === "tier") return selection.amount;
    const parsed = Number.parseFloat(customAmount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [selection, customAmount]);

  const activeImpact =
    selection.kind === "tier"
      ? giftTiers.find((tier) => tier.amount === selection.amount)?.impact
      : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (amount < MIN_GIFT_USD || amount > MAX_GIFT_USD) {
      setError(
        `Enter an amount between $${MIN_GIFT_USD} and $${MAX_GIFT_USD.toLocaleString()}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, frequency, name, email }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Square's hosted checkout takes over from here. The spinner stays up
      // through the redirect so the button cannot be pressed twice.
      window.location.href = data.url;
    } catch {
      setError("We could not reach the payment page. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 md:p-8 shadow-xl shadow-theme-red-dark/20 ring-1 ring-theme-red-dark/5"
    >
      <fieldset disabled={isSubmitting} className="space-y-6">
        <legend className="sr-only">Choose your donation amount</legend>

        {/* Monthly first in the DOM but not preselected: recurring donors are
            worth several times a one-time donor, so the option has to be
            visible before the amount is chosen — but defaulting to a
            recurring charge nobody asked for is a chargeback waiting to
            happen. */}
        <div
          role="radiogroup"
          aria-label="Giving frequency"
          className="flex rounded-full bg-cream p-1"
        >
          {(
            [
              { value: "once", label: "One-time" },
              { value: "monthly", label: "Monthly" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={frequency === value}
              onClick={() => setFrequency(value)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                frequency === value
                  ? "bg-theme-red text-white"
                  : "text-theme-red-dark/70 hover:text-theme-red-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-red/70">
            Choose an amount
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {giftTiers.map((tier) => {
              const isActive =
                selection.kind === "tier" && selection.amount === tier.amount;
              return (
                <motion.button
                  key={tier.amount}
                  type="button"
                  onClick={() => setSelection({ kind: "tier", amount: tier.amount })}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-full px-4 py-4 text-lg font-bold transition-colors ${
                    isActive
                      ? "bg-theme-red text-white"
                      : "bg-cream text-theme-red-dark hover:bg-cream-dark"
                  }`}
                >
                  ${tier.amount}
                  {frequency === "monthly" && (
                    <span className="text-sm font-semibold opacity-70">/mo</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-3">
            <label htmlFor="custom-amount" className="sr-only">
              Other amount in US dollars
            </label>
            <div
              className={`flex items-center rounded-xl border px-4 transition-colors ${
                selection.kind === "custom"
                  ? "border-theme-red bg-white"
                  : "border-theme-red-dark/15 bg-cream"
              }`}
            >
              <span className="text-lg font-bold text-theme-red-dark/60">$</span>
              <input
                id="custom-amount"
                name="custom-amount"
                type="number"
                inputMode="decimal"
                min={MIN_GIFT_USD}
                max={MAX_GIFT_USD}
                step="0.01"
                placeholder="Other amount"
                value={customAmount}
                onFocus={() => setSelection({ kind: "custom" })}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setSelection({ kind: "custom" });
                }}
                className="w-full bg-transparent px-2 py-4 text-lg font-semibold text-theme-red-dark outline-none placeholder:font-medium placeholder:text-theme-red-dark/40"
              />
            </div>
          </div>

          {activeImpact && (
            <p className="mt-3 text-sm font-medium text-theme-red-dark/70">
              {activeImpact}.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="donor-name"
              className="mb-1.5 block text-sm font-semibold text-theme-red-dark"
            >
              Name <span className="font-medium text-theme-red-dark/50">(optional)</span>
            </label>
            <input
              id="donor-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-theme-red-dark/15 bg-cream px-4 py-3 font-medium text-theme-red-dark outline-none transition-colors focus:border-theme-red focus:bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="donor-email"
              className="mb-1.5 block text-sm font-semibold text-theme-red-dark"
            >
              Email <span className="font-medium text-theme-red-dark/50">(for your receipt)</span>
            </label>
            <input
              id="donor-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-theme-red-dark/15 bg-cream px-4 py-3 font-medium text-theme-red-dark outline-none transition-colors focus:border-theme-red focus:bg-white"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-theme-red">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          whileHover={isSubmitting ? undefined : { scale: 1.03 }}
          whileTap={isSubmitting ? undefined : { scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-theme-red px-8 py-4 text-lg font-bold text-white shadow-lg shadow-theme-red/30 transition-colors hover:bg-theme-red-light disabled:cursor-not-allowed disabled:opacity-70 md:text-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Opening secure checkout…
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Donate {amount > 0 ? `$${amount.toLocaleString()}` : ""}
              {frequency === "monthly" ? " monthly" : ""}
            </>
          )}
        </motion.button>

        {frequency === "monthly" && (
          <p className="rounded-xl bg-cream px-4 py-3 text-xs font-medium leading-relaxed text-theme-red-dark/70">
            You will be charged ${amount > 0 ? amount.toLocaleString() : "0"} today
            and on the same day each month. Cancel any time by emailing{" "}
            <a
              href={`mailto:${org.email}`}
              className="font-semibold underline underline-offset-2"
            >
              {org.email}
            </a>
            .
          </p>
        )}

        <p className="flex items-start gap-2 text-xs font-medium leading-relaxed text-theme-red-dark/60">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Payment is processed securely by Square. SaveSpots never sees or
            stores your card details. Questions? Email{" "}
            <a
              href={`mailto:${org.email}`}
              className="font-semibold underline underline-offset-2"
            >
              {org.email}
            </a>
            .
          </span>
        </p>
      </fieldset>
    </form>
  );
}
