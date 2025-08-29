"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/animated-section";

const photos = [
  { src: "https://placehold.co/600x400/1a1a1a/ffffff?text=Photo+1", alt: "Photo 1" },
  { src: "https://placehold.co/600x600/1a1a1a/ffffff?text=Photo+2", alt: "Photo 2" },
  { src: "https://placehold.co/600x400/1a1a1a/ffffff?text=Photo+3", alt: "Photo 3" },
  { src: "https://placehold.co/600x400/1a1a1a/ffffff?text=Photo+4", alt: "Photo 4" },
  { src: "https://placehold.co/600x600/1a1a1a/ffffff?text=Photo+5", alt: "Photo 5" },
  { src: "https://placehold.co/600x400/1a1a1a/ffffff?text=Photo+6", alt: "Photo 6" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// I've renamed the function to match what your main page is importing.
export function ProcessSection() {
  return (
    <section id="gallery" className="py-20 px-4 bg-gray-100">
      <AnimatedSection>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-16 tracking-tight text-gray-900 text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            Photo Gallery
          </motion.h2>

          {/* Photo Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-lg shadow-lg group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-lg font-semibold">{photo.alt}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
}

