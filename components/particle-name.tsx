"use client";

import { useEffect, useRef } from "react";
import { play as playSound } from "@/lib/sound";

// The loading screen. Thousands of yellow particles swirl in a slow 3D galaxy;
// as the page loads they spiral in and settle into "Erik Hein", writing it from
// left to right. The finished name ripples away from the cursor, and when it's
// time to go every particle warps past the camera.
//
// Raw WebGL rather than three.js, so it starts before any heavy 3D code loads.
// Each particle's position is a pure function of time and progress, computed in
// the vertex shader, so the CPU does almost nothing per frame.

export type IntroApi = {
  update: (p: number) => void;
  // Plays the warp; resolves when it's time to fade the loader out.
  play: () => Promise<void>;
};

type Props = { register: (api: IntroApi) => void };

const NAME = "Erik Hein";
const LETTER_PARTICLES = 9000; // roughly; spacing adapts to the screen size
const AMBIENT_SHARE = 0.3; // extra particles that stay in the galaxy as dust
const WARP = 1.2; // seconds

const VERT = /* glsl */ `
attribute vec3 aTarget; // x, y in px from the centre; z = 1 for dust
attribute vec4 aSeed;
uniform vec2 uRes;
uniform float uDpr, uTime, uProgress, uExplode, uIntro, uSize, uHalfW;
uniform vec2 uMouse;
uniform float uMouseOn;
varying float vAlpha;
varying float vWhite;

const float D = 900.0; // camera distance

// A three-armed spiral galaxy, dense at the core, seen at an angle.
vec3 galaxy(vec4 s, float t) {
  float maxR = max(uRes.x, uRes.y) * 0.7;
  float r = mix(18.0, maxR, pow(s.x, 1.35)) + (s.w - 0.5) * 50.0;
  r *= mix(0.03, 1.0, 1.0 - pow(1.0 - uIntro, 3.0)); // burst out from the centre
  float arm = floor(s.z * 3.0) * 2.0944;
  float spread = (s.y - 0.5) * mix(0.35, 1.3, fract(s.w * 7.13));
  float a = arm + log(max(r, 1.0) / 18.0) * 1.7 + spread + t * (0.08 + 26.0 / (r + 60.0));
  float thick = (fract(s.x * 91.7) - 0.5) * 70.0 * (1.0 - r / (maxR * 1.2));
  vec3 p = vec3(cos(a) * r, thick + sin(a * 3.0 + t + s.w * 6.0) * 8.0, sin(a) * r);
  // Tilt the disc toward the camera.
  float c = cos(1.05);
  float sn = sin(1.05);
  return vec3(p.x, p.y * c - p.z * sn, (p.y * sn + p.z * c) * 0.5);
}

void main() {
  float t = uTime;
  float dust = aTarget.z;
  vec3 chaos = galaxy(aSeed, t);

  // Each letter particle settles at its own moment, sweeping left to right.
  float xn = clamp(aTarget.x / uHalfW * 0.5 + 0.5, 0.0, 1.0);
  float d = xn * 0.55 + aSeed.w * 0.2;
  float e = clamp((uProgress - d) / 0.2, 0.0, 1.0);
  e = (1.0 - dust) * (1.0 - pow(1.0 - e, 3.0));

  vec3 target = vec3(aTarget.xy, 0.0);
  target.xy += vec2(sin(t * 2.3 + aSeed.x * 50.0), cos(t * 1.9 + aSeed.y * 50.0)) * 0.5;

  // Spiral in: the remaining offset shrinks while it rotates.
  vec3 diff = chaos - target;
  float ang = e * 2.4;
  float ca = cos(ang);
  float sa = sin(ang);
  diff.xy = mat2(ca, sa, -sa, ca) * diff.xy;
  float k = 1.0 - e;
  vec3 p = target + diff * k * k;

  // Warp: everything rushes toward the camera at its own speed.
  float ex = uExplode * uExplode;
  p.z += ex * D * (0.25 + aSeed.x * 1.5);
  p.xy *= 1.0 + ex * aSeed.y * 0.8;
  p.z = min(p.z, D - 15.0);
  float scale = D / (D - p.z);
  vec2 screen = p.xy * scale;

  // The finished letters part around the cursor like sand.
  vec2 v = screen - uMouse;
  float dist = length(v) + 0.001;
  screen += v / dist * uMouseOn * e * (1.0 - ex) * 46.0 * exp(-dist * dist / 4200.0);

  // A brief flash as each particle lands.
  float since = uProgress - d - 0.2;
  float flash = (1.0 - dust) * step(0.0, since) * exp(-since * 16.0);

  gl_Position = vec4(screen / (uRes * 0.5) * vec2(1.0, -1.0), 0.0, 1.0);
  float size = dust > 0.5 ? uSize * 0.7 : uSize * mix(0.8, 1.0, e) * (1.0 + flash * 1.2);
  gl_PointSize = size * scale * uDpr;

  float a = dust > 0.5 ? mix(0.75, 0.18, uProgress) : mix(0.75, 1.0, e);
  a *= smoothstep(0.0, 0.6, uIntro);
  a *= 1.0 - smoothstep(0.6, 1.0, uExplode);
  vAlpha = a;
  float twinkle = step(0.92, aSeed.z) * (0.5 + 0.5 * sin(t * 5.0 + aSeed.y * 40.0));
  vWhite = max(twinkle * (1.0 - e * 0.7), flash);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying float vWhite;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.3, d) * vAlpha;
  vec3 col = mix(vec3(1.0, 0.839, 0.039), vec3(1.0, 0.97, 0.86), vWhite);
  gl_FragColor = vec4(col * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

// Draws the name offscreen and samples its pixels: every sample becomes the
// resting place of one particle. Coordinates are CSS px from the screen centre.
function sampleName(w: number) {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = `800 200px ${family}`;
  const width = Math.min(w * 0.88, 1100);
  const fontSize = (200 * width) / ctx.measureText(NAME).width;
  canvas.width = Math.ceil(width + 40);
  canvas.height = Math.ceil(fontSize * 1.3);
  ctx.font = `800 ${fontSize}px ${family}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(NAME, canvas.width / 2, canvas.height / 2);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let ink = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) ink++;
  const step = Math.max(1.4, Math.sqrt(ink / LETTER_PARTICLES));
  const points: number[] = [];
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const jx = x + (Math.random() - 0.5) * step * 0.6;
      const jy = y + (Math.random() - 0.5) * step * 0.6;
      const i = (Math.floor(jy) * canvas.width + Math.floor(jx)) * 4 + 3;
      if (data[i] > 128) points.push(jx - canvas.width / 2, jy - canvas.height / 2);
    }
  }
  return { points, step, halfW: width / 2 };
}

export default function ParticleName({ register }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLParagraphElement>(null);
  const progress = useRef(0);
  const explode = useRef<number | null>(null);

  useEffect(() => {
    register({
      update: (p) => (progress.current = p),
      play: () =>
        new Promise<void>((resolve) => {
          playSound("whoosh");
          explode.current = performance.now();
          // Hand over to the fade while the particles are still flying past.
          setTimeout(resolve, WARP * 650);
        }),
    });
  }, [register]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = el.getContext("webgl", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) {
      // No WebGL: just show the name.
      if (fallback.current) fallback.current.style.opacity = "1";
      return;
    }

    let raf = 0;
    let disposed = false;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, on: 0, son: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX - window.innerWidth / 2;
      mouse.y = e.clientY - window.innerHeight / 2;
      mouse.on = 1;
    };
    const onLeave = () => (mouse.on = 0);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);

    const start = async () => {
      // The name has to be drawn in the real font, so wait for it (briefly).
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1200))]);
      if (disposed) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      gl.viewport(0, 0, el.width, el.height);

      const { points, step, halfW } = sampleName(w);
      const letters = points.length / 2;
      const dust = Math.round(letters * AMBIENT_SHARE);
      const count = letters + dust;
      const target = new Float32Array(count * 3);
      const seed = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) {
        if (i < letters) {
          target[i * 3] = points[i * 2];
          target[i * 3 + 1] = points[i * 2 + 1];
        } else target[i * 3 + 2] = 1;
        for (let j = 0; j < 4; j++) seed[i * 4 + j] = Math.random();
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const attr = (name: string, data: Float32Array, size: number) => {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      };
      attr("aTarget", target, 3);
      attr("aSeed", seed, 4);
      const u = (name: string) => gl.getUniformLocation(prog, name);
      const uni = {
        res: u("uRes"),
        dpr: u("uDpr"),
        time: u("uTime"),
        progress: u("uProgress"),
        explode: u("uExplode"),
        intro: u("uIntro"),
        size: u("uSize"),
        halfW: u("uHalfW"),
        mouse: u("uMouse"),
        mouseOn: u("uMouseOn"),
      };
      gl.uniform2f(uni.res, w, h);
      gl.uniform1f(uni.dpr, dpr);
      gl.uniform1f(uni.size, step * 1.75);
      gl.uniform1f(uni.halfW, halfW);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      const born = performance.now();
      let last = born;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = (now - born) / 1000;
        const ease = 1 - Math.exp(-dt * 8);
        mouse.sx += (mouse.x - mouse.sx) * ease;
        mouse.sy += (mouse.y - mouse.sy) * ease;
        mouse.son += (mouse.on - mouse.son) * ease;
        const ex = explode.current ? Math.min(1, (now - explode.current) / 1000 / WARP) : 0;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uni.time, t);
        gl.uniform1f(uni.intro, reduced ? 1 : Math.min(1, t / 0.9));
        gl.uniform1f(uni.progress, reduced ? 1 : progress.current);
        gl.uniform1f(uni.explode, reduced ? 0 : ex);
        gl.uniform2f(uni.mouse, mouse.sx, mouse.sy);
        gl.uniform1f(uni.mouseOn, mouse.son);
        gl.drawArrays(gl.POINTS, 0, count);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    start().catch(() => {
      if (fallback.current) fallback.current.style.opacity = "1";
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
      <p
        ref={fallback}
        className="absolute inset-0 flex items-center justify-center font-display text-[clamp(3rem,14vw,10rem)] font-extrabold tracking-[-0.03em] text-signal opacity-0"
      >
        {NAME}
      </p>
      <span className="sr-only">{NAME}</span>
    </div>
  );
}
