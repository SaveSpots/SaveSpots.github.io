"use client";

import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";
import { SmartImage, initialsFromName } from "@/components/shared/smart-image";
import { team } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function TeamSection() {
  return (
    <section
      id="team"
      className="relative overflow-hidden bg-cream px-4 py-28 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-theme-red-dark md:text-6xl">
            The people behind SaveSpots
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-theme-red-dark/70">
            A student-led team building a new layer of harm reduction, block by
            block.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {team.map((person, i) => (
            <motion.article
              key={person.name + i}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-theme-red-dark/10 ring-1 ring-theme-red-dark/5 transition-transform duration-300 hover:-translate-y-1"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <SmartImage
                src={person.image}
                alt={person.name}
                initials={initialsFromName(person.name)}
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-bold text-theme-red-dark">
                  {person.name}
                </h3>
                <p className="mt-0.5 text-sm font-semibold text-theme-red">
                  {person.role}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                  {person.bio}
                </p>
                {person.linkedin && (
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${person.name} on LinkedIn`}
                    className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-theme-red/10 text-theme-red transition-colors hover:bg-theme-red hover:text-white"
                  >
                    <FaLinkedin />
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
