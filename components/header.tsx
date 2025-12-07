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
        className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-black border-b-2 border-black dark:border-white"
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
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMenu}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
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
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={closeMenu}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 right-4 left-4 sm:left-auto sm:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              <nav className="p-4">
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <motion.li
                      key={link.hash}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        className={clsx(
                          "block px-4 py-3 rounded-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                          {
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400": activeSection === link.name,
                            "text-gray-700 dark:text-gray-300": activeSection !== link.name,
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
