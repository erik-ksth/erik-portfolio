"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function Cursor() {
     const [isHovering, setIsHovering] = useState(false);
     const cursorX = useMotionValue(-100);
     const cursorY = useMotionValue(-100);

     useEffect(() => {
          const moveCursor = (e: MouseEvent) => {
               cursorX.set(e.clientX - 10); // Center the 20px cursor
               cursorY.set(e.clientY - 10);
          };

          const handleMouseOver = (e: MouseEvent) => {
               const target = e.target as HTMLElement;
               if (
                    target.tagName === "A" ||
                    target.tagName === "BUTTON" ||
                    target.closest("a") ||
                    target.closest("button") ||
                    target.classList.contains("cursor-pointer")
               ) {
                    setIsHovering(true);
               } else {
                    setIsHovering(false);
               }
          };

          window.addEventListener("mousemove", moveCursor);
          window.addEventListener("mouseover", handleMouseOver);

          return () => {
               window.removeEventListener("mousemove", moveCursor);
               window.removeEventListener("mouseover", handleMouseOver);
          };
     }, [cursorX, cursorY]);

     return (
          <motion.div
               className="fixed top-0 left-0 w-5 h-5 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference hidden md:block"
               style={{
                    x: cursorX,
                    y: cursorY,
               }}
               animate={{
                    scale: isHovering ? 2.5 : 1,
               }}
               transition={{
                    scale: { duration: 0.2, ease: "easeInOut" },
               }}
          />
     );
}
