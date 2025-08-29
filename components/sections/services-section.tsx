"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/shared/animated-section"
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
      title: "Pinpoint Areas of Need",
      description:
        "We use publicly available governmental and reliable non-governmental data to identify blocks in need of SaveBoxes",
      icon: <Search className="w-16 h-16 text-theme-red" />,
    },
    {
      title: "Mass Outreach and Distribution",
      description:
        "Use a network of dedicated students and volunteers to reach out to local businesses and community centers to inquire about placing SaveBoxes in high-traffic, easily accessible locations.",
      icon: <HandHeart className="w-16 h-16 text-theme-red" />,
    },
    {
      title: "Getting Smarter",
      description:
        "Continuously monitor and analyze the performance of each SaveBox location, regularly connecting with the people hosting SaveBoxes to optimize placement and education to ensure maximum impact.",
      icon: <BrainCircuit className="w-16 h-16 text-theme-red" />,
    },
  ];

  return (
    <section id="services" className="py-20 px-4 bg-theme-red">
      <AnimatedSection>
        <div className="max-w-7xl mx-auto">
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
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="bg-white border-theme-red-dark group hover:bg-gray-100 transition-all duration-300 h-full"
                  data-cursor="view"
                >
                  {/* I added text-center to this component */}
                  <CardContent className="p-8 text-center">
                    <div className="w-full h-32 bg-theme-red-light/20 rounded-lg mb-6 flex items-center justify-center">
                      {service.icon}
                    </div>

                    <h3
                      className="text-2xl font-semibold mb-4 text-black whitespace-pre-line"
                      data-cursor="text"
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-gray-700 font-normal leading-relaxed"
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