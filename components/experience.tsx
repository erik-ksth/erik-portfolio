"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import { motion } from "framer-motion";

export default function Experience() {
  const { ref } = useSectionInView("Experience");

  return (
    <section
      ref={ref}
      id="experience"
      className="scroll-mt-20 py-20 w-full"
    >
      <SectionHeading>Experience & Education</SectionHeading>

      <div className="w-full max-w-7xl mx-auto px-4 mt-10">
        {/* Ledger Header */}
        <div className="hidden md:grid grid-cols-12 border-b-4 border-black dark:border-white pb-4">
          <div className="col-span-5 text-2xl font-black uppercase tracking-tighter">What</div>
          <div className="col-span-4 text-2xl font-black uppercase tracking-tighter">Where</div>
          <div className="col-span-3 text-2xl font-black uppercase tracking-tighter text-right">When</div>
        </div>

        {/* Ledger Rows */}
        <div className="flex flex-col">
          {experiencesData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 border-b-4 border-black dark:border-white py-8 md:py-6 items-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 group"
            >
              <div className="col-span-5 text-2xl md:text-3xl font-bold uppercase tracking-tight px-2">
                {item.title}
              </div>
              <div className="col-span-4 text-xl md:text-2xl font-medium px-2">
                {item.location}
              </div>
              <div className="col-span-3 text-lg md:text-xl font-mono font-bold md:text-right px-2">
                {item.date}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
