"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";
import { ConsistentButton } from "@/components/shared/consistent-button";
import { DynamicBackground } from "@/components/layout/dynamic-background";

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
            Stop Hiring "AI Professionals".
          </motion.h2>
          <motion.p
            className="text-xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-medium"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            data-cursor="text"
          >
            The market is flooded with inexperienced AI hype. We are a
            senior-level development firm that builds robust, enterprise-grade
            AI systems to automate your operations, increase your revenue, and
            secure your market share.
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
