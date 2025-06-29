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
      className="scroll-mt-20"
    >
      <SectionHeading>About Me</SectionHeading>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              I am a Computer Science graduate from{" "}
              <span className="font-semibold text-gray-900 dark:text-white">San José State University</span>.
              I am currently working as a Full-Stack Developer and Software Engineer, specializing in web and
              mobile development with a strong focus on UI/UX design.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              I have over <span className="font-bold text-blue-600 dark:text-blue-400">5 years</span> of experience
              in <span className="italic text-gray-900 dark:text-white">Software Development</span>, and over{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">10 years</span> of experience in{" "}
              <span className="italic text-gray-900 dark:text-white">Graphic Design</span>. My expertise includes{" "}
              <span className="font-bold text-gray-900 dark:text-white">React, Next.js, React Native, TypeScript</span>,
              and modern web technologies.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              I combine technical expertise with UI/UX design principles to create intuitive, responsive,
              and visually appealing applications that deliver exceptional user experiences.
            </p>

            {/* Key Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years in Development</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years in Design</div>
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20"></div>
              <Image
                src="/aboutMe.jpg"
                alt="Erik working"
                width="400"
                height="400"
                className="relative rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
