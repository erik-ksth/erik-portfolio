"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import { motion } from "framer-motion";

// Organize skills into categories
const skillCategories = {
  "Programming Languages": ["C++", "Java", "Python", "JavaScript", "TypeScript", "Dart"],
  "Frontend": ["HTML", "CSS", "React", "Next.js", "Tailwind", "Bootstrap", "Framer Motion"],
  "Backend & Database": ["Node.js", "FastAPI", "Prisma", "MySQL", "PostgreSQL", "Supabase", "SQLite", "MongoDB", "Firebase"],
  "Mobile & Tools": ["React Native", "Flutter", "Expo", "Git", "Arduino"],
  "Design & AI": ["Adobe Photoshop", "Adobe Illustrator", "Adobe XD", "Figma", "Google AI Cloud", "API"],
  "Other": ["JavaFX", "Wordpress"]
};

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * index,
      duration: 0.6,
    },
  }),
};

export default function Skills() {
  const { ref } = useSectionInView("Skills");

  return (
    <section
      ref={ref}
      id="skills"
      className="scroll-mt-20"
    >
      <SectionHeading>Skills & Technologies</SectionHeading>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(skillCategories).map(([category, skills], categoryIndex) => (
          <motion.div
            key={category}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={categoryIndex}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {skills.map((skill, skillIndex) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
