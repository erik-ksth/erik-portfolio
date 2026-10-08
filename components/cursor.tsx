"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useCursorLabel } from "@/lib/store";

// A small blend-mode dot that grows into a labelled pill over anything with a
// `data-cursor` attribute (or when a WebGL scene sets cursorStore).
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [domLabel, setDomLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const sceneLabel = useCursorLabel();
  const label = domLabel ?? sceneLabel;
  // Keep the last label's text while the pill shrinks away, so it never collapses empty.
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (label) setShown(label);
  }, [label]);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    // Labels can change while the pointer stays put (e.g. clicking the hero
    // flips "scramble" ↔ "spell it"), so re-read the attribute on every move
    // and again after each click once React has re-rendered.
    let target: Element | null = null;
    const read = () => {
      const el = target?.closest<HTMLElement>("[data-cursor]");
      setDomLabel(el?.dataset.cursor || null);
    };
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      target = e.target as Element;
      read();
    };
    const down = () => setPressed(true);
    const up = () => {
      setPressed(false);
      requestAnimationFrame(read);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
        style={{ x, y }}
        animate={{ scale: label ? 0 : pressed ? 0.6 : 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className="flex h-9 items-center whitespace-nowrap rounded-full bg-signal px-4 text-[0.75rem] font-semibold leading-none text-ink shadow-[0_8px_30px_-8px_rgba(10,10,10,0.35)]"
          // Centre via framer's own x/y so the scale animation can't override it.
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{ scale: label ? (pressed ? 0.9 : 1) : 0, opacity: label ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          {shown}
        </motion.div>
      </motion.div>
    </>
  );
}
