"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import dynamic from "next/dynamic";
import { FaMapMarkerAlt, FaBuilding } from "react-icons/fa";

const ChicagoNarcanMap = dynamic(
  () => import("@/components/sections/chicago-narcan-map"),
  { ssr: false }
);

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const impactStats = [
  {
    metric: "2025",
    title: "Founded",
    icon: FaBuilding,
  },
  {
    metric: "21",
    title: "Savespots",
    icon: FaMapMarkerAlt,
  },
  // {
  //   metric: "5,000",
  //   title: "Narcan Distributed",
  //   icon: "FaHeart",
  // },
  // {
  //   metric: "3",
  //   title: "Events Held",
  //   icon: "FaCalendarAlt",
  // },
];

export function OurImpactSection() {
  return (
    <section
      id="impact"
      className="relative overflow-hidden py-24 px-4 bg-theme-red-light"
    >
      <InfiniteGrid className="opacity-40" />

      <AnimatedSection>
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="font-display text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Our Impact, Visualized
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mt-6 max-w-3xl mx-auto text-balance">
              We’re empowering communities with accessible life-saving resources
              and a network of students dedicated to ending overdose deaths.
            </p>
          </motion.div>

          {/* Stats + Map Layout */}
          <div className="grid gap-6 md:grid-cols-5">
            {/* Stats Section */}
            <motion.div
              className="flex flex-col gap-6 md:col-span-2"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {impactStats.map((item, index) => (
                <div
                  key={index}
                  className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-theme-red to-theme-red-light" />
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-red/10">
                    <item.icon className="text-theme-red text-2xl" />
                  </div>
                  <div className="text-6xl font-extrabold tracking-tight text-theme-red">
                    {item.metric}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-theme-red-dark">
                    {item.title}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Map Section */}
            <motion.div
              className="flex flex-col rounded-2xl bg-white p-4 shadow-xl shadow-black/10 md:col-span-3"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="mb-3 px-2 pt-2 text-center text-lg font-semibold text-theme-red-dark">
                The locations of our current SaveSpots 📍
              </p>
              <ChicagoNarcanMap />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}