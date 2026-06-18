"use client";

import { motion } from "framer-motion";
import { partners } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function PartnersSection() {
  return (
    <section
      id="partners"
      className="relative overflow-hidden bg-cream-dark px-4 py-28 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-theme-red-dark md:text-6xl">
            We do not do this alone
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-theme-red-dark/70">
            Public health agencies and naloxone programs supply, guide, and
            ground our work. Here is how each partnership fits in.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {partners.map((partner, i) => (
            <motion.article
              key={partner.name}
              className="flex gap-6 rounded-3xl bg-white p-7 shadow-lg shadow-theme-red-dark/10 ring-1 ring-theme-red-dark/5"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cream p-3 ring-1 ring-theme-red-dark/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold text-theme-red-dark">
                  {partner.name}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                  {partner.blurb}
                </p>
                {partner.url && (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-theme-red hover:underline"
                  >
                    Learn more
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
