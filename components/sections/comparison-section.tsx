"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/shared/animated-section";
import { DynamicBackground } from "@/components/layout/dynamic-background";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function ComparisonSection() {
  const typicalPoints = [
    "Promises the world with little experience.",
    "Uses only basic tools like ChatGPT wrappers & off-the-shelf templates.",
    "Learns on your project time — costing you more.",
    "Delivers unscalable, fragile gimmicks.",
    "Disappears when the work gets complex.",
  ];

  const ourPoints = [
    "Defines a clear, deliverable scope with proven architecture.",
    "Builds custom, secure, full-stack systems that scale.",
    "Brings years of real-world experience from NASA, Uber, Klarna & more.",
    "Engineers robust solutions that transform your operations.",
    "Delivers end-to-end — from strategy to support.",
  ];

  return (
    <AnimatedSection className="py-20 px-4 bg-theme-red-light">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-16 text-center tracking-tight text-white"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          data-cursor="text"
        >
          Senior-Level Problems Require <br /> Senior-Level Talent.
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInLeft}>
            <Card
              className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
              data-cursor="view"
            >
              <CardContent className="p-8">
                <h3
                  className="text-2xl font-semibold mb-8 text-center text-white"
                  data-cursor="text"
                >
                  The “Typical AI Professional”
                </h3>
                <ul className="space-y-5">
                  {typicalPoints.map((point, i) => (
                    <motion.li
                      key={point}
                      className="flex gap-3 items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="mt-2 w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
                      <span className="text-white/90 leading-relaxed">
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInRight}>
            <Card
              className="bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300"
              data-cursor="view"
            >
              <CardContent className="p-8">
                <h3
                  className="text-2xl font-semibold mb-8 text-center text-white"
                  data-cursor="text"
                >
                  Our Proven Architectural Approach
                </h3>
                <ul className="space-y-5">
                  {ourPoints.map((point, i) => (
                    <motion.li
                      key={point}
                      className="flex gap-3 items-start"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="mt-2 w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
                      <span className="text-white/90 leading-relaxed">
                        {point}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
