"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useScroll } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FadeUp, RevealLines, SectionLabel } from "./ui/reveal";
import { ArrowUpRightIcon } from "./ui/icons";
import { useScrollTo } from "./smooth-scroll";

const MorphSheetScene = dynamic(() => import("./three/morph-sheet-scene"), { ssr: false });

const PHOTO = "/about-mountains.jpg";

const facts = [
  { label: "now", value: "Software Engineer, Iditor Inc." },
  { label: "building", value: "Solariz Studio LLC, founder" },
  { label: "studied", value: "B.S. Computer Science, San José State University" },
  { label: "based in", value: "San Francisco, CA" },
];

export default function About() {
  const scrollTo = useScrollTo();
  const thumb = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  // Render the sheet only while the section is on (or near) screen.
  const { ref: sectionRef, inView } = useInView({ threshold: 0, rootMargin: "20% 0px" });
  // 0 while the photo slot is below the fold, 1 once its top reaches 30% of the screen.
  const { scrollYProgress } = useScroll({ target: photo, offset: ["start 95%", "start 30%"] });

  return (
    <section ref={sectionRef} id="about" className="px-4 py-[16vh] md:px-8">
      {/* Full-screen layer that draws the photo flying from the thumbnail to the slot. */}
      <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden>
        {inView && (
          <MorphSheetScene src={PHOTO} progress={scrollYProgress} from={thumb} to={photo} active={inView} />
        )}
      </div>

      <SectionLabel index="01" className="text-muted">
        about
      </SectionLabel>

      <div className="mt-8 flex items-end justify-between gap-8">
        <h2 className="font-display text-[clamp(2rem,4.4vw,4.6rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          <RevealLines
            lines={[
              "Chasing better views,",
              <>
                on screen <span className="mark">and off.</span>
              </>,
            ]}
            lineClassName={["", "md:pl-[16vw]"]}
          />
        </h2>
        {/* Where the photo starts: a small thumbnail beside the title. */}
        <div ref={thumb} className="mb-2 aspect-[3/2] w-[clamp(7rem,14vw,13rem)] shrink-0" />
      </div>

      <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-12 md:items-center md:gap-8">
        {/* The landing slot. The WebGL layer above draws the photo here once it arrives. */}
        <div className="md:col-span-7">
          <div
            ref={photo}
            role="img"
            aria-label="Erik Hein standing on a granite ridge with mountains behind him"
            className="relative aspect-[3/2]"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-10 md:col-span-4 md:col-start-9">
          <FadeUp className="space-y-4 text-[clamp(1.02rem,1.2vw,1.15rem)] leading-[1.65]">
            <p>
              I&apos;m Erik, a software engineer in San Francisco. I studied Computer Science at
              San José State University, and I&apos;m happiest where engineering meets design:
              building products end to end, from the database to the last pixel.
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <dl className="border-t border-line">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-3.5">
                  <dt className="code-label pt-0.5 text-muted">{f.label}</dt>
                  <dd className="text-[0.95rem] font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>

          <FadeUp delay={0.12} className="flex flex-wrap gap-3">
            <a href="/Erik Hein Resume.pdf" target="_blank" className="key key-dark">
              résumé <ArrowUpRightIcon />
            </a>
            <button onClick={() => scrollTo("#contact")} className="key">
              say hello
            </button>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
