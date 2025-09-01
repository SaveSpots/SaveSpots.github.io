"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/shared/animated-section";

interface Photo {
  src: string;
  alt: string;
}

const photos: Photo[] = [
  { src: "https://picsum.photos/600/400?random=1.webp", alt: "Photo 1" },
  { src: "https://picsum.photos/600/400?random=2.webp", alt: "Photo 2" },
  { src: "https://picsum.photos/600/400?random=3.webp", alt: "Photo 3" },
  { src: "https://picsum.photos/600/400?random=4.webp", alt: "Photo 4" },
  { src: "https://picsum.photos/600/400?random=5.webp", alt: "Photo 5" },
  { src: "https://picsum.photos/600/400?random=6.webp", alt: "Photo 6" },
];

export function PhotoSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const getIndex = (index: number) => (index + photos.length) % photos.length;

  return (
    <section id="gallery" className="py-20 bg-theme-red-light">
      <AnimatedSection>
        <div className="max-w-7xl mx-auto relative px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight text-white text-center">
            Photo Gallery
          </h2>

          <div className="relative flex items-center justify-center overflow-hidden">
            <button
              onClick={prevSlide}
              className="absolute left-0 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="flex items-center justify-center w-full md:w-3/4">
              {[
                getIndex(currentIndex - 1),
                currentIndex,
                getIndex(currentIndex + 1),
              ].map((index: number) => {
                const isCenter = index === currentIndex;
                return (
                  <motion.div
                    key={index}
                    className="relative px-2"
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{
                      opacity: isCenter ? 1 : 0.6,
                      scale: isCenter ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                      flex: isCenter ? "0 0 80%" : "0 0 10%",
                      zIndex: isCenter ? 2 : 1,
                    }}
                  >
                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={photos[index].src}
                        alt={photos[index].alt}
                        className="w-full h-[400px] md:h-[500px] object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white text-lg font-semibold">
                          {photos[index].alt}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
