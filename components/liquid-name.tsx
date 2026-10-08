"use client";

import { useEffect, useId, useRef } from "react";

// The loading screen's progress: the name fills up with yellow like liquid.
// It also tells the preloader where to zoom ("origin", relative to the zoom
// wrapper) so the final fly-in lands inside solid yellow.

export type LoaderApi = {
  update: (p: number) => void;
  origin: (wrap: HTMLElement) => string;
};

type Props = { register: (api: LoaderApi) => void };

const NAME = "Erik Hein";
const FONT_SIZE = 150;
const BASELINE = 178;

// The centre of the left stem of the "H" in the SVG name, found by drawing the
// glyph offscreen with the same font and scanning one row of pixels.
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
  const midCap = FONT_SIZE * 0.18; // below the crossbar, so only the stem is hit
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

export default function LiquidName({ register }: Props) {
  const text = useRef<SVGTextElement>(null);
  const wave = useRef<SVGPathElement>(null);
  const level = useRef(0);
  const clipId = `loader-liquid-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    register({
      update: (p) => (level.current = p),
      origin: (wrap) =>
        text.current ? stemOrigin(text.current, wrap) : "50% 60%",
    });
    let raf = 0;
    const top = 50;
    const bottom = 186;
    const draw = (now: number) => {
      // The parent already supplies eased progress. Reading it directly keeps
      // the fill accurate even when a mobile browser drops animation frames.
      const p = level.current;
      const y = bottom - (bottom - top) * p;
      const amp = 7 * Math.sin(Math.PI * Math.min(p * 1.15, 1)); // calm at empty and full
      const t = now / 1000;
      let d = `M0 ${y}`;
      for (let x = 0; x <= 1000; x += 20) {
        const yy =
          y +
          Math.sin(x * 0.012 + t * 2.4) * amp +
          Math.sin(x * 0.027 - t * 1.7) * amp * 0.45;
        d += ` L${x} ${yy.toFixed(1)}`;
      }
      d += " L1000 240 L0 240 Z";
      wave.current?.setAttribute("d", d);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [register]);

  const common = {
    x: 500,
    y: BASELINE,
    textAnchor: "middle" as const,
    fontWeight: 800,
    fontSize: FONT_SIZE,
    style: { fontFamily: "var(--font-display)" },
  };
  return (
    <svg
      viewBox="0 0 1000 240"
      preserveAspectRatio="xMidYMid meet"
      className="w-full overflow-visible"
      aria-label={NAME}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path ref={wave} d="M0 240 L1000 240 Z" />
        </clipPath>
      </defs>
      {/* A dim, solid "empty glass". (Outlines would expose the font's overlapping inner contours.) */}
      <text ref={text} {...common} fill="var(--signal)" fillOpacity="0.14">
        {NAME}
      </text>
      <text {...common} fill="var(--signal)" clipPath={`url(#${clipId})`}>
        {NAME}
      </text>
    </svg>
  );
}
