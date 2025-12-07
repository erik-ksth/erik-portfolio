import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 px-4 text-center border-t-4 border-black dark:border-white bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-black dark:text-white font-bold uppercase tracking-widest">
          &copy; {currentYear} Erik Hein. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
