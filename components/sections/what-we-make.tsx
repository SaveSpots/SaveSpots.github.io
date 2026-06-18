"use client";

import { motion } from "framer-motion";
import { FaArrowRightLong } from "react-icons/fa6";
import { SmartImage } from "@/components/shared/smart-image";
import { whatWeMake } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

export function WhatWeMakeSection() {
  return (
    <section
      id="what-we-make"
      className="relative overflow-hidden bg-cream px-4 py-28 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-theme-red-dark md:text-6xl">
            One kit. A box. A whole block covered.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-theme-red-dark/70">
            Everything we do nests together. A SaveKit fits in a pocket. SaveKits
            fill a SaveBox. A SaveBox turns a local business into a SaveSpot.
          </p>
        </motion.div>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {whatWeMake.map((layer, i) => (
            <div key={layer.id} className="relative">
              <motion.div
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-theme-red-dark/10 ring-1 ring-theme-red-dark/5"
                {...fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <SmartImage
                  src={layer.image}
                  alt={layer.imageAlt}
                  fallbackLabel={`${layer.name} photo`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-red text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-theme-red-dark">
                      {layer.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-theme-red/70">
                    {layer.short}
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                    {layer.description}
                  </p>
                </div>
              </motion.div>

              {/* Connector arrow between cards (desktop only) */}
              {i < whatWeMake.length - 1 && (
                <div className="pointer-events-none absolute -right-5 top-1/3 z-10 hidden lg:block">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-red text-white shadow-lg">
                    <FaArrowRightLong />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
