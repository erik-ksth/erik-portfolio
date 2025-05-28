"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hook";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      id="about"
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-40"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        I am a Computer Science graduate from{" "}
        <i>San José State University</i>. I am currently working as a Full-Stack Developer
        and Software Engineer, specializing in web and mobile development with a strong focus on UI/UX design.
      </p>
      <p className="mb-3">
        I have over <b>5 years</b> of experience in <i>Software Development</i>, and over{" "}
        <b>10 years</b> of experience in <i>Graphic Design</i>. My expertise includes{" "}
        <b>React, Next.js, React Native, TypeScript</b>, and modern web technologies.
        I combine technical expertise with UI/UX design principles to create intuitive,
        responsive, and visually appealing applications that deliver exceptional user experiences.
      </p>
    </motion.section>
  );
}
