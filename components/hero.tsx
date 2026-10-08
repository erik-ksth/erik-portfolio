"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useKeysAssembled, usePreloaderDone } from "@/lib/store";
import { RevealLines } from "./ui/reveal";
import { useScrollTo } from "./smooth-scroll";

const KeysScene = dynamic(() => import("./three/keys-scene"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const ready = usePreloaderDone();
  const assembled = useKeysAssembled();
  const scrollTo = useScrollTo();
  const { ref, inView } = useInView({ threshold: 0 });

  return (
    <section ref={ref} id="home" className="relative h-[100svh] min-h-[620px] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        // Lands from slightly "too close" so the preloader's zoom carries through.
        initial={{ opacity: 0, scale: 1.12 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        data-cursor={assembled ? "scramble" : "spell it"}
      >
        <KeysScene active={inView} play={ready} />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 grid gap-6 px-4 pb-6 md:grid-cols-12 md:px-8 md:pb-10">
        <div className="md:col-span-8">
          <h1 className="font-display text-[clamp(1.9rem,3.6vw,3.9rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            <RevealLines
              play={ready}
              delay={0.5}
              lines={[
                "I build products",
                <>
                  with a <span className="mark">creative</span> edge.
                </>,
              ]}
            />
          </h1>
        </div>

        <motion.div
          className="flex flex-col gap-5 md:col-span-4 md:items-end md:justify-end md:text-right"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease, delay: 0.9 }}
        >
          <p className="max-w-[17rem] text-[0.95rem] leading-snug text-muted">
            Software engineer at Iditor, shipping products end to end in San
            Francisco.
          </p>
          <div className="pointer-events-auto flex gap-3">
            <button onClick={() => scrollTo("#work")} className="key key-dark">
              see work <span aria-hidden>↓</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
