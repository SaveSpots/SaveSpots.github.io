"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import { CursorFollower } from "@/components/layout/cursor-follower";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { SmartNavigation } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AnimatedSection } from "@/components/shared/animated-section";

import { HeroSection } from "@/components/sections/hero-section";
import { MissionSection } from "@/components/sections/mission-section";
import { WhatWeMakeSection } from "@/components/sections/what-we-make";
import { ServicesSection } from "@/components/sections/services-section";
import { OurImpactSection } from "@/components/sections/impact-section";
import { TeamSection } from "@/components/sections/team-section";
import { ResearchDepartment } from "@/components/sections/research-department";
import { PartnersSection } from "@/components/sections/partners-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { SocialSection } from "@/components/sections/social-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const userAgent =
      typeof navigator === "undefined" ? "" : navigator.userAgent;
    const isMobileDevice =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);

    setIsMobile(isMobileDevice);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null; // 🟢 prevents server render with window

  return (
    <>
      {mounted && !isMobile && <CursorFollower />}
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-theme-red text-white">
        <SmartNavigation />
        <HeroSection isLoading={isLoading} />
        <OurImpactSection />
        <MissionSection />
        <WhatWeMakeSection />
        <ServicesSection />
        <TeamSection />
        <ResearchDepartment />
        <PartnersSection />
        <GallerySection />
        <SocialSection />
        <ContactSection />
        <AnimatedSection>
          <Footer />
        </AnimatedSection>
      </div>
    </>
  );
}
