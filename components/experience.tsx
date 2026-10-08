"use client";

import { motion } from "framer-motion";
import { experiencesData } from "@/lib/data";
import { RevealLines, SectionLabel } from "./ui/reveal";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Experience() {
  return (
    <section id="experience" className="px-4 py-[16vh] md:px-8">
      <SectionLabel index="04" className="text-muted">
        experience &amp; education
      </SectionLabel>
      <h2 className="mt-8 font-display text-[clamp(2rem,4.4vw,4.6rem)] font-bold leading-[1.05] tracking-[-0.03em]">
        <RevealLines
          lines={[
            "Where I've been",
            <>
              building <span className="mark">lately.</span>
            </>,
          ]}
          lineClassName={["", "md:pl-[16vw]"]}
        />
      </h2>

      <ul className="mt-16 border-t border-line">
        {experiencesData.map((item, i) => {
          const current = item.date.includes("present");
          return (
            <motion.li
              key={item.title + item.location}
              className="group relative overflow-hidden border-b border-line"
              // A soft tick that climbs in pitch row by row as you run down the list.
              data-hover="tick"
              data-hover-variant={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={{ duration: 0.8, ease, delay: (i % 4) * 0.05 }}
            >
              {/* Ink fill wipes in from the left on hover */}
              <div className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <div className="relative grid grid-cols-12 items-center gap-x-4 gap-y-1 px-1 py-5 transition-colors duration-500 group-hover:text-paper md:px-4 md:py-5">
                <span className="col-span-2 font-mono text-xs text-muted transition-colors duration-500 group-hover:text-signal md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-10 text-[clamp(1.1rem,1.6vw,1.5rem)] font-display font-bold leading-tight tracking-[-0.015em] transition-transform duration-500 ease-out group-hover:translate-x-2 md:col-span-5">
                  {item.title}
                </span>
                <span className="col-span-10 col-start-3 text-[0.95rem] text-muted transition-colors duration-500 group-hover:text-paper/70 md:col-span-4 md:col-start-auto">
                  {item.location}
                </span>
                <span className="col-span-10 col-start-3 flex items-center gap-2 font-mono text-sm md:col-span-2 md:col-start-auto md:justify-end">
                  {current && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                    </span>
                  )}
                  {item.date}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
