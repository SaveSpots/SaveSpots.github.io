"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/20 py-12 px-4 bg-theme-red-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div>
            <div
              className="flex items-center space-x-2 mb-8"
              data-cursor="button"
            >
              <Image
                src="./SaveSpotsLogo.png"
                alt="SaveSpots Logo"
                width={1000}
                height={1000}
                className="w-10 h-auto"
                style={{ objectFit: "contain" }}
              />
              <span className="text-xl font-bold text-white">SaveSpots</span>
            </div>
          </motion.div>

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

          <div>
            <h4
              className="text-lg font-semibold mb-4 text-white"
              data-cursor="text"
            >
              Links
            </h4>
            <div className="space-y-2">
              {[
                "Services",
                "Process",
                "FAQ",
                "Contact",
                "Terms & conditions",
                "Privacy policy",
              ].map((link, index) => (
                <motion.div key={index} whileHover={{ scale: 1.05, x: 5 }}>
                  <a
                    href="#"
                    className="text-white/90 hover:text-white transition-colors block font-medium"
                    data-cursor="button"
                  >
                    {link}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <p className="flex text-white/80 text-md font-medium justify-center">
            © 2025 SaveSpots - All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
