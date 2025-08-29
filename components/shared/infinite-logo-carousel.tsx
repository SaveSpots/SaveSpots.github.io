"use client";

import { motion } from "framer-motion";

export function InfiniteLogoCarousel() {
  const logos = [
    { src: "./assets/logos/idph.png", alt: "IDPH logo" },
    { src: "./assets/logos/seal.png", alt: "Illinois logo" },
    { src: "./assets/logos/narcandirectreallogo.png", alt: "Narcan Direct logo" },
    { src: "./assets/logos/cityofchicagofr.png", alt: "City of Chicago logo" },
  ];

  const duplicatedLogos = [...logos, ...logos];

  return (
    // We are applying a more restrictive max-width here (max-w-2xl)
    // and centering it with mx-auto. The overflow-hidden is crucial
    // for containing the scrolling logos within this narrower boundary.
    <div className="w-full max-w-2xl mx-auto overflow-hidden py-4">
      <motion.div
        className="flex items-center gap-16 whitespace-nowrap will-change-transform"
        animate={{
          x: ["0%", "-50%"],
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

