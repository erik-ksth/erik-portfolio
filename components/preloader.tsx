"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { preloaderStore } from "@/lib/store";
import { getMusicPref, play, setMusicOn } from "@/lib/sound";
import { useLenis } from "./smooth-scroll";

const IntroScene = dynamic(() => import("./three/intro-scene"), { ssr: false });

const INTRO_DURATION = 3400;
const MAX_WAIT = 5500;
const ease = [0.22, 1, 0.36, 1] as const;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const departure = useRef<number | null>(null);
  const markSceneReady = useCallback(() => setSceneReady(true), []);
  const finished = useRef(false);
  const intro = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const enter = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    departure.current = performance.now();

    if (getMusicPref()) setMusicOn(true, false, { delay: 2.5, fade: 14 });
    play("land");
    preloaderStore.set(true);
    setVisible(false);

    // Move focus out of the departing intro only when the visitor used it.
    if (document.activeElement === intro.current) {
      const main = document.querySelector("main");
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
      }
    }
  }, []);

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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    // A local review link holds the scene until Escape; production always exits.
    const preview = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("intro");

    // The global deadline also covers a slow or unavailable 3D renderer.
    const deadline = window.setTimeout(() => {
      if (!preview) enter();
    }, reduced ? 500 : MAX_WAIT);

    // Keep keyboard navigation inside this brief overlay without stealing
    // focus on arrival. Escape always takes the visitor straight to the work.
    const onKeyDown = (event: KeyboardEvent) => {
      if (finished.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        enter();
      } else if (event.key === "Tab") {
        event.preventDefault();
        intro.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(deadline);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("is-loading");
    };
  }, [enter]);

  useEffect(() => {
    if (reducedMotion === null || (!reducedMotion && !sceneReady)) return;
    if (process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("intro")) return;
    let disposed = false;
    const minimum = window.setTimeout(() => {
      Promise.resolve(document.fonts?.ready).then(() => {
        if (!disposed) enter();
      });
    }, reducedMotion ? 150 : INTRO_DURATION);
    return () => {
      disposed = true;
      window.clearTimeout(minimum);
    };
  }, [enter, reducedMotion, sceneReady]);

  return (
    <AnimatePresence onExitComplete={() => document.documentElement.classList.remove("is-loading")}>
      {visible && (
        <motion.div
          key="preloader"
          ref={intro}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Erik Hein portfolio intro"
          className="intro"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.8, delay: reducedMotion ? 0 : 0.15, ease }}
        >
          <div className="intro-stage" aria-hidden="true">
            {reducedMotion === false && <IntroScene onReady={markSceneReady} departure={departure} />}
          </div>
          <motion.div
            className="intro-title"
            initial={false}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -16 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
          >
            <span className="intro-title-name">Erik Hein<span className="intro-title-dot">.</span></span>
          </motion.div>

          <div className="intro-footer">
            <p className="intro-caption">
              <span>Product engineer</span>
              <span className="intro-location">San Francisco, CA</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
