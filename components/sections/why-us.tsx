"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import { ConsistentButton } from "@/components/shared/consistent-button";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export function WhyUs() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const missionStatement =
    "To prevent overdose deaths and build safer communities. We use a data-driven approach to place life-saving Narcan and harm reduction supplies directly into the hands of the public, building a powerful network of access and education to end the opioid epidemic together.";

  return (
    <section
      id="expertise"
      className="relative overflow-hidden py-24 px-4 bg-theme-red"
    >
      <InfiniteGrid className="opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-theme-red-dark/60 to-transparent" />

      <AnimatedSection>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Why we exist
          </motion.span>

          <motion.h2
            className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-white"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            data-cursor="text"
          >
            Our Mission
          </motion.h2>

          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-medium text-balance"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            data-cursor="text"
          >
            {missionStatement}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <ConsistentButton
              variant="secondary"
              onClick={() => scrollToSection("contact")}
              aria-label="Scroll to our contact us section"
            >
              Get in touch
            </ConsistentButton>
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
}

