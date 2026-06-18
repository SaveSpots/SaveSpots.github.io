"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/shared/animated-section"
import { InfiniteGrid } from "@/components/layout/infinite-grid"
import { Search, HandHeart, BrainCircuit } from "lucide-react"
import { howItWorks } from "@/lib/site-data"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const stepIcons = [Search, HandHeart, BrainCircuit];

export function ServicesSection() {
  const services = howItWorks.map((s, i) => ({ ...s, icon: stepIcons[i] }));

  return (
    <section
      id="services"
      className="relative overflow-hidden py-24 px-4 bg-theme-red"
    >
      <InfiniteGrid className="opacity-40" />

      <AnimatedSection>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.h2
            className="font-display text-4xl md:text-6xl font-extrabold mb-16 text-center tracking-tight text-white"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            data-cursor="text"
          >
            Our Process
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="group relative h-full overflow-hidden rounded-2xl border-0 bg-white/95 shadow-xl shadow-black/20 backdrop-blur transition-all duration-300 hover:shadow-2xl"
                  data-cursor="view"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-theme-red to-theme-red-light" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-theme-red/10 transition-colors duration-300 group-hover:bg-theme-red/20">
                        <service.icon className="h-8 w-8 text-theme-red" />
                      </div>
                      <span className="text-5xl font-extrabold leading-none text-theme-red/15">
                        {service.step}
                      </span>
                    </div>

                    <h3
                      className="mb-3 text-2xl font-bold text-theme-red-dark"
                      data-cursor="text"
                    >
                      {service.title}
                    </h3>
                    <p
                      className="leading-relaxed text-gray-600"
                      data-cursor="text"
                    >
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
}