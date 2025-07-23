"use client";

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"

import { CursorFollower } from "@/components/layout/cursor-follower"
import { LoadingScreen } from "@/components/layout/loading-screen"
import { SmartNavigation } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AnimatedSection } from "@/components/shared/animated-section"

import { HeroSection } from "@/components/sections/hero-section"
import { WhyUs } from "@/components/sections/why-us"
import { ComparisonSection } from "@/components/sections/comparison-section"
import { ServicesSection } from "@/components/sections/services-section"
import { ProcessSection } from "@/components/sections/process-section"
import { OurImpactSection } from "@/components/sections/impact-section";
import { ContactSection } from "@/components/sections/contact-section"


export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null; // 🟢 prevents server render with window

  return (
    <>
      {!isMobile && <CursorFollower />}
      {/* <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence> */}

      <div className="min-h-screen bg-theme-red text-white">
        <SmartNavigation />
        <HeroSection isLoading={isLoading} />
        <OurImpactSection />
        <WhyUs />
        <ComparisonSection />
        <ServicesSection />
        <ProcessSection />
        <ContactSection />
        <AnimatedSection>
          <Footer />
        </AnimatedSection>
      </div>
    </>
  );
}

