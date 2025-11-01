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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30"></div>
            <Image
              src="/Erik.jpg"
              alt="Erik portrait"
              width="200"
              height="200"
              quality="95"
              priority={true}
              className="relative h-48 w-48 rounded-full object-cover border-4 border-white shadow-2xl"
            />
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
            Erik Hein
          </h1>
          <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
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
              className="font-medium"
            />
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Computer Science Graduate passionate about creating innovative digital experiences
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="#contact"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              setActiveSection("Contact");
              setTimeOfLastClick(Date.now());
            }}
          >
            Get In Touch
            <BsArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full font-medium border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:scale-105"
            href="/Erik Hein Resume.pdf"
            target="_blank"
          >
            View Resume
            <HiDownload className="inline ml-2 group-hover:translate-y-1 transition-transform" />
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center gap-4"
        >
          <a
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            href="https://www.linkedin.com/in/erikhein/"
            target="_blank"
            aria-label="LinkedIn"
          >
            <BsLinkedin size={24} />
          </a>
          <a
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            href="https://github.com/erik-ksth"
            target="_blank"
            aria-label="GitHub"
          >
            <FaGithubSquare size={24} />
          </a>
          <a
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            href="https://www.youtube.com/@erik-hein"
            target="_blank"
            aria-label="YouTube"
          >
            <FaYoutube size={24} />
          </a>
          <a
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            href="https://www.behance.net/kaungsithu32"
            target="_blank"
            aria-label="Behance"
          >
            <FaBehanceSquare size={24} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
