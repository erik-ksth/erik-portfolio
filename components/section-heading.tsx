"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.h2
      className="text-4xl font-black text-center mb-12 text-black dark:text-white uppercase tracking-widest border-b-4 border-black dark:border-white inline-block pb-2"
      initial={{
        opacity: 0,
        y: 100,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
      }}
    >
      {children}
    </motion.h2>
  );
}
