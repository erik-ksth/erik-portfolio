"use client";

import React, { useState, useEffect } from "react";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hook";
import Image from "next/image";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <section ref={ref} id="projects" className="scroll-mt-20 relative mb-28">
      {/* Custom Cursor (Desktop Only) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] items-center justify-center text-center rounded-full overflow-hidden backdrop-blur-sm hidden md:flex bg-black dark:bg-white"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ 
          width: hoveredProject !== null ? 130 : 0, 
          height: hoveredProject !== null ? 130 : 0, 
          opacity: hoveredProject !== null ? 0.95 : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-white dark:text-black font-normal text-sm px-4 break-words leading-snug">
          {hoveredProject !== null && projectsData[hoveredProject].title}
        </span>
      </motion.div>

      <div className="container mx-auto px-4">
        <SectionHeading>Featured Projects</SectionHeading>
        
        {/* Modern Organized Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 lg:mt-20 w-full max-w-6xl mx-auto">
          {projectsData.map((project, index) => (
            <motion.a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              onMouseEnter={() => setHoveredProject(index)}
              onMouseLeave={() => setHoveredProject(null)}
              className="group block relative md:cursor-none border-[3px] md:border-4 border-black dark:border-white bg-white dark:bg-black overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
            >
              <div className="relative w-full aspect-video md:aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Mobile Fallback Title (visible always on mobile, hidden on desktop) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:hidden flex flex-col justify-end pointer-events-none">
                  <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
