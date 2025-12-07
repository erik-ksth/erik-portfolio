"use client";

import { projectsData } from "@/lib/data";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaExternalLinkAlt } from "react-icons/fa";

type ProjectProps = (typeof projectsData)[number];

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  link,
}: ProjectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="group mb-12 last:mb-0"
    >
      <div className="flex flex-col lg:flex-row gap-8 pb-12 border-b-2 border-black dark:border-white last:border-none">

        {/* Project Image */}
        <div className="relative w-full lg:w-96 h-64 lg:h-auto border-4 border-black dark:border-white overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-all duration-500"
          />
        </div>

        {/* Project Content */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">
                {title}
              </h3>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-3 bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border-2 border-black dark:border-white transition-all duration-200"
              >
                <FaExternalLinkAlt size={20} />
              </a>
            </div>

            <p className="text-black dark:text-white text-lg font-medium leading-relaxed mb-8">
              {description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 text-sm font-bold bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
