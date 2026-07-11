"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, CheckCircle, User, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingLabelInput } from "@/components/enhanced-form"

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    mode: "onTouched",
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "e39aeca5-bfa3-4c04-8733-959db67565d1",
          name: data.name,
          email: data.email,
          subject: "Contact Us Form: " + data.subject,
          message: data.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Form sent:", result);
        setIsSubmitted(true);
        reset();
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        console.error("Web3Forms Error:", result);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-theme-red-dark rounded-2xl shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-bold text-white mt-3 mb-3 text-center">
          Send us a Message
        </h2>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 p-8 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* subtle corner design from original */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingLabelInput
              label="Full Name"
              name="name"
              icon={User}
              required
              register={register}
              error={errors.name?.message}
              placeholder="John Doe"
            />

            <FloatingLabelInput
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              required
              register={register}
              error={errors.email?.message}
              placeholder="johndoe@gmail.com"
            />
          </div>

          <FloatingLabelInput
            label="Subject"
            name="subject"
            required
            register={register}
            error={errors.subject?.message}
            placeholder="Enter a subject"
          />

          <FloatingLabelInput
            label="Message"
            name="message"
            type="textarea"
            rows={6}
            required
            register={register}
            error={errors.message?.message}
            placeholder="Tell us how we can help you..."
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-theme-red hover:bg-theme-red-light disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-6 w-6 mr-3" />
                Send Message
              </>
            )}
          </button>

          {isSubmitted && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-2 flex items-center animate-fadeInUp">
              <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
              <p className="text-emerald-700">
                Thank you! Your message has been sent successfully. We'll get
                back to you soon.
              </p>
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
}
