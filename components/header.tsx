"use client";

import { motion } from "framer-motion";
import { paletteStore, usePreloaderDone } from "@/lib/store";
import { useScrollTo } from "./smooth-scroll";
import SoundToggle from "./sound-toggle";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Header() {
  const ready = usePreloaderDone();
  const scrollTo = useScrollTo();
  const intro = {
    initial: { y: -24, opacity: 0 },
    animate: ready ? { y: 0, opacity: 1 } : undefined,
    transition: { duration: 1, ease, delay: 0.5 },
  };

  return (
    <header>
      {/* A direct child of the page (no isolating ancestors), so the difference
          blend inverts against paper and night sections alike. */}
      <motion.a
        {...intro}
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          scrollTo(0);
        }}
        className="fixed left-4 top-4 z-[900] flex items-baseline gap-3 text-white mix-blend-difference md:left-8 md:top-6"
      >
        <span className="font-display text-[1.2rem] font-extrabold uppercase leading-none tracking-[-0.02em] md:text-[1.35rem]">Erik Hein</span>
        <span className="code-label hidden opacity-70 md:inline">/ engineer × designer</span>
      </motion.a>

      <motion.div {...intro} className="fixed right-4 top-4 z-[900] flex gap-2 md:right-8 md:top-6">
        <SoundToggle />
        {/* The palette plays its own "open" whoosh, so no click sound here. */}
        <button onClick={() => paletteStore.set(true)} className="key" aria-haspopup="dialog" data-sound="none">
          menu
          <span className="kbd hidden sm:inline">⌘K</span>
        </button>
      </motion.div>
    </header>
  );
}
