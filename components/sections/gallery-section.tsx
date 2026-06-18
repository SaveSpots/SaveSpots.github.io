"use client";

import { motion } from "framer-motion";
import { InfiniteGrid } from "@/components/layout/infinite-grid";
import { SmartImage } from "@/components/shared/smart-image";
import { gallery } from "@/lib/site-data";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
};

export function GallerySection() {
  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-theme-red px-4 py-28 md:py-32"
    >
      <InfiniteGrid className="opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div className="max-w-3xl" {...fadeInUp}>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            What it looks like on the ground
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            From folding cardboard kits to stocking boxes in neighborhood shops,
            here is the work in progress.
          </p>
        </motion.div>

        {/* Masonry via CSS columns: no empty cells, natural rhythm */}
        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {gallery.map((item, i) => (
            <motion.figure
              key={item.image + i}
              className="break-inside-avoid overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
              {...fadeInUp}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <SmartImage
                src={item.image}
                alt={item.caption}
                fallbackLabel={item.caption}
                className={`w-full object-cover ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                }`}
              />
              <figcaption className="px-5 py-4 text-sm font-medium text-white/80">
                {item.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
