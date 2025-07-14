"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-theme-red z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="text-center">
        <motion.div
          className="flex items-center justify-center space-x-3 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 relative"
          >
            <Image
              src="./SaveSpotsLogo.png"
              alt="SaveSpots Logo"
              fill
              className="w-10 h-auto"
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="text-6xl md:text-7xl font-extrabold text-white mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            SaveSpots
          </motion.span>
        </motion.div>

        <div className="w-64 h-1 bg-theme-red-dark rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white to-white/80"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
          />
        </div>

        <motion.p
          className="text-white/80 mt-6 text-md font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          Reversing Overdose, One Savebox At a Time
        </motion.p>
      </div>
    </motion.div>
  );
}
