"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { projectsData } from "@/lib/data";
import { SectionLabel } from "./ui/reveal";

const GalleryScene = dynamic(() => import("./three/gallery-scene"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;
const total = projectsData.length;

export default function Work() {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { ref: stageRef, inView } = useInView({ threshold: 0 });

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.round(p * (total - 1));
    if (next !== index) {
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    }
  });

  const project = projectsData[index];
  const open = (i: number) => window.open(projectsData[i].link, "_blank", "noopener,noreferrer");

  return (
    <section ref={section} id="work" className="relative bg-night" style={{ height: `${total * 42 + 100}vh` }}>
      {/* Accessible, crawlable list of the same projects */}
      <ul className="sr-only">
        {projectsData.map((p) => (
          <li key={p.title}>
            <a href={p.link}>
              {p.title}: {p.subtitle}. {p.description}
            </a>
          </li>
        ))}
      </ul>

      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden text-paper">
        <div className="absolute inset-0">
          <GalleryScene progress={scrollYProgress} active={inView} onSelect={open} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-20 md:px-8 md:pt-24">
          <SectionLabel index="02" className="text-signal">
            selected work
          </SectionLabel>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 grid gap-6 bg-gradient-to-t from-night via-night/80 to-transparent px-4 pb-6 pt-24 md:grid-cols-12 md:px-8 md:pb-10 md:pt-32">
          <div className="md:col-span-8">
            <div className="relative -mb-[0.2em] overflow-hidden pb-[0.2em]">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.h3
                  key={project.title}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%" }),
                    center: { y: "0%" },
                    exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%" }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease }}
                  className="font-display text-[clamp(1.8rem,3.4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em]"
                >
                  {project.title}
                </motion.h3>
              </AnimatePresence>
            </div>
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              <p className="mt-2 font-mono text-sm text-signal">{project.subtitle}</p>
              <p className="mt-3 hidden max-w-md text-[0.92rem] leading-relaxed text-paper/55 md:block">
                {project.description}
              </p>
              <p className="mt-4 font-mono text-xs leading-relaxed text-paper/50">
                {project.tags.map((tag, i) => (
                  <span key={tag}>
                    {i > 0 && <span className="text-signal"> · </span>}
                    {tag.toLowerCase()}
                  </span>
                ))}
              </p>
            </motion.div>
          </div>

          <div className="flex items-end justify-between gap-4 md:col-span-4 md:flex-col md:items-end">
            <p className="whitespace-nowrap font-mono text-sm leading-none tabular-nums">
              <span className="text-paper">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-paper/40"> / {String(total).padStart(2, "0")}</span>
            </p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="key key-signal pointer-events-auto"
            >
              open project <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        {/* Progress rail on the right edge */}
        <div className="pointer-events-none absolute right-2 top-1/2 h-40 w-px -translate-y-1/2 bg-paper/10 md:right-4">
          <motion.div className="h-full w-full origin-top bg-signal" style={{ scaleY: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
