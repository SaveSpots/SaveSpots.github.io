"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "impact", label: "Impact" },
    { id: "expertise", label: "Expertise" },
    { id: "services", label: "Services" },
    { id: "gallery", label: "Photos" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <footer className="border-t border-white/20 py-12 px-4 bg-theme-red-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo */}
          <motion.div>
            <div
              className="flex items-center space-x-2 mb-8"
              data-cursor="button"
            >
              <Image
                src="./assets/SaveSpotsLogo.png"
                alt="SaveSpots Logo"
                width={1000}
                height={1000}
                className="w-10 h-auto"
                style={{ objectFit: "contain" }}
              />
              <span className="text-xl font-bold text-white">SaveSpots</span>
            </div>
          </motion.div>

          {/* Socials */}
          <div>
            <h4
              className="text-lg font-semibold mb-4 text-white"
              data-cursor="text"
            >
              Socials
            </h4>
            <motion.a
              href="#"
              className="text-white/90 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              data-cursor="button"
            >
              Instagram
            </motion.a>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-lg font-semibold mb-4 text-white"
              data-cursor="text"
            >
              Links
            </h4>
            <div className="space-y-2">
              {navItems.map(({ id, label }) => (
                <motion.button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="text-left text-white/90 hover:text-white transition-colors block font-medium"
                  data-cursor="button"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <p className="flex text-white/80 text-md font-medium justify-center">
            &copy; {new Date().getFullYear()} SaveSpots — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
