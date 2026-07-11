"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export function HeaderTransition() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <motion.div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ opacity }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-theme-red/50 to-theme-red" />
      <svg className="absolute bottom-0 w-full h-16 text-theme-red" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <motion.path
          d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
          fill="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
