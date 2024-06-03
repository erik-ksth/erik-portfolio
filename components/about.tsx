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
        I am currently a undergraduate Computer Science student at{" "}
        <i>San José State University</i>. I finished{" "}
        <b>Associate&apos;s Degree for Transfer</b> at <i>De Anza College</i> in 2023
        August.
      </p>
      <p className="mb-3">
        I have over <b>2-year</b> experience in <i>Programming</i>, and over{" "}
        <b>6-year</b> experience in <i>Graphic Design</i>. My top skills include{" "}
        <b>HTML, CSS, JavaScript, React, Figma, Java</b> and <b>Arduino.</b>
      </p>
    </motion.section>
  );
}
