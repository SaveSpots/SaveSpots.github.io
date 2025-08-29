"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { DynamicBackground } from "@/components/layout/dynamic-background";
import dynamic from "next/dynamic";
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaBuilding } from "react-icons/fa";

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
    icon: <FaBuilding className="text-theme-red text-3xl" />,
  },
  {
    metric: "2",
    title: "Savespots",
    icon: <FaMapMarkerAlt className="text-theme-red text-3xl" />,
  },
  // {
  //   metric: "5,000",
  //   title: "Narcan Distributed",
  //   icon: <FaHeart className="text-theme-red text-3xl" />,
  // },
  // {
  //   metric: "3",
  //   title: "Events Held",
  //   icon: <FaCalendarAlt className="text-theme-red text-3xl" />,
  // },
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
            <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Our Impact, Visualized
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mt-6 max-w-3xl mx-auto">
              We’re empowering communities with accessible life-saving resources
              and a network of students dedicated to ending overdose deaths.
            </p>
          </motion.div>

          {/* Stats + Map Layout */}
          <div className="flex flex-col md:flex-row gap-12">
            {/* Stats Section */}
            <motion.div
              className="flex flex-col gap-8 w-full md:w-1/2"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {impactStats.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center"
                >
                  <div className="mb-4">{item.icon}</div>
                  <div className="text-5xl font-extrabold text-theme-red">
                    {item.metric}
                  </div>
                  <div className="text-lg text-theme-red-dark mt-2 font-medium">
                    {item.title}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Map Section */}
            <motion.div
              className="w-full md:w-1/2 bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl text-theme-red-dark mb-6 text-center font-semibold">
                The Locations of Our Current SaveSpots 👇
              </p>
              <ChicagoNarcanMap />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}