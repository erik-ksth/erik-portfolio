"use client";

import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { links } from "@/lib/data";
import Link from "next/link";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="z-[999] relative">
      {/* Flat background - full width with border */}
      <div
        className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-black border-b-4 border-black dark:border-white"
      />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-1/2 h-20 -translate-x-1/2 items-center">
        <ul className="flex items-center justify-center gap-1 text-base font-bold uppercase tracking-wider">
          {links.map((link) => (
            <li key={link.hash} className="relative">
              <Link
                className={clsx(
                  "flex items-center justify-center px-6 py-2 transition-all duration-200 border-2 border-transparent hover:border-black dark:hover:border-white",
                  {
                    "bg-black text-white dark:bg-white dark:text-black": activeSection === link.name,
                    "text-black dark:text-white": activeSection !== link.name,
                  }
                )}
                href={link.hash}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Burger Menu Button */}
      <div className="md:hidden fixed top-3 right-4 z-50">
        <button
          onClick={toggleMenu}
          className="w-14 h-14 bg-white dark:bg-black border-4 border-black dark:border-white flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={closeMenu}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-screen w-[80%] max-w-sm bg-white dark:bg-black border-l-4 border-black dark:border-white z-50 flex flex-col pt-24 px-6"
            >
              <nav className="flex-1">
                <ul className="space-y-4">
                  {links.map((link, index) => (
                    <motion.li
                      key={link.hash}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        className={clsx(
                          "block w-full px-6 py-4 text-2xl font-black uppercase tracking-widest border-4 border-black dark:border-white transition-all duration-300",
                          {
                            "bg-black text-white dark:bg-white dark:text-black": activeSection === link.name,
                            "bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black": activeSection !== link.name,
                          }
                        )}
                        href={link.hash}
                        onClick={() => {
                          setActiveSection(link.name);
                          setTimeOfLastClick(Date.now());
                          closeMenu();
                        }}
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="pb-10 text-center text-sm font-bold uppercase tracking-widest opacity-50">
                Menu
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
