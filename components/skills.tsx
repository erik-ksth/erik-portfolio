"use client";

import React, { useState } from "react";
import SectionHeading from "./section-heading";
import { skillsDataCategorized } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function Skills() {
  const { ref } = useSectionInView("Skills");
  const [openCategory, setOpenCategory] = useState<number | null>(0);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <section
      ref={ref}
      id="skills"
      className="scroll-mt-20 py-20 min-h-[80vh]"
    >
      <SectionHeading>Skills</SectionHeading>

      <div className="w-full max-w-none px-4">
        <div className="flex flex-col">
          {skillsDataCategorized.map((category, index) => (
            <div key={index} className="border-b-4 border-black dark:border-white last:border-b-4">
              <button
                onClick={() => toggleCategory(index)}
                className="w-full py-8 flex items-center justify-between group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 px-4"
              >
                <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-left">
                  {category.category}
                </span>
                <span className="text-2xl md:text-4xl">
                  {openCategory === index ? <FaMinus /> : <FaPlus />}
                </span>
              </button>

              <AnimatePresence>
                {openCategory === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="py-8 px-4 flex flex-wrap gap-4 bg-white dark:bg-black">
                      {category.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="text-xl md:text-2xl font-bold uppercase border-2 border-black dark:border-white px-4 py-2 bg-white dark:bg-black text-black dark:text-white"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
