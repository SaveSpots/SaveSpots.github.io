"use client";

import { motion } from "framer-motion";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import { ConsistentButton } from "@/components/shared/consistent-button";
import { mission, cta } from "@/lib/site-data";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
};

export function MissionSection() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden bg-theme-red px-4 py-28 md:py-36"
    >
      <InfiniteGrid className="opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-theme-red-dark/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.span
          className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
          {...fadeInUp}
        >
          {mission.eyebrow}
        </motion.span>

        <motion.h2
          className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Put help where people already are.
        </motion.h2>

        <motion.p
          className="mx-auto mt-8 max-w-3xl text-balance text-xl font-medium leading-relaxed text-white/90 md:text-2xl"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {mission.statement}
        </motion.p>
      </div>

      {/* The model: a single focused explainer, not a card row */}
      <div className="relative z-10 mx-auto mt-16 max-w-5xl">
        <motion.div
          className="grid gap-px overflow-hidden rounded-3xl border border-white/15 bg-white/10 sm:grid-cols-3"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {[
            {
              k: "Data-driven",
              v: "We place supplies using public overdose and access data, not guesswork.",
            },
            {
              k: "Community-centered",
              v: "Local business owners host supplies in the places people pass daily.",
            },
            {
              k: "Supplementary",
              v: "We widen access alongside direct outreach, never replacing it.",
            },
          ].map((item) => (
            <div key={item.k} className="bg-theme-red/40 p-7 backdrop-blur-sm">
              <h3 className="font-display text-lg font-bold text-white">
                {item.k}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {item.v}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="mx-auto mt-10 max-w-3xl text-center text-base leading-relaxed text-white/70"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {mission.model}
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Link href={cta.host.href} target="_blank">
            <ConsistentButton variant="secondary">
              {cta.host.label}
            </ConsistentButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
