"use client";

import { motion } from "framer-motion";
import { ClipboardList, MapPin, SprayCan, TestTube } from "lucide-react";

/**
 * Explains the SaveKit -> SaveBox -> SaveSpot chain.
 *
 * WHY THIS IS ON THE DONATION PAGE: the tiers are $25 / $150 / $500, and
 * without this a donor has no way to know that $150 is six times $25 because a
 * SaveBox holds six SaveKits. The numbers look arbitrary until the physical
 * thing is shown. This section is what makes the price ladder legible.
 *
 * The dollar tags are the join: each rung of the chain carries the tier that
 * funds it, so the diagram and the form are reading off the same ladder.
 */

const kitContents = [
  { icon: SprayCan, label: "Naloxone nasal spray" },
  { icon: TestTube, label: "Fentanyl test strip" },
  { icon: ClipboardList, label: "Bystander instruction card" },
];

/** Six, because that is what a SaveBox holds — not a decorative count. */
const KITS_PER_BOX = 6;

export function DonationAnatomy() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      aria-labelledby="anatomy-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        What your gift buys
      </p>
      <h2
        id="anatomy-heading"
        className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl"
      >
        A kit, a box, a corner of the city.
      </h2>

      <div className="mt-7 space-y-0">
        {/* Rung 1 — the SaveKit */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-white">
              1 SaveKit
            </h3>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-theme-red">
              $25
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/70">
            Everything one bystander needs to reverse one overdose.
          </p>
          <ul className="mt-4 space-y-2.5">
            {kitContents.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm font-semibold text-white/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Connector />

        {/* Rung 2 — the SaveBox. Six kits drawn, not described, so the
            multiplication from $25 to $150 is visible rather than asserted. */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-white">
              1 SaveBox
            </h3>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-theme-red">
              $150
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/70">
            Six SaveKits in one box. This is the unit we actually install.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">
            {Array.from({ length: KITS_PER_BOX }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
                className="flex items-center justify-center rounded-xl bg-white/10 py-3"
              >
                <SprayCan className="h-4 w-4 text-white/80" />
              </motion.div>
            ))}
          </div>
          <p className="sr-only">A SaveBox contains six SaveKits.</p>
        </div>

        <Connector />

        {/* Rung 3 — the SaveSpot, and the reason $500 exists. */}
        <div className="rounded-3xl border border-white/15 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-white">
              1 SaveSpot
            </h3>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-theme-red">
              $500
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/70">
            The SaveBox goes up on a wall a neighborhood already walks past, and
            we keep it filled. $500 covers one spot for three months.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
            <MapPin className="h-5 w-5 shrink-0 text-white" />
            <span className="text-sm font-semibold text-white/90">
              Gas stations, corner stores, barber shops
            </span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs font-medium leading-relaxed text-white/50">
        A box is only as good as its last restock — which is why the money keeps
        mattering after the install.
      </p>
    </motion.section>
  );
}

/** The vertical line that makes the three cards read as one chain. */
function Connector() {
  return (
    <div className="flex h-7 items-center justify-center" aria-hidden="true">
      <span className="h-full w-px bg-gradient-to-b from-white/10 via-white/35 to-white/10" />
    </div>
  );
}
