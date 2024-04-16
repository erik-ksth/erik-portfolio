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
    <section ref={ref} id="home" className="mb-28 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem]">
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          >
            <Image
              src="/erik-memoji.png"
              alt="Erik portrait"
              width="192"
              height="192"
              quality="95"
              priority={true}
              className="mb-5"
              // className="h-24 w-24 rounded-full object-cover border-[0.35rem] border-white shadow-xl"
            />
          </motion.div>

        </div>
      </div>

      <motion.h1
        className="mb-10 mt-4 text-2xl font-medium !leading-[2] sm:text-4xl"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="font-bold">Hello, I&apos;m Kaung Sithu (Erik) Hein.</span><br/> 
        <TypeAnimation
        sequence={[
          "A Computer Science Student @ SJSU",
          1000,
          "A Front-end Developer",
          1000,
          "A UI/UX Designer",
          1000,
        ]}
        speed={50}
        repeat={Infinity}
        className="font-semiBold text-2xl"
      />
      </motion.h1>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
        <Link
          href="#contact"
          className="group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          Contact me here{" "}
          <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition" />
        </Link>
        <a
          className="group bg-white px-7 py-3 flex items-center gap-2 rounded-full cursor-pointer outline-none focus:scale-110 hover:scale-110 active:scale-105 transition borderBlack dark:bg-white/10"
          href="/resume.pdf"
          target="_blank"
        >
          View Resume{" "}
          <HiDownload className="opacity-60 group-hover:translate-y-1 transition" />
        </a>
        <div className="flex gap-x-2">
          <a
            className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full cursor-pointer outline-none focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition borderBlack dark:text-black"
            href="https://www.linkedin.com/in/kaungsithuhein/"
            target="_blank"
          >
            <BsLinkedin />
          </a>
          <a
            className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full cursor-pointer outline-none focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition borderBlack dark:text-black"
            href="https://github.com/erik-ksth"
            target="_blank"
          >
            <FaGithubSquare />
          </a>
          <a
            className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full cursor-pointer outline-none focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition borderBlack dark:text-black"
            href="https://www.youtube.com/@flowwitherik"
            target="_blank"
          >
            <FaYoutube />
          </a>
          <a
            className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full cursor-pointer outline-none focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition borderBlack dark:text-black"
            href="https://www.behance.net/kaungsithu32"
            target="_blank"
          >
            <FaBehanceSquare />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
