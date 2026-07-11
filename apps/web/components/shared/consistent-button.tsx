"use client";

import type React from "react";
import { motion } from "framer-motion";

interface ConsistentButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "cta";
  onClick?: () => void;
  className?: string;
}

export function ConsistentButton({
  children,
  variant = "primary",
  onClick,
  className = "",
}: ConsistentButtonProps) {
  const baseClasses =
    "rounded-full font-semibold transition-all duration-300 flex items-center gap-2";

  const variants = {
    primary:
      "px-6 py-3 bg-white text-theme-red hover:bg-theme-red-light hover:text-white hover:scale-105",
    secondary:
      "px-6 py-3 bg-transparent border border-white text-white hover:bg-theme-red hover:border-theme-red hover:scale-105",
    cta: "px-8 py-4 text-lg md:text-xl bg-white text-theme-red hover:bg-theme-red-light hover:text-white hover:scale-105 shadow-lg shadow-white/50 border-2 border-transparent hover:border-theme-red-light",
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
