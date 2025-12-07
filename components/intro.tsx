"use client";

import { useActiveSectionContext } from "@/context/active-section-context";
import { useSectionInView } from "@/lib/hook";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { FaBehanceSquare } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { TypeAnimation } from 'react-type-animation';

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-28 pb-20 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-4 w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-12">

        {/* Left Content: Text & Buttons */}
        <div className="flex-1 text-center lg:text-left">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 text-black dark:text-white uppercase tracking-tighter leading-none">
              Erik Hein
            </h1>
            <div className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-8 uppercase tracking-widest h-[60px] flex items-center justify-center lg:justify-start">
              <TypeAnimation
                sequence={[
                  "Full-Stack Developer",
                  2000,
                  "Software Engineer",
                  2000,
                  "UI/UX Designer",
                  2000,
                  "Mobile Developer",
                  2000,
                ]}
                speed={50}
                repeat={Infinity}
                className="font-bold"
              />
            </div>
            <p className="text-xl font-medium text-black dark:text-white max-w-xl mx-auto lg:mx-0 border-t-2 border-b-2 border-black dark:border-white py-4">
              Computer Science Graduate passionate about creating innovative digital experiences
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-12"
          >
            <Link
              href="#contact"
              className="group btn-flat flex items-center gap-2"
              onClick={() => {
                setActiveSection("Contact");
                setTimeOfLastClick(Date.now());
              }}
            >
              Get In Touch
              <BsArrowRight className="inline group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              className="group btn-flat-outline flex items-center gap-2"
              href="/Erik Hein Resume.pdf"
              target="_blank"
            >
              View Resume
              <HiDownload className="inline group-hover:translate-y-1 transition-transform" />
            </a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center lg:justify-start gap-6"
          >
            <a
              className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              href="https://www.linkedin.com/in/erikhein/"
              target="_blank"
              aria-label="LinkedIn"
            >
              <BsLinkedin size={28} />
            </a>
            <a
              className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              href="https://github.com/erik-ksth"
              target="_blank"
              aria-label="GitHub"
            >
              <FaGithubSquare size={28} />
            </a>
            <a
              className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              href="https://www.youtube.com/@erik-hein"
              target="_blank"
              aria-label="YouTube"
            >
              <FaYoutube size={28} />
            </a>
            <a
              className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              href="https://www.behance.net/kaungsithu32"
              target="_blank"
              aria-label="Behance"
            >
              <FaBehanceSquare size={28} />
            </a>
          </motion.div>
        </div>

        {/* Right Content: Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <div className="relative inline-block">
            <Image
              src="/Erik.jpg"
              alt="Erik portrait"
              width="400"
              height="400"
              quality="95"
              priority={true}
              className="relative h-[300px] w-[300px] lg:h-[450px] lg:w-[450px] object-cover border-4 border-black dark:border-white"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
