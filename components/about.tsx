"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hook";
import Image from "next/image";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <section
      ref={ref}
      id="about"
      className="scroll-mt-20 py-20"
    >
      <SectionHeading>About Me</SectionHeading>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <p className="text-xl text-black dark:text-white leading-relaxed font-medium">
              I don&apos;t just write code; I craft digital experiences. As a Computer Science graduate from{" "}
              <span className="font-black text-black dark:text-white uppercase">San José State University</span>,
              I bridge the gap between robust engineering and stunning design.
            </p>

            <p className="text-xl text-black dark:text-white leading-relaxed font-medium">
              With over <span className="font-black text-black dark:text-white border-b-4 border-black dark:border-white">5 years</span> in development
              and a decade in graphic design, I speak both languages fluently. My toolkit?{" "}
              <span className="font-black text-black dark:text-white uppercase">React, Next.js, React Native, and TypeScript</span>
              —everything needed to build modern, high-performance applications.
            </p>

            <p className="text-xl text-black dark:text-white leading-relaxed font-medium">
              My mission is simple: create intuitive, responsive, and visually striking software that leaves a lasting impression.
              I combine technical precision with artistic vision to deliver products that don&apos;t just work—they wow.
            </p>

            {/* Key Highlights */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="text-center p-6 bg-white dark:bg-black border-4 border-black dark:border-white">
                <div className="text-4xl font-black text-black dark:text-white mb-2">5+</div>
                <div className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Years in Development</div>
              </div>
              <div className="text-center p-6 bg-white dark:bg-black border-4 border-black dark:border-white">
                <div className="text-4xl font-black text-black dark:text-white mb-2">10+</div>
                <div className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Years in Design</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative">
              <Image
                src="/aboutMe.jpg"
                alt="Erik working"
                width="500"
                height="500"
                className="relative object-cover border-4 border-black dark:border-white"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
