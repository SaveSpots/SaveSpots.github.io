"use client"

import { motion } from "framer-motion"

export function DynamicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30 will-change-transform"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, theme('colors.white') 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, theme('colors.white') 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, theme('colors.white') 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, theme('colors.white') 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full will-change-transform"
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 2560),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 1440),
          }}
          animate={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 2560),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 1440),
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
