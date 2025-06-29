import React from "react";
import { FaHeart } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-12 px-4 text-center border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Built with <FaHeart className="inline text-red-500 mx-1" /> using{" "}
            <span className="font-semibold text-gray-900 dark:text-white">React</span>,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">Next.js</span>,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">TypeScript</span>,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">Tailwind CSS</span>, and{" "}
            <span className="font-semibold text-gray-900 dark:text-white">Framer Motion</span>
          </p>
        </div>

        <div className="text-gray-500 dark:text-gray-400 text-sm">
          &copy; {currentYear} Erik Hein. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
