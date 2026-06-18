"use client";

import { motion } from "framer-motion";
import { FaLinkedin, FaLocationDot } from "react-icons/fa6";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import { SmartImage, initialsFromName } from "@/components/shared/smart-image";
import { researchers } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function ResearchDepartment() {
  return (
    <section
      id="research"
      className="relative overflow-hidden bg-theme-red-dark px-4 py-28 md:py-32"
    >
      <InfiniteGrid className="opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Research, one city at a time
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            Every researcher owns a city and studies the harm reduction strategy
            that fits it. Their findings shape where the next SaveSpots go.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {researchers.map((r, i) => (
            <motion.article
              key={r.name + i}
              className="flex flex-col rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div className="flex items-center gap-4">
                <SmartImage
                  src={r.image}
                  alt={r.name}
                  initials={initialsFromName(r.name)}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold text-white">
                    {r.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-white/70">
                    <FaLocationDot className="text-xs text-white/50" />
                    <span className="truncate">{r.city}</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/65">
                {r.bio}
              </p>
              {r.linkedin && (
                <a
                  href={r.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${r.name} on LinkedIn`}
                  className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-theme-red"
                >
                  <FaLinkedin />
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
