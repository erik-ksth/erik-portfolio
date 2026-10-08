"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { preloaderStore } from "@/lib/store";
import { useLenis } from "./smooth-scroll";

const DURATION = 2000;
const COMMAND = "build erik-hein --mode=craft";
// Never hold the visitor longer than this, even if fonts are slow.
const MAX_WAIT = 4000;
const ZOOM_SCALE = 120;
const NAME = "Erik Hein";
const FONT_SIZE = 150;
const BASELINE = 178;

// Find a point inside the left stem of the "H" (in screen space, relative to
// the name's wrapper) so the zoom flies into solid yellow, not a gap. The glyph
// is drawn offscreen with the same font and scanned for the stem's centre.
function stemOrigin(text: SVGTextElement, wrap: HTMLElement) {
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 220;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = `800 ${FONT_SIZE}px ${family || "sans-serif"}`;
  ctx.fillText("H", 20, 180);
  // Below the crossbar, so the scan hits only the left stem.
  const midCap = FONT_SIZE * 0.18;
  const row = ctx.getImageData(
    0,
    Math.round(180 - midCap),
    canvas.width,
    1,
  ).data;
  let start = -1;
  let end = -1;
  for (let x = 0; x < canvas.width; x++) {
    const solid = row[x * 4 + 3] > 128;
    if (solid && start < 0) start = x;
    else if (!solid && start >= 0) {
      end = x;
      break;
    }
  }
  if (start < 0 || end < 0) throw new Error("stem not found");
  const box = text.getExtentOfChar(NAME.indexOf("H"));
  const point = new DOMPoint(
    box.x + (start + end) / 2 - 20,
    BASELINE - midCap,
  ).matrixTransform(text.getScreenCTM()!);
  const rect = wrap.getBoundingClientRect();
  return `${point.x - rect.left}px ${point.y - rect.top}px`;
}

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [zoom, setZoom] = useState<{ origin: string } | null>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
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
      setVisible(false);
      document.documentElement.classList.remove("is-loading");
      preloaderStore.set(true);
    };
    revealRef.current = reveal;
    let finished = false;

    // Writes straight to the DOM: no React re-render per frame.
    const update = () => {
      if (finished) return;
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = ready || elapsed > MAX_WAIT ? eased : Math.min(eased, 0.92);

      if (typedRef.current) {
        typedRef.current.textContent = COMMAND.slice(
          0,
          Math.ceil(Math.min(p / 0.4, 1) * COMMAND.length),
        );
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current)
        pctRef.current.textContent = String(Math.floor(p * 100)).padStart(
          3,
          " ",
        );

      if (p >= 1) {
        finished = true;
        setDone(true);
        setTimeout(() => {
          if (reduced) {
            reveal();
            return;
          }
          let origin = "50% 60%";
          try {
            if (textRef.current && nameRef.current)
              origin = stemOrigin(textRef.current, nameRef.current);
          } catch {
            // Fall back to the centre if the font can't be measured.
          }
          setZoom({ origin });
        }, 450);
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
            {/* The name is stroked in like a pen signature (CSS keyframes), then we fly into it. */}
            <motion.div
              ref={nameRef}
              className="relative w-[min(92vw,900px)] will-change-transform"
              style={{ transformOrigin: zoom?.origin ?? "50% 50%" }}
              animate={zoom ? { scale: ZOOM_SCALE } : { scale: 1 }}
              transition={{ duration: 1, ease: [0.7, 0, 0.84, 0] }}
              onAnimationComplete={() => zoom && revealRef.current()}
            >
              <svg
                viewBox="0 0 1000 240"
                className="w-full overflow-visible"
                aria-label="Erik Hein"
              >
                <text
                  ref={textRef}
                  className="signature-draw"
                  x="500"
                  y="178"
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                  fontWeight="800"
                  fontSize="150"
                  stroke="var(--signal)"
                  strokeWidth="1.4"
                  fill="var(--signal)"
                >
                  {NAME}
                </text>
              </svg>
            </motion.div>

            <motion.div
              className="mt-10 w-[min(92vw,30rem)] font-mono text-[0.78rem] leading-relaxed text-paper/70"
              animate={{ opacity: zoom ? 0 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <p>
                <span className="text-signal">~ $</span> <span ref={typedRef} />
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-paper/15">
                  <div
                    ref={fillRef}
                    className="absolute inset-0 origin-left rounded-full bg-signal will-change-transform"
                    style={{ transform: "scaleX(0)" }}
                  />
                </div>
                <span className="w-10 whitespace-pre text-right tabular-nums">
                  <span ref={pctRef}>{"  0"}</span>%
                </span>
              </div>
              <p
                className={`mt-1 transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`}
              >
                <span className="text-signal">✓</span> ready. welcome in.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="code-label flex justify-between p-5 text-paper/40 md:p-8"
            animate={{ opacity: zoom ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <span>{"// engineer × designer"}</span>
            <span>san francisco, ca</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
