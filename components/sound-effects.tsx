"use client";

import { useEffect } from "react";
import { keysAssembledStore, paletteStore } from "@/lib/store";
import { initAudio, play, type SoundName } from "@/lib/sound";

const INTERACTIVE = "a, button, [data-sound]";
// Non-clickable elements can still sound on hover: data-hover="tick" data-hover-variant="3".
const HOVERABLE = `${INTERACTIVE}, [data-hover]`;

// Site-wide interaction sounds: a soft tick when the pointer reaches something
// clickable, a click when it's pressed, and whooshes for the menu and keycaps.
// Elements can opt into a specific sound with data-sound="open" etc., or out
// with data-sound="none".
export default function SoundEffects() {
  useEffect(() => {
    initAudio();
    let hovered: Element | null = null;

    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest<HTMLElement>(HOVERABLE);
      if (el && el !== hovered && el.dataset.sound !== "none") {
        if (el.dataset.hover) play(el.dataset.hover as SoundName, Number(el.dataset.hoverVariant ?? 0));
        else play("hover");
      }
      hovered = el;
    };
    const click = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>(INTERACTIVE);
      if (!el) return;
      const name = el.dataset.sound;
      if (name === "none") return;
      play((name as SoundName) || "click");
    };

    document.addEventListener("pointerover", over);
    document.addEventListener("click", click, true);
    const offPalette = paletteStore.subscribe(() => play(paletteStore.get() ? "open" : "close"));
    const offKeys = keysAssembledStore.subscribe(() => play("shuffle"));
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("click", click, true);
      offPalette();
      offKeys();
    };
  }, []);

  return null;
}
