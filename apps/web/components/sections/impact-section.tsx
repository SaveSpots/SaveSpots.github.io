"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import { stats } from "@/lib/site-data";

const ChicagoNarcanMap = dynamic(
  () => import("@/components/sections/chicago-narcan-map"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-cream-dark">
        <span className="text-sm font-medium text-theme-red-dark/50">
          Loading the map...
        </span>
      </div>
    ),
  }
);

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function OurImpactSection() {
  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-theme-red-dark px-4 py-28 md:py-32"
    >
      <InfiniteGrid className="opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          {...fadeInUp}
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Find a SaveSpot near you
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Every pin is a stocked SaveBox, placed where the data says access
              matters most. Tap one for hours and directions.
            </p>
          </div>

          {/* Stat chips */}
          <div className="flex gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur-sm"
                >
                  <Icon className="mb-2 text-lg text-white/60" />
                  <div className="font-display text-3xl font-extrabold leading-none text-white">
                    {s.metric}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/60">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Map panel */}
        <motion.div
          className="relative mt-12 h-[460px] overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/15 md:h-[580px]"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ChicagoNarcanMap />

          {/* Legend chip floating on the map */}
          <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-theme-red-dark shadow-lg backdrop-blur">
            <span className="relative grid place-items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-theme-red ring-2 ring-white" />
            </span>
            Active SaveSpot
          </div>
        </motion.div>
      </div>
    </section>
  );
}
