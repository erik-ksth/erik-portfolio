"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaExternalLinkAlt, FaGithubSquare } from "react-icons/fa";
import Link from "next/link";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);
  const [activeProject, setActiveProject] = useState(0);

  return (
    <section ref={ref} id="projects" className="scroll-mt-20 relative">
      <div className="container mx-auto px-4">
        <SectionHeading>Featured Projects</SectionHeading>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column: Scrollable Content */}
          <div className="w-full lg:w-1/2 flex flex-col gap-32 py-20">
            {projectsData.map((project, index) => (
              <ProjectDetails
                key={index}
                project={project}
                index={index}
                setActiveProject={setActiveProject}
              />
            ))}
          </div>

          {/* Right Column: Sticky Image */}
          <div className="hidden lg:block w-1/2 sticky top-28 h-[calc(100vh-8rem)] flex items-start justify-center pt-[10vh]">
            <div className="relative w-full aspect-[16/10] rounded-none border-4 border-black dark:border-white overflow-hidden bg-white dark:bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={projectsData[activeProject].imageUrl}
                    alt={projectsData[activeProject].title}
                    fill
                    className="object-cover"
                    quality={95}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectDetails({
  project,
  index,
  setActiveProject
}: {
  project: (typeof projectsData)[number];
  index: number;
  setActiveProject: (index: number) => void;
}) {
  return (
    <motion.div
      onViewportEnter={() => setActiveProject(index)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ amount: 0.5, margin: "-100px" }}
      className="min-h-[50vh] flex flex-col justify-center"
    >
      {/* Mobile Image (Visible only on small screens) */}
      <div className="lg:hidden mb-8 w-full aspect-video relative border-4 border-black dark:border-white overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>

      <h3 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter mb-6 leading-none">
        {project.title}
      </h3>

      <p className="text-lg md:text-xl font-medium text-black dark:text-white mb-8 leading-relaxed border-l-4 border-black dark:border-white pl-6">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        {project.tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 text-sm font-bold border-2 border-black dark:border-white uppercase tracking-wider text-black dark:text-white"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group btn-flat flex items-center gap-2"
        >
          View Project
          <FaExternalLinkAlt className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}