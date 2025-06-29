"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hook";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export default function Contact() {
  const { ref } = useSectionInView("Contact");

  return (
    <section
      ref={ref}
      id="contact"
      className="scroll-mt-20"
    >
      <SectionHeading>Get In Touch</SectionHeading>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Let&apos;s work together
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                I&apos;m always open to discussing new opportunities, interesting projects,
                or just having a chat about technology and innovation.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <a
                    href="mailto:erikhein.ksth@gmail.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    erikhein.ksth@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-gray-600 dark:text-gray-400">San Jose, CA</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FaPhone className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Availability</p>
                  <p className="text-gray-600 dark:text-gray-400">Open to opportunities</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <form
              className="space-y-6"
              action={async (formData) => {
                const { data, error } = await sendEmail(formData);

                if (error) {
                  toast.error(error);
                  return;
                }

                toast.success('Email sent successfully!');
              }}
            >
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="senderEmail"
                  className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-300"
                  name="senderEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  maxLength={500}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full h-32 rounded-lg border border-gray-300 dark:border-gray-600 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none transition-all duration-300"
                  name="message"
                  placeholder="Tell me about your project..."
                  required
                  maxLength={5000}
                />
              </div>

              <SubmitBtn />
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
