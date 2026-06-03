"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/shared/animated-section"
import { InfiniteGrid } from "@/components/layout/infinite-grid"
import { Search, HandHeart, BrainCircuit } from "lucide-react"

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

export function ServicesSection() {
  const services = [
    {
      step: "01",
      title: "Pinpoint Areas of Need",
      description:
        "We use publicly available governmental and reliable non-governmental data to identify blocks in need of SaveBoxes",
      icon: Search,
    },
    {
      step: "02",
      title: "Mass Outreach and Distribution",
      description:
        "Use a network of dedicated students and volunteers to reach out to local businesses and community centers to inquire about placing SaveBoxes in high-traffic, easily accessible locations.",
      icon: HandHeart,
    },
    {
      step: "03",
      title: "Getting Smarter",
      description:
        "Continuously monitor and analyze the performance of each SaveBox location, regularly connecting with the people hosting SaveBoxes to optimize placement and education to ensure maximum impact.",
      icon: BrainCircuit,
    },
  ];

  return (
    <section
      id="services"
      className="relative overflow-hidden py-24 px-4 bg-theme-red"
    >
      <InfiniteGrid className="opacity-40" />

      <AnimatedSection>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.span
            className="mb-4 flex justify-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
              How it works
            </span>
          </motion.span>

          <motion.h2
            className="text-4xl md:text-6xl font-extrabold mb-16 text-center tracking-tight text-white"
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