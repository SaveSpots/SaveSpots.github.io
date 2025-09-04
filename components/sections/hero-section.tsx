"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { DynamicBackground } from "@/components/layout/dynamic-background";
import { HeaderTransition } from "@/components/layout/header-transition";
import { ConsistentButton } from "@/components/shared/consistent-button";
import { InfiniteLogoCarousel } from "@/components/shared/infinite-logo-carousel";
import Link from "next/link";

interface HeroSectionProps {
  isLoading: boolean;
}

export function HeroSection({ isLoading }: HeroSectionProps) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-dvh flex flex-col justify-center relative overflow-hidden w-full px-4"
    >
      <DynamicBackground />

      <motion.div
        className="text-center z-10 max-w-4xl w-full mx-auto"
        style={{ y: heroY }}
      >
        <motion.h1
          className="text-3xl sm:text-5xl md:text-8xl font-extrabold mb-4 tracking-tight text-white break-words whitespace-normal max-w-full w-full"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: isLoading ? 3.5 : 0,
          }}
          data-cursor="text"
        >
          SaveSpots
        </motion.h1>
        <motion.p
          className="text-xs sm:text-sm md:text-xl text-white/90 mb-8 max-w-full sm:max-w-3xl mx-auto break-words whitespace-normal"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: isLoading ? 3.8 : 0.3,
            ease: "easeOut",
          }}
          data-cursor="text"
        >
          Reversing Overdose — One SaveBox at a Time
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: isLoading ? 4.1 : 0.6,
            ease: "easeOut",
          }}
        >
            <Link href="https://savespots.fillout.com/volunteer" target="_blank">
            <ConsistentButton
              variant="primary"
              aria-label="Join our research team"
            >
              Join Our Research Team
            </ConsistentButton>
            </Link>

          <Link href="https://savespots.fillout.com/savebox" target="_blank">
            <ConsistentButton variant="secondary">
              Host a SaveBox at Your Location
            </ConsistentButton>
          </Link>
        </motion.div>

        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: isLoading ? 4.4 : 0.9 }}
        >
          <p className="text-white/80 mb-4 font-medium" data-cursor="text">
            Official Partners in Our Lifesaving Mission
          </p>
          <InfiniteLogoCarousel />
        </motion.div>

        <motion.div
          className="flex justify-center mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: isLoading ? 4.3 : 0.8,
            ease: "easeOut",
          }}
        >
          <ConsistentButton
            variant="cta"
            onClick={() => scrollToSection("impact")}
            aria-label="Scroll to Our Impact section"
          >
            See Our Impact
          </ConsistentButton>
        </motion.div>
      </motion.div>
      <HeaderTransition />
    </section>
  );
}
