"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/shared/animated-section"
import { DynamicBackground } from "@/components/layout/dynamic-background";

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
      title: "Automate Revenue &\nSales Operations",
      description:
        "We build revenue-generating machines that power your go-to-market motion — from hyper-personalized outbound campaigns to scraping competitor ad strategies.",
      metrics: ["Efficiency +103%", "Cost -67%"],
    },
    {
      title: "Workflow Automations",
      description:
        "We automate your daily work to eliminate repetitive tasks, boost efficiency, save time, and eliminate errors.",
      centerMetric: "100+",
    },
    {
      title: "Unlock Financial &\nData Intelligence",
      description:
        "Your financial and operational data is a goldmine. We build secure, robust integrations and pipelines to automate bookkeeping, sync transactions, and unlock predictive insights.",
    },
  ]

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
            We Architect Solutions
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
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <div className="w-full h-32 bg-theme-red-light/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        {service.centerMetric ? (
                          <div className="w-20 h-20 border-2 border-theme-red rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-theme-red">
                              {service.centerMetric}
                            </span>
                          </div>
                        ) : (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-theme-red/10 to-theme-red-dark/10"
                            animate={{ x: [-100, 100] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        )}
                      </div>
                      {service.metrics && (
                        <ul className="flex flex-wrap gap-2">
                          {service.metrics.map((metric, i) => (
                            <li
                              key={i}
                              className="text-sm bg-theme-red px-3 py-1 rounded text-white font-medium"
                            >
                              {metric}
                            </li>
                          ))}
                        </ul>
                      )}
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
  )
}
