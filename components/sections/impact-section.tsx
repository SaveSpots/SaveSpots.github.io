"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { DynamicBackground } from "@/components/layout/dynamic-background";
import dynamic from "next/dynamic";

const ChicagoNarcanMap = dynamic(
  () => import("@/components/sections/chicago-narcan-map"),
  { ssr: false }
);

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// ✅ The list, just like your `services`
const impactStats = [
  {
    metric: "2025",
    title: "Founded",
  },
  {
    metric: "1000",
    title: "Savespots",
  },
  {
    metric: "5000",
    title: "Narcan distributed",
  },
  {
    metric: "3",
    title: "Events Held",
  },
];

export function OurImpactSection() {
  return (
    <section id="impact" className="py-20 px-4 bg-theme-red-light">
      <AnimatedSection>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Our Impact
            </h2>
            <p className="text-lg text-white/90 mt-4 max-w-3xl mx-auto">
              We’re empowering communities with accessible life-saving resources
              and a network of students dedicated to ending overdose deaths.
            </p>
          </motion.div>

          {/* Stats + Map */}
          <div className="flex flex-col md:flex-row md:items-center gap-12">
            {/* Stats from list */}
            <motion.div
              className="flex flex-col justify-center w-full md:w-1/2"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-lg">
                {impactStats.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-extrabold text-theme-red">
                      {item.metric}
                    </div>
                    <div className="text-theme-red-dark mt-2 font-medium">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              className="w-full md:w-1/2"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <ChicagoNarcanMap />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
