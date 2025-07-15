"use client"

import { motion } from "framer-motion"

export function InfiniteLogoCarousel() {
  const logos = [
    { name: "SPOPO", style: "font-bold text-2xl" },
    { name: "n8n", style: "font-bold text-2xl" },
    { name: "Uber", style: "font-bold text-2xl" },
    { name: "NASA", style: "font-bold text-2xl" },
    { name: "Klarna", style: "font-bold text-2xl" },
  ]

  const duplicatedLogos = [...logos, ...logos, ...logos]

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
          <motion.span
            key={`${logo.name}-${index}`}
            className={`${logo.style} text-white/80 hover:text-white transition-colors flex-shrink-0`}
            whileHover={{ scale: 1.1 }}
            data-cursor="view"
          >
            {logo.name}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
