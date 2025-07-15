"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import dynamic from "next/dynamic";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const ChicagoNarcanMap = dynamic(
  () => import("@/components/sections/chicago-narcan-map"),
  { ssr: false }
);


export function LocationMapSection() {
  return (
    <section id="location" className="py-20 px-4 bg-theme-red-light">
      <AnimatedSection>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-8 text-center tracking-tight text-white"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            data-cursor="text"
          >
            Global Network
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-16 text-center max-w-3xl mx-auto font-medium"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            data-cursor="text"
          >
            Our AI solutions power businesses across the globe, with real-time
            operations in major tech hubs worldwide.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <ChicagoNarcanMap />
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
}
