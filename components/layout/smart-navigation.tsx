"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

export function SmartNavigation() {
  const [activeSection, setActiveSection] = useState("hero");
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sections = ["hero", "services", "process", "location", "contact"];
    const observers = sections.map((section) => {
      const element = document.getElementById(section);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "services", label: "Services" },
    { id: "process", label: "Process" },
    { id: "location", label: "Locations" },
    { id: "contact", label: "Contact" },
  ];

  const navLinks = (
    <>
      {navItems.map(({ id, label }) => (
        <motion.button
          key={id}
          onClick={() => scrollToSection(id)}
          className={`text-sm font-medium transition-colors relative ${
            activeSection === id
              ? "text-theme-red"
              : "text-gray-600 hover:text-theme-red"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {label}
          {activeSection === id && (
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-theme-red"
              layoutId="activeIndicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </>
  );

  return (
    <motion.nav
      className="fixed top-5 transform -translate-x-1/2 z-40 bg-white backdrop-blur-md border border-theme-red/50 rounded-full px-6 py-3 w-[calc(100%-2rem)] md:w-auto"
      style={{
        left: window.innerWidth < 768 ? "5%" : "30%",
        right: window.innerWidth < 768 ? "5%" : "30%",
        opacity: navOpacity,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between md:justify-center space-x-4 md:space-x-8">
        <motion.div className="flex items-center space-x-2">
          <Image
            src="./assets/SaveSpotsLogo.png"
            alt="SaveSpots Logo"
            width={1000}
            height={1000}
            className="w-10 h-auto"
            style={{ objectFit: "contain" }}
          />
          <span className="text-lg font-semibold text-black">SaveSpots</span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-6">{navLinks}</div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-theme-red">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white p-6 w-64 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Image
                    src="./assets/SaveSpotsLogo.png"
                    alt="SaveSpots Logo"
                    width={1000}
                    height={1000}
                    className="w-10 h-auto"
                    style={{ objectFit: "contain" }}
                  />
                  <span className="text-xl font-bold text-black">
                    SaveSpots
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-gray-600" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {navItems.map(({ id, label }) => (
                  <Button
                    key={id}
                    variant="ghost"
                    className={`justify-start text-lg font-medium ${
                      activeSection === id
                        ? "text-theme-red"
                        : "text-gray-700 hover:text-theme-red"
                    }`}
                    onClick={() => scrollToSection(id)}
                  >
                    {label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
