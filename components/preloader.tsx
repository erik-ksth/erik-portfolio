"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { preloaderStore } from "@/lib/store";
import { getMusicPref, play, setMusicOn } from "@/lib/sound";
import { useLenis } from "./smooth-scroll";
import ParticleName, { type IntroApi } from "./particle-name";

// How long the particles take to assemble the name.
const DURATION = 2200;
// Never hold the visitor longer than this, even if fonts are slow.
const MAX_WAIT = 4000;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const api = useRef<IntroApi | null>(null);
  const exitFallback = useRef<number | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || preloaderStore.get()) return;
    lenis.stop();
    return preloaderStore.subscribe(() => {
      if (preloaderStore.get()) lenis.start();
    });
  }, [lenis]);

  useEffect(() => {
    document.documentElement.classList.add("is-loading");
    window.scrollTo(0, 0);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 500 : DURATION;

    // Only fonts gate the reveal; images and 3D load in the background.
    let ready = false;
    document.fonts?.ready.then(() => (ready = true));

    // The galaxy swirls on its own for a moment before the name starts forming.
    const start = performance.now() + (reduced ? 0 : 700);
    let raf = 0;
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      if (exitFallback.current !== null) {
        window.clearTimeout(exitFallback.current);
        exitFallback.current = null;
      }
      play("land");
      setVisible(false);
      document.documentElement.classList.remove("is-loading");
      preloaderStore.set(true);
    };

    // Warp the particles out (or just reveal, for reduced motion).
    const enter = () => {
      // Music is on unless the visitor turned it off. It starts on their first
      // click (browser rule), then eases in very slowly.
      if (getMusicPref()) setMusicOn(true, false, { delay: 2.5, fade: 14 });
      if (reduced) {
        reveal();
        return;
      }
      // Never let a stalled animation strand the visitor.
      exitFallback.current = window.setTimeout(reveal, 4000);
      (api.current?.play() ?? Promise.resolve()).then(reveal, reveal);
    };
    let finished = false;

    // Writes straight to the DOM: no React re-render per frame.
    const update = () => {
      if (finished) return;
      const elapsed = Math.max(0, performance.now() - start);
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 1.6);
      const p = ready || elapsed > MAX_WAIT ? eased : Math.min(eased, 0.92);

      api.current?.update(p);

      if (p >= 1) {
        finished = true;
        // A beat to see the finished name (and play with it) before the warp.
        setTimeout(enter, reduced ? 0 : 600);
      }
    };
    const frame = () => {
      update();
      if (!finished) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    // rAF pauses in background tabs; a timer keeps the clock honest so the
    // intro isn't still waiting when someone switches over.
    const interval = setInterval(update, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      if (exitFallback.current !== null) window.clearTimeout(exitFallback.current);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  const register = useCallback((a: IntroApi) => {
    api.current = a;
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[10000] h-[100dvh] w-screen overflow-hidden bg-night text-paper"
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        >
          <ParticleName register={register} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
