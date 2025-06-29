"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import { motion } from "framer-motion";
import { FaBriefcase, FaGraduationCap } from "react-icons/fa";

export default function Experience() {
  const { ref } = useSectionInView("Experience");

  return (
    <section
      ref={ref}
      id="experience"
      className="scroll-mt-20"
    >
      <SectionHeading>Experience & Education</SectionHeading>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {experiencesData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Timeline line */}
              {index < experiencesData.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
              )}

              <div className="flex gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    {item.title.includes("Degree") || item.title.includes("Bachelor") || item.title.includes("Associate") ? (
                      <FaGraduationCap className="text-blue-600 dark:text-blue-400" size={20} />
                    ) : (
                      <FaBriefcase className="text-blue-600 dark:text-blue-400" size={20} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
