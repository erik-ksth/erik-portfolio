"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { preloaderStore } from "@/lib/store";
import { getMusicPref, play, playSoon, setMusicOn } from "@/lib/sound";
import { useLenis } from "./smooth-scroll";
import LiquidName, { type LoaderApi } from "./liquid-name";

const DURATION = 2400;
// Never hold the visitor longer than this, even if fonts are slow.
const MAX_WAIT = 4000;
const ZOOM_SCALE = 120;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [zoom, setZoom] = useState<{ origin: string } | null>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const api = useRef<LoaderApi | null>(null);
  const lenis = useLenis();
  const revealRef = useRef<() => void>(() => {});

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

    const start = performance.now();
    let raf = 0;
    const reveal = () => {
      play("land");
      setVisible(false);
      document.documentElement.classList.remove("is-loading");
      preloaderStore.set(true);
    };
    revealRef.current = reveal;

    // Fly into the name (or just reveal, for reduced motion).
    const enter = () => {
      // Music is on unless the visitor turned it off. It starts on their first
      // click (browser rule), then eases in very slowly.
      if (getMusicPref()) setMusicOn(true, false, { delay: 2.5, fade: 14 });
      if (reduced) {
        reveal();
        return;
      }
      let origin = "50% 50%";
      try {
        if (api.current && nameRef.current)
          origin = api.current.origin(nameRef.current);
      } catch {
        // Fall back to the centre if the font can't be measured.
      }
      setZoom({ origin });
      playSoon("whoosh");
    };
    let finished = false;

    // Writes straight to the DOM: no React re-render per frame.
    const update = () => {
      if (finished) return;
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = ready || elapsed > MAX_WAIT ? eased : Math.min(eased, 0.92);

      api.current?.update(p);

      if (p >= 1) {
        finished = true;
        setTimeout(enter, 350);
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
    };
  }, []);

  const register = useCallback((a: LoaderApi) => {
    api.current = a;
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-night text-paper"
          // As the zoom fills the screen the backdrop turns yellow too, so the
          // hand-off is always a clean yellow frame, which then dissolves.
          animate={zoom ? { backgroundColor: "#ffd60a" } : undefined}
          exit={{ opacity: 0 }}
          transition={{
            backgroundColor: { delay: 0.7, duration: 0.2 },
            opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            {/* The name fills with yellow as it loads, then we fly into the "H". */}
            <motion.div
              ref={nameRef}
              className="relative w-[min(92vw,900px)] will-change-transform"
              style={{ transformOrigin: zoom?.origin ?? "50% 50%" }}
              animate={zoom ? { scale: ZOOM_SCALE } : { scale: 1 }}
              transition={{ duration: 1, ease: [0.7, 0, 0.84, 0] }}
              onAnimationComplete={() => zoom && revealRef.current()}
            >
              <LiquidName register={register} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
