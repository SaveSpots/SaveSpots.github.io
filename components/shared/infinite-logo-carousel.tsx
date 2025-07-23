"use client";

import { motion } from "framer-motion";

export function InfiniteLogoCarousel() {
  const logos = [
    { src: "./assets/logos/idph.png", alt: "IDPH logo" },
    { src: "./assets/logos/seal.png", alt: "Illinois logo" },
  ];

  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex items-center gap-16 whitespace-nowrap will-change-transform"
        animate={{
          x: [0, -100 * logos.length],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <motion.img
            key={`${logo.alt}-${index}`}
            src={logo.src}
            alt={logo.alt}
            className="h-12 max-w-[160px] w-auto object-contain cursor-pointer transition-transform duration-200"
            whileHover={{ scale: 1.1 }}
            data-cursor="view"
          />
        ))}
      </motion.div>
    </div>
  );
}
