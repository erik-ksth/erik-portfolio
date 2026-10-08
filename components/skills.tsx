"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { skillsDataCategorized } from "@/lib/data";
import { FadeUp, SectionLabel } from "./ui/reveal";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Drifts on its own, then speeds up, reverses and skews with scroll velocity.
function VelocityMarquee({ items, baseVelocity }: { items: readonly string[]; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [8, -8], { clamp: true });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    let move = direction.current * baseVelocity * (delta / 1000);
    move += direction.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          {/* Alternate full and muted words */}
          <span className={i % 2 ? "text-graphite" : ""}>{item}</span>
          <span className="mx-[0.45em] inline-block h-[0.2em] w-[0.2em] rounded-full bg-signal" />
        </span>
      ))}
    </span>
  );

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex font-display text-[clamp(1.7rem,3.6vw,3.6rem)] font-bold leading-[1.15] tracking-[-0.02em]"
        style={{ x, skewX: skew }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}

const rowA = [...skillsDataCategorized[0].skills, ...skillsDataCategorized[1].skills];
const rowB = skillsDataCategorized.slice(2).flatMap((c) => c.skills);

const keyName = (category: string) =>
  category
    .toLowerCase()
    .replace(/ & /g, "And")
    .replace(/\s(\w)/g, (_, c: string) => c.toUpperCase());

// The categorized stack, written as the file it would be.
function StackFile() {
  const Ln = ({ n }: { n: number }) => (
    <span className="w-8 shrink-0 select-none text-right text-paper/25">{n}</span>
  );
  return (
    <div className="overflow-hidden rounded-md bg-night font-mono text-[0.82rem] leading-[1.9] text-paper md:text-[0.9rem]">
      <div className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5 text-xs">
        <span className="rounded-sm bg-paper/10 px-2 py-0.5 text-paper/80">stack.ts</span>
        <span className="text-paper/40">typescript · {skillsDataCategorized.flatMap((c) => c.skills).length} entries</span>
      </div>
      <div className="overflow-x-auto px-2 py-4 md:px-4">
        <div className="flex gap-4">
          <Ln n={1} />
          <span>
            <span className="text-signal">export const</span> stack <span className="text-paper/40">=</span>{" "}
            <span className="text-paper/40">{"{"}</span>
          </span>
        </div>
        {skillsDataCategorized.map((group, i) => (
          <div key={group.category} className="flex gap-4">
            <Ln n={i + 2} />
            <span className="pl-5">
              <span className="text-paper">{keyName(group.category)}</span>
              <span className="text-paper/40">: [</span>
              {group.skills.map((skill, j) => (
                <Fragment key={skill}>
                  <span className="rounded-sm px-0.5 text-paper transition-colors hover:bg-signal hover:text-night">
                    &quot;{skill}&quot;
                  </span>
                  {j < group.skills.length - 1 && <span className="text-paper/40">, </span>}
                </Fragment>
              ))}
              <span className="text-paper/40">],</span>
            </span>
          </div>
        ))}
        <div className="flex gap-4">
          <Ln n={skillsDataCategorized.length + 2} />
          <span>
            <span className="text-paper/40">{"}"}</span> <span className="text-signal">as const</span>
            <span className="text-paper/40">;</span>{" "}
            <span className="text-paper/30">{"// always learning, always shipping"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-[16vh]">
      <div className="flex items-end justify-between gap-8 px-4 md:px-8">
        <SectionLabel index="03" className="text-muted">
          capabilities
        </SectionLabel>
        <p className="hidden max-w-xs text-right text-muted md:block">
          A full-stack toolkit, from pixels to pipelines to production.
        </p>
      </div>

      <div className="mt-10 select-none" aria-hidden>
        <VelocityMarquee items={[...rowA, ...rowB]} baseVelocity={-1.2} />
      </div>

      <FadeUp className="mx-4 mt-16 md:mx-8 lg:mx-auto lg:max-w-5xl">
        <StackFile />
      </FadeUp>
    </section>
  );
}
