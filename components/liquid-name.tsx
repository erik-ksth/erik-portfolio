"use client";

import { useEffect, useId, useRef, useState } from "react";

// The loading screen: the letters drop in, a stream of yellow pours into the
// "H" and fills the name like liquid (it sloshes with the cursor, and bubbles
// rise through it), then the stream cuts off. It also tells the preloader where
// to zoom ("origin", relative to the zoom wrapper): the same stem the stream
// poured into, so the fly-in follows the pour.

export type LoaderApi = {
  update: (p: number) => void;
  origin: (wrap: HTMLElement) => string;
};

type Props = { register: (api: LoaderApi) => void };

const NAME = "Erik Hein";
const FONT_SIZE = 150;
const BASELINE = 178;
const TOP = 60; // liquid level when full (just above the tallest letter)
const BOTTOM = 186; // liquid level when empty (just under the baseline)

// Letters drop in one after another, then the pour starts.
const STAGGER = 0.055;
const DROP = 320;
const POUR_AT = 0.5;
const FALL = 0.38; // seconds for the stream's leading edge to reach the bottom
// The preloader starts filling once the stream lands.
export const FILL_DELAY_MS = (POUR_AT + FALL) * 1000;

const BUBBLES = 16;
const DROPS = 22;
const RINGS = 8;
const GRAVITY = 1900;

type Glyph = { ch: string; x: number; w: number };
type Bubble = { x: number; y: number; r: number; speed: number; phase: number };
type Drop = { x: number; y: number; vx: number; vy: number; r: number };
type Ring = { x: number; y: number; r: number; age: number };

// The centre of the left stem of the "H", in SVG units, found by drawing the
// glyph offscreen with the same font and scanning one row of pixels.
const MID_CAP = FONT_SIZE * 0.18; // below the crossbar, so only the stem is hit
function stemX(text: SVGTextElement) {
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 220;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = `800 ${FONT_SIZE}px ${family || "sans-serif"}`;
  ctx.fillText("H", 20, 180);
  const row = ctx.getImageData(0, Math.round(180 - MID_CAP), canvas.width, 1).data;
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
  return text.getExtentOfChar(NAME.indexOf("H")).x + (start + end) / 2 - 20;
}

function stemOrigin(text: SVGTextElement, wrap: HTMLElement) {
  const point = new DOMPoint(stemX(text), BASELINE - MID_CAP).matrixTransform(
    text.getScreenCTM()!,
  );
  const rect = wrap.getBoundingClientRect();
  return `${point.x - rect.left}px ${point.y - rect.top}px`;
}

export default function LiquidName({ register }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const measure = useRef<SVGTextElement>(null);
  const wave = useRef<SVGPathElement>(null);
  const stream = useRef<SVGPathElement>(null);
  const dim = useRef<(SVGGElement | null)[]>([]);
  const lit = useRef<(SVGGElement | null)[]>([]);
  const bubbleEls = useRef<(SVGCircleElement | null)[]>([]);
  const dropEls = useRef<(SVGCircleElement | null)[]>([]);
  const ringEls = useRef<(SVGCircleElement | null)[]>([]);
  const level = useRef(0);
  // One clock for the whole intro, so re-measuring the letters (once the font
  // loads) doesn't restart the animation.
  const begin = useRef(0);
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const uid = useId().replace(/:/g, "");
  const liquidId = `loader-liquid-${uid}`;
  const lettersId = `loader-letters-${uid}`;

  // Each letter is its own element so it can drop in on its own; positions
  // come from the full name, so the spacing matches the real word.
  useEffect(() => {
    begin.current = performance.now();
    const read = () => {
      const t = measure.current;
      if (!t) return;
      const next: Glyph[] = [];
      for (let i = 0; i < NAME.length; i++) {
        if (NAME[i] === " ") continue;
        const box = t.getExtentOfChar(i);
        next.push({ ch: NAME[i], x: box.x, w: box.width });
      }
      setGlyphs((prev) =>
        prev.length === next.length && prev.every((g, i) => Math.abs(g.x - next[i].x) < 0.5)
          ? prev
          : next,
      );
    };
    read();
    document.fonts?.ready.then(read);
  }, []);

  useEffect(() => {
    register({
      update: (p) => (level.current = p),
      origin: (wrap) => (measure.current ? stemOrigin(measure.current, wrap) : "50% 60%"),
    });
  }, [register]);

  useEffect(() => {
    if (!glyphs.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Slosh: the surface tilts toward the cursor (or the phone's tilt) on a spring.
    let target = 0;
    let tilt = 0;
    let tiltVel = 0;
    let energy = 0;
    const onMove = (e: PointerEvent) => {
      target = (e.clientX / window.innerWidth) * 2 - 1;
      tiltVel += e.movementX * 0.06;
      energy = Math.min(1, energy + Math.abs(e.movementX) * 0.004);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma != null) target = Math.max(-1, Math.min(1, e.gamma / 35));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);

    let px = 500;
    try {
      if (measure.current) px = stemX(measure.current);
    } catch {
      // Fall back to the middle if the font can't be measured.
    }
    let screenTop = -700;
    let topKnown = false;
    const bubbles: Bubble[] = [];
    const drops: Drop[] = [];
    const rings: Ring[] = [];
    let cutAt = -1;
    let streamDone = false;
    let last = performance.now();
    let raf = 0;

    const surface = (x: number, base: number, t: number, p: number, pouring: boolean) => {
      const calm = Math.min(1, (1 - p) * 6); // perfectly flat and full at the end
      const swell = Math.sin(Math.PI * Math.min(p * 1.15, 1));
      const amp = (4 + 9 * energy) * swell;
      let y =
        base +
        tilt * 14 * ((x - 500) / 500) * calm +
        Math.sin(x * 0.012 + t * 2.4) * amp +
        Math.sin(x * 0.027 - t * 1.7) * amp * 0.45;
      if (pouring) {
        const d = Math.abs(x - px);
        y += Math.sin(d * 0.09 - t * 14) * 2.6 * Math.exp(-d / 110) * calm;
      }
      return y;
    };

    const insideLetter = (x: number) => glyphs.some((g) => x > g.x + 6 && x < g.x + g.w - 6);

    const draw = (now: number) => {
      const t = (now - begin.current) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = level.current;
      const base = BOTTOM - (BOTTOM - TOP) * p;

      // Letters: a damped bounce from above, each with a little spin.
      glyphs.forEach((g, i) => {
        const lt = reduced ? 10 : t - i * STAGGER;
        const k = lt < 0 ? 1 : Math.exp(-8 * lt);
        const dy = lt < 0 ? -DROP * 3 : -DROP * k * Math.cos(11 * lt);
        const rot = (i % 2 ? 1 : -1) * (8 + (i * 7) % 6) * k * Math.cos(11 * lt + 0.6);
        const tf = `translate(0 ${dy.toFixed(1)}) rotate(${rot.toFixed(2)} ${g.x + g.w / 2} ${BASELINE - 50})`;
        dim.current[i]?.setAttribute("transform", tf);
        lit.current[i]?.setAttribute("transform", tf);
      });

      // Slosh spring.
      tiltVel += ((target - tilt) * 55 - tiltVel * 5.5) * dt;
      tilt += tiltVel * dt;
      energy *= Math.exp(-1.6 * dt);

      // The stream: falls from the top of the screen, pours while loading,
      // then its tail drops away once the name is full.
      const pourT = t - POUR_AT;
      const pouring = !reduced && pourT > 0 && !streamDone;
      // Where the top of the screen is, in SVG units, so the stream starts there.
      if (!topKnown && pourT > 0 && svg.current) {
        topKnown = true;
        const ctm = svg.current.getScreenCTM();
        if (ctm) screenTop = new DOMPoint(0, 0).matrixTransform(ctm.inverse()).y - 40;
      }
      const hit = surface(px, base, t, p, pouring);
      const a = (2 * (BOTTOM - screenTop)) / (FALL * FALL);
      if (p >= 1 && cutAt < 0) cutAt = t;
      if (pouring) {
        const head = Math.min(hit, screenTop + 0.5 * a * pourT * pourT);
        const tail = cutAt < 0 ? screenTop : screenTop + 0.5 * a * (t - cutAt) ** 2;
        const landed = head >= hit - 0.5;
        if (tail >= hit) {
          streamDone = true;
          for (let n = 0; n < 7; n++) splash(px, hit, 1.2);
        }
        const wob = Math.sin(t * 23) * 0.7;
        const wTop = 3.4;
        const wBot = 2.4;
        stream.current?.setAttribute(
          "d",
          tail < head
            ? `M${px - wTop + wob} ${tail} L${px + wTop + wob} ${tail} L${px + wBot} ${head} L${px - wBot} ${head} Z`
            : "",
        );
        if (landed && Math.random() < dt * 34) splash(px, hit, 1);
      } else stream.current?.setAttribute("d", "");

      // Bubbles rise inside the letters and pop at the surface.
      if (!reduced && p > 0.06 && p < 0.99 && bubbles.length < BUBBLES && Math.random() < dt * 14) {
        const g = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = g.x + 8 + Math.random() * Math.max(1, g.w - 16);
        const top = surface(x, base, t, p, pouring);
        if (insideLetter(x) && BOTTOM - top > 18)
          bubbles.push({ x, y: BOTTOM - 4 - Math.random() * Math.min(40, BOTTOM - top - 14), r: 1.6 + Math.random() * 3.2, speed: 40 + Math.random() * 55, phase: Math.random() * 6 });
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed * dt;
        b.speed += 30 * dt;
        const bx = b.x + Math.sin(t * 6 + b.phase) * 1.4;
        if (b.y - b.r <= surface(bx, base, t, p, pouring)) {
          bubbles.splice(i, 1);
          if (rings.length < RINGS) rings.push({ x: bx, y: b.y - b.r, r: b.r, age: 0 });
        }
      }
      bubbleEls.current.forEach((el, i) => {
        const b = bubbles[i];
        if (!el) return;
        if (!b) return el.setAttribute("r", "0");
        el.setAttribute("cx", (b.x + Math.sin(t * 6 + b.phase) * 1.4).toFixed(1));
        el.setAttribute("cy", b.y.toFixed(1));
        el.setAttribute("r", b.r.toFixed(1));
      });

      // Pops: a tiny ring that grows and fades.
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].age += dt;
        if (rings[i].age > 0.22) rings.splice(i, 1);
      }
      ringEls.current.forEach((el, i) => {
        const r = rings[i];
        if (!el) return;
        if (!r) return el.setAttribute("r", "0");
        const k = r.age / 0.22;
        el.setAttribute("cx", r.x.toFixed(1));
        el.setAttribute("cy", r.y.toFixed(1));
        el.setAttribute("r", (r.r * (1 + 1.6 * k)).toFixed(1));
        el.setAttribute("stroke-opacity", (1 - k).toFixed(2));
      });

      // Splash droplets: thrown up from where the stream lands, then fall back in.
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += GRAVITY * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.vy > 0 && d.y >= surface(d.x, base, t, p, pouring)) drops.splice(i, 1);
      }
      dropEls.current.forEach((el, i) => {
        const d = drops[i];
        if (!el) return;
        if (!d) return el.setAttribute("r", "0");
        el.setAttribute("cx", d.x.toFixed(1));
        el.setAttribute("cy", d.y.toFixed(1));
        el.setAttribute("r", d.r.toFixed(1));
      });

      // The liquid itself. Nothing until the stream lands, so letters that
      // bounce below the baseline as they drop in don't dip into it.
      if (p <= 0) wave.current?.setAttribute("d", "M0 260 L1000 260 Z");
      else {
        let d = `M0 ${surface(0, base, t, p, pouring).toFixed(1)}`;
        for (let x = 20; x <= 1000; x += 20) d += ` L${x} ${surface(x, base, t, p, pouring).toFixed(1)}`;
        wave.current?.setAttribute("d", `${d} L1000 260 L0 260 Z`);
      }

      raf = requestAnimationFrame(draw);
    };

    function splash(x: number, y: number, force: number) {
      if (drops.length >= DROPS) return;
      const dir = Math.random() < 0.5 ? -1 : 1;
      drops.push({
        x: x + dir * (2 + Math.random() * 4),
        y: y - 2,
        vx: dir * (50 + Math.random() * 190) * force,
        vy: -(160 + Math.random() * 300) * force,
        r: 1.4 + Math.random() * 2.4,
      });
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [glyphs]);

  const font = {
    fontWeight: 800,
    fontSize: FONT_SIZE,
    style: { fontFamily: "var(--font-display)" },
  };
  return (
    <svg
      ref={svg}
      viewBox="0 0 1000 240"
      preserveAspectRatio="xMidYMid meet"
      className="w-full overflow-visible"
      aria-label={NAME}
    >
      <defs>
        <clipPath id={liquidId} clipPathUnits="userSpaceOnUse">
          <path ref={wave} d="M0 260 L1000 260 Z" />
        </clipPath>
        {/* The letters' resting shapes, so bubbles stay inside them. */}
        <clipPath id={lettersId} clipPathUnits="userSpaceOnUse">
          <text x={500} y={BASELINE} textAnchor="middle" {...font}>
            {NAME}
          </text>
        </clipPath>
      </defs>

      {/* Invisible copy of the whole word: the source of letter positions and the zoom target. */}
      <text ref={measure} x={500} y={BASELINE} textAnchor="middle" opacity={0} {...font}>
        {NAME}
      </text>

      {/* A dim, solid "empty glass". (Outlines would expose the font's overlapping inner contours.) */}
      <g fill="var(--signal)" fillOpacity={0.14}>
        {glyphs.map((g, i) => (
          <g key={i} ref={(el) => (dim.current[i] = el)} transform={`translate(0 ${-DROP * 3})`}>
            <text x={g.x} y={BASELINE} {...font}>
              {g.ch}
            </text>
          </g>
        ))}
      </g>

      <g clipPath={`url(#${liquidId})`}>
        <g fill="var(--signal)">
          {glyphs.map((g, i) => (
            <g key={i} ref={(el) => (lit.current[i] = el)} transform={`translate(0 ${-DROP * 3})`}>
              <text x={g.x} y={BASELINE} {...font}>
                {g.ch}
              </text>
            </g>
          ))}
        </g>
        <g clipPath={`url(#${lettersId})`} fill="#fff6c8" fillOpacity={0.75}>
          {Array.from({ length: BUBBLES }, (_, i) => (
            <circle key={i} ref={(el) => (bubbleEls.current[i] = el)} r={0} />
          ))}
        </g>
      </g>

      <g clipPath={`url(#${lettersId})`} fill="none" stroke="var(--signal)" strokeWidth={1.2}>
        {Array.from({ length: RINGS }, (_, i) => (
          <circle key={i} ref={(el) => (ringEls.current[i] = el)} r={0} />
        ))}
      </g>
      <path ref={stream} fill="var(--signal)" />
      <g fill="var(--signal)">
        {Array.from({ length: DROPS }, (_, i) => (
          <circle key={i} ref={(el) => (dropEls.current[i] = el)} r={0} />
        ))}
      </g>
    </svg>
  );
}
