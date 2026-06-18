"use client";

import { motion } from "framer-motion";
import { FaArrowRightLong } from "react-icons/fa6";
import { socials } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

export function SocialSection() {
  return (
    <section
      id="social"
      className="relative overflow-hidden bg-cream px-4 py-28 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-theme-red-dark md:text-6xl">
            Follow the work
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-theme-red-dark/70">
            We share placements, milestones, and what we are learning as we go.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {socials.map((social, i) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 rounded-3xl bg-theme-red p-8 text-white shadow-xl shadow-theme-red-dark/15 transition-transform duration-300 hover:-translate-y-1"
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                    <Icon />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold">
                      {social.name}
                    </p>
                    <p className="text-sm text-white/75">{social.handle}</p>
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-theme-red">
                  <FaArrowRightLong />
                </span>
              </motion.a>
            );
          })}
        </div>

        {/* Hook for a live post feed once handles are confirmed.
            Embed Instagram/LinkedIn widgets or a Curator.io / EmbedSocial feed here. */}
      </div>
    </section>
  );
}
