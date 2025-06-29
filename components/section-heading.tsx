"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.h2
      className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white"
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
