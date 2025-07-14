"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { AnimatedSection } from "@/components/shared/animated-section"

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

export function ProcessSection() {
  return (
    <section id="process" className="py-20 px-4 bg-theme-red">
      <AnimatedSection>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-16 tracking-tight text-white"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            data-cursor="text"
          >
            Our process
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                number: "01",
                title: "Analyze",
                description:
                  "We start with a thorough analysis of your current workflows to see how AI could improve your business.",
                visual: "grid",
              },
              {
                number: "02",
                title: "Build & Implement",
                description:
                  "Our developers will start crafting custom AI-solutions for your company, continuously prioritising quality and safety.",
                visual: "code",
              },
              {
                number: "03",
                title: "Maintain & improve",
                description:
                  "After deployment, our team will keep working hard by providing support and continuously improving the implemented solutions.",
                visual: "metrics",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 h-full"
                  data-cursor="view"
                >
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                        {step.visual === "grid" && (
                          <motion.div
                            className="grid grid-cols-3 gap-4 p-4"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                          >
                            {[...Array(9)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-8 h-8 bg-white/30 rounded"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                              />
                            ))}
                          </motion.div>
                        )}
                        {step.visual === "code" && (
                          <div className="bg-white/20 rounded p-2 text-xs font-semibold text-white w-full mx-4">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: "100%" }}
                              viewport={{ once: true }}
                              transition={{ duration: 2 }}
                            >
                              <div>{'<html lang="en">'}</div>
                              <div>{"<head>"}</div>
                              <div className="ml-4">{'<meta charset="UTF-8">'}</div>
                              <div className="ml-4">{'<meta name="viewport"'}</div>
                              <div className="ml-8">{'content="width=device-width, initial-'}</div>
                            </motion.div>
                          </div>
                        )}
                        {step.visual === "metrics" && (
                          <div className="space-y-3 w-full px-4">
                            {[
                              { label: "Software speed", value: "+39%" },
                              { label: "Workflow efficiency", value: "+25%" },
                              { label: "Operational cost", value: "-11%" },
                            ].map((metric, i) => (
                              <motion.div
                                key={i}
                                className="flex justify-between"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                              >
                                <span className="text-sm text-white/90 font-medium">{metric.label}</span>
                                <span className="text-sm text-white font-semibold">{metric.value}</span>
                              </motion.div>
                            ))}
                            <motion.div
                              className="flex justify-between items-center mt-6"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.8 }}
                            >
                              <span className="text-sm text-white/90 font-medium">Update available</span>
                              <Button size="sm" className="bg-white text-theme-red text-xs font-semibold">
                                Update <ArrowUp className="w-3 h-3 ml-1" />
                              </Button>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white/50 mb-4">{step.number}</div>
                    <h3 className="text-2xl font-semibold mb-4 text-white" data-cursor="text">
                      {step.title}
                    </h3>
                    <p className="text-white/90 font-medium" data-cursor="text">
                      {step.description}
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
