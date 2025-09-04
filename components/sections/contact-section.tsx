"use client"

import { motion } from "framer-motion"
import { AnimatedSection } from "@/components/shared/animated-section"
import { ConsistentButton } from "@/components/shared/consistent-button"
import { ContactForm } from "@/components/contact-form"
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

export function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 bg-theme-red">
      <AnimatedSection>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <motion.h2
              className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-white"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              data-cursor="text"
            >
              Let's talk.
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-12 font-medium"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              data-cursor="text"
            >
              Reach out to us for collaborations, inquiries, or to get involved
              with the mission. We're here to connect and make a difference.
            </motion.p>
            <motion.div
              className="flex flex-col gap-4 max-w-xs mx-auto md:mx-0"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="https://savespots.fillout.com/volunteer"
                className="w-full"
                target="_blank"
              >
                <ConsistentButton variant="primary" className="w-full">
                  Join our Research Team
                </ConsistentButton>
              </Link>
              <Link
                href="https://savespots.fillout.com/savebox"
                className="w-full"
                target="_blank"
              >
                <ConsistentButton variant="secondary" className="w-full">
                  Host a SaveBox at Your Location
                </ConsistentButton>
              </Link>
              <Link
                href="mailto:contact@savespots.org"
                className="w-full"
                target="_blank"
              >
                <ConsistentButton variant="primary" className="w-full">
                  Email: Contact@savespots.org
                </ConsistentButton>
              </Link>
            </motion.div>
          </div>
          <div>
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
