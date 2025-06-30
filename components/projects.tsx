"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import Project from './project'
import { useSectionInView } from "@/lib/hook";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section ref={ref} id="projects" className="scroll-mt-20">
      <SectionHeading>Featured Projects</SectionHeading>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-16 max-w-3xl mx-auto">
        Here are some of my recent projects that showcase my skills in full-stack development,
        mobile apps, and AI integration.
      </p>

      <div className="space-y-6 max-w-5xl mx-auto">
        {projectsData.map((project, index) => (
          <Project key={index} {...project} />
        ))}
      </div>
    </section>
  );
}