"use client";

import { useEffect, useRef } from "react";
import { getAnalyser, setMusicOn, useMusicOn } from "@/lib/sound";

// Three soft dots that float up and down while the lofi plays, each on its own
// slow rhythm, lifting a little more when the music is louder. Off, they ease
// down into a flat, faded row.
function Dots({ on }: { on: boolean }) {
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const group = useRef<SVGGElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let level = 0;
    let loud = 0;
    const data = new Uint8Array(512);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      level += ((on ? 1 : 0) - level) * (1 - Math.exp(-dt * 3));

      let rms = 0;
      const analyser = getAnalyser();
      if (on && analyser) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < analyser.fftSize; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        rms = Math.min(Math.sqrt(sum / analyser.fftSize) * 5, 1);
      }
      loud += (rms - loud) * (1 - Math.exp(-dt * 6));

      const t = now / 1000;
      dots.current.forEach((d, i) => {
        const y = Math.sin(t * (1.6 + i * 0.37) + i * 1.9) * (2.4 + loud * 2) * level;
        d?.setAttribute("cy", String(12 - Math.abs(y) - level * 0.5));
      });
      group.current?.setAttribute("opacity", String(0.4 + 0.6 * level));

      if (on || level > 0.005) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <g ref={group} fill="var(--ink)" opacity="0.4">
        {[6.5, 12, 17.5].map((x, i) => (
          <circle
            key={x}
            ref={(el) => {
              dots.current[i] = el;
            }}
            cx={x}
            cy="12"
            r="1.9"
          />
        ))}
      </g>
    </svg>
  );
}

export default function SoundToggle() {
  const on = useMusicOn();
  return (
    <button
      onClick={() => setMusicOn(!on)}
      className="key !w-11 justify-center !px-0"
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Play music"}
      title={on ? "Turn music off" : "Play music"}
    >
      <Dots on={on} />
    </button>
  );
}
