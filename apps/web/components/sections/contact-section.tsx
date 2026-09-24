"use client"

import { motion } from "framer-motion"
import { AnimatedSection } from "@/components/shared/animated-section"
import { InfiniteGrid } from "@/components/layout/infinite-grid"
import { ConsistentButton } from "@/components/shared/consistent-button"
import { org } from "@/lib/donate-config";
import { ContactForm } from "@/components/contact-form"
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-24 px-4 bg-theme-red"
    >
      <InfiniteGrid className="opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-theme-red-dark/60 to-transparent" />

      <AnimatedSection>
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
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
                href="https://savespots.fillout.com/savebox"
                className="w-full"
                target="_blank"
              >
                <ConsistentButton variant="secondary" className="w-full">
                  Host a SaveBox at Your Location
                </ConsistentButton>
              </Link>
              {/* Address comes from donate-config so the site has exactly one
                  contact address to change, not five copies to miss. The link
                  text IS the address, so it stays readable (and copyable) in
                  the rendered HTML rather than hiding behind a label. */}
              <Link href={`mailto:${org.email}`} className="w-full">
                <ConsistentButton variant="primary" className="w-full">
                  {org.email}
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
