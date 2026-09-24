"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { socials } from "@/lib/site-data";
import { TAX_DEDUCTIBLE_NOTICE, org } from "@/lib/donate-config";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "mission", label: "Mission" },
    { id: "services", label: "Process" },
    { id: "team", label: "Team" },
    { id: "partners", label: "Partners" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <footer className="border-t border-white/20 py-12 px-4 bg-theme-red-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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

          {/* Contact — plain, visible, copyable text rather than a "Contact us"
              label. Someone who wants to reach a nonprofit should not have to
              go through a form to find out how. */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white" data-cursor="text">
              Contact
            </h4>
            <motion.a
              href={`mailto:${org.email}`}
              className="inline-block text-white/90 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05, x: 4 }}
              data-cursor="button"
            >
              {org.email}
            </motion.a>
          </div>

          {/* Socials */}
          <div>
            <h4
              className="text-lg font-semibold mb-4 text-white"
              data-cursor="text"
            >
              Socials
            </h4>
            <div className="flex flex-col space-y-2">
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium"
                  whileHover={{ scale: 1.05, x: 4 }}
                  data-cursor="button"
                >
                  <social.icon />
                  {social.name}
                </motion.a>
              ))}
            </div>
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
              {/* Real routes, not scroll targets — scrollToSection would be a
                  no-op for these, so they stay plain anchors. */}
              <motion.a
                href="/donate"
                whileHover={{ scale: 1.05, x: 5 }}
                className="text-left text-white hover:text-white transition-colors block font-semibold"
                data-cursor="button"
              >
                Donate
              </motion.a>
              <motion.a
                href="/portal"
                whileHover={{ scale: 1.05, x: 5 }}
                className="text-left text-white/90 hover:text-white transition-colors block font-medium"
                data-cursor="button"
              >
                Volunteer Portal
              </motion.a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <p className="flex text-white/80 text-md font-medium justify-center">
            &copy; {new Date().getFullYear()} SaveSpots — All rights reserved.
          </p>
          {/* Sitewide tax-status disclosure: donors look for the EIN before
              giving, and it belongs on every page, not just /donate. */}
          <p className="mt-3 text-center text-sm font-medium text-white/60">
            {TAX_DEDUCTIBLE_NOTICE}
          </p>
        </div>
      </div>
    </footer>
  );
}
