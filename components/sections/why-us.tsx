"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { ConsistentButton } from "@/components/shared/consistent-button";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Variants for the typewriter animation container
const sentenceVariant = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.005, // Adjusts the speed of typing
    },
  },
};

// Variants for each individual letter
const letterVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function WhyUs() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const missionStatement =
    "To prevent overdose deaths and build safer communities. We use a data-driven approach to place life-saving Narcan and harm reduction supplies directly into the hands of the public, building a powerful network of access and education to end the opioid epidemic together.";

  return (
    <section id="expertise" className="py-20 px-4 bg-theme-red">
      <AnimatedSection>
        <div className="max-w-6xl mx-auto text-center">
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
          
          {/* Updated Mission Statement with Typewriter Effect */}
          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-medium"
            variants={sentenceVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            data-cursor="text"
          >
            {missionStatement.split("").map((char, index) => (
              <motion.span key={index} variants={letterVariant}>
                {char}
              </motion.span>
            ))}
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

