"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ConsistentButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  onClick?: () => void
  className?: string
}

export function ConsistentButton({ children, variant = "primary", onClick, className = "" }: ConsistentButtonProps) {
  const baseClasses = "px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2"
  const variants = {
    primary: "bg-white text-theme-red hover:bg-theme-red-light hover:text-white hover:scale-105",
    secondary: "bg-transparent border border-white text-white hover:bg-white/20 hover:border-white hover:scale-105",
  }

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}
