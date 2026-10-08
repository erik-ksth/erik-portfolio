"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import toast from "react-hot-toast";
import { sendEmail } from "@/actions/sendEmail";
import { email, socials } from "@/lib/data";
import { FadeUp, RevealLines, SectionLabel } from "./ui/reveal";
import { ArrowUpRightIcon } from "./ui/icons";
import SubmitBtn from "./submit-btn";
import { useScrollTo } from "./smooth-scroll";
import { play } from "@/lib/sound";

const AuroraScene = dynamic(() => import("./three/aurora-scene"), { ssr: false });

function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time ?? "--:--"} PT</span>;
}

const footerLinks = [
  { label: "Work", target: "#work" },
  { label: "Résumé", href: "/Erik Hein Resume.pdf" },
  { label: "Experience", target: "#experience" },
  { label: "Back to top", target: 0 },
] as const;

const field =
  "w-full bg-transparent py-2 text-lg text-paper outline-none placeholder:text-paper/30";

export default function Contact() {
  const panel = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const scrollTo = useScrollTo();
  const { ref: inViewRef, inView } = useInView({ threshold: 0 });

  const { scrollYProgress } = useScroll({ target: panel, offset: ["start end", "end end"] });
  const wordmarkY = useTransform(scrollYProgress, [0.4, 1], ["35%", "0%"]);

  return (
    <section id="contact">
      <div
        ref={(el) => {
          (panel as React.MutableRefObject<HTMLDivElement | null>).current = el;
          inViewRef(el);
        }}
        className="relative overflow-hidden bg-night text-paper"
      >
        <div className="absolute inset-0">
          <AuroraScene active={inView} container={panel} />
        </div>

        <div className="relative px-4 pt-[16vh] md:px-8">
          <SectionLabel index="05" className="text-signal">
            contact
          </SectionLabel>
          <h2 className="mt-8 font-display text-[clamp(2rem,4.8vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            <RevealLines
              lines={[
                "Let's make something",
                <>
                  <span className="mark">worth</span> remembering.
                </>,
              ]}
              lineClassName={["", "md:pl-[16vw]"]}
            />
          </h2>

          <div className="mt-[10vh] grid gap-14 md:grid-cols-12 md:gap-8">
            <FadeUp className="space-y-10 md:col-span-5">
              <div>
                <p className="code-label text-paper/40">{"// email"}</p>
                <a
                  href={`mailto:${email}`}
                  className="draw-link mt-2 inline-block text-[clamp(1.15rem,1.7vw,1.6rem)] tracking-[-0.02em]"
                  data-cursor="write"
                >
                  {email}
                </a>
              </div>
              <div>
                <p className="code-label text-paper/40">{"// elsewhere"}</p>
                <ul className="mt-3 border-t border-paper/10">
                  {socials.map((s) => (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between border-b border-paper/10 py-3 text-lg transition-colors hover:text-signal"
                      >
                        <span className="transition-transform duration-500 ease-out group-hover:translate-x-2">
                          {s.name}
                        </span>
                        <ArrowUpRightIcon className="h-4 w-4 text-paper/40 transition-colors group-hover:text-signal" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-10 font-mono text-xs text-paper/40">
                <div>
                  <p>{"// based in"}</p>
                  <p className="mt-1 font-display text-base font-bold text-paper">San Francisco, CA</p>
                </div>
                <div>
                  <p>{"// local time"}</p>
                  <p className="mt-1 font-display text-base font-bold text-paper">
                    <LocalTime />
                  </p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1} className="md:col-span-6 md:col-start-7">
              <form
                ref={form}
                className="overflow-hidden rounded-md border border-paper/10 bg-night/70 backdrop-blur-md"
                action={async (formData) => {
                  const { error } = await sendEmail(formData);
                  if (error) {
                    play("error");
                    toast.error(error);
                    return;
                  }
                  play("success");
                  toast.success("Message sent. Talk soon!");
                  form.current?.reset();
                }}
              >
                <div className="flex items-center justify-between border-b border-paper/10 px-4 py-2.5 font-mono text-xs">
                  <span className="rounded-sm bg-paper/10 px-2 py-0.5 text-paper/80">new-message.txt</span>
                  <span className="text-paper/40">unsaved</span>
                </div>
                <div className="space-y-2 p-5 md:p-7">
                  <label htmlFor="senderEmail" className="flex items-baseline gap-3 border-b border-paper/10 focus-within:border-signal">
                    <span className="w-20 shrink-0 font-mono text-sm text-signal">from:</span>
                    <input
                      id="senderEmail"
                      name="senderEmail"
                      type="email"
                      required
                      maxLength={500}
                      placeholder="you@company.com"
                      className={field}
                    />
                  </label>
                  <label htmlFor="message" className="flex items-baseline gap-3 border-b border-paper/10 pt-2 focus-within:border-signal">
                    <span className="w-20 shrink-0 font-mono text-sm text-signal">message:</span>
                    <textarea
                      id="message"
                      name="message"
                      required
                      maxLength={5000}
                      rows={5}
                      placeholder="A project, a role, or just an idea…"
                      className={`${field} resize-none`}
                    />
                  </label>
                  <div className="pt-6">
                    <SubmitBtn />
                  </div>
                </div>
              </form>
            </FadeUp>
          </div>

          <footer className="mt-[16vh]">
            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <p className="font-display text-[clamp(1.2rem,1.6vw,1.6rem)] font-semibold leading-[1.35] tracking-[-0.02em]">
                Built by Erik Hein in San Francisco.
                <br />
                Best enjoyed with the sound on.
              </p>
              <ul className="grid grid-cols-2 gap-x-14 gap-y-3 text-[1.05rem] text-paper/60">
                {footerLinks.map((l) => (
                  <li key={l.label}>
                    {"href" in l ? (
                      <a href={l.href} target="_blank" className="transition-colors hover:text-paper">
                        {l.label}
                      </a>
                    ) : (
                      <button onClick={() => scrollTo(l.target)} className="transition-colors hover:text-paper">
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-paper/10 pt-6 font-mono text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
              <a href={`mailto:${email}`} className="transition-colors hover:text-paper">
                {email}
              </a>
              <span>© {new Date().getFullYear()} Erik Hein</span>
            </div>
          </footer>
        </div>

        {/* The name, edge to edge, rising up and cropped by the bottom of the page. */}
        <div className="relative mt-[10vh] h-[19vw] overflow-hidden">
          <motion.p
            aria-hidden
            style={{ y: wordmarkY }}
            className="footer-wordmark select-none whitespace-nowrap text-center font-display text-[25.5vw] font-extrabold leading-[0.8] tracking-[-0.045em]"
          >
            Erik Hein
          </motion.p>
        </div>
      </div>
    </section>
  );
}
