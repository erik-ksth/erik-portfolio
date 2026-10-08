"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { email, links, socials } from "@/lib/data";
import { keysAssembledStore, paletteStore, usePaletteOpen } from "@/lib/store";
import { useScrollTo } from "./smooth-scroll";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpRightIcon, ReturnIcon } from "./ui/icons";
import { play } from "@/lib/sound";

type Item = { group: string; label: string; hint: string; run: () => void };

const ease = [0.22, 1, 0.36, 1] as const;

// The site menu, as a ⌘K command palette: searchable and fully keyboard driven.
export default function CommandPalette() {
  const open = usePaletteOpen();
  const scrollTo = useScrollTo();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const items = useMemo<Item[]>(
    () => [
      ...links.map((l, i) => ({
        group: "Go to",
        label: l.name,
        hint: `0${i + 1}`,
        run: () => scrollTo(l.hash === "#home" ? 0 : l.hash),
      })),
      {
        group: "Actions",
        label: "Copy email address",
        hint: "copy",
        run: () => {
          navigator.clipboard?.writeText(email);
          toast.success("Email copied");
        },
      },
      {
        group: "Actions",
        label: "Open résumé",
        hint: "pdf",
        run: () => window.open("/Erik Hein Resume.pdf", "_blank"),
      },
      {
        group: "Actions",
        label: "Scramble the keycaps",
        hint: "play",
        run: () => {
          scrollTo(0);
          keysAssembledStore.set(!keysAssembledStore.get());
        },
      },
      ...socials.map((s) => ({
        group: "Elsewhere",
        label: s.name,
        hint: "external",
        run: () => window.open(s.href, "_blank", "noopener,noreferrer"),
      })),
    ],
    [scrollTo]
  );

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        paletteStore.set(!paletteStore.get());
      } else if (e.key === "Escape") {
        paletteStore.set(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = (item?: Item) => {
    if (!item) return;
    paletteStore.set(false);
    item.run();
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[950] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => paletteStore.set(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_40px_100px_-30px_rgba(10,10,10,0.6)]"
            initial={{ y: 16, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            data-lenis-prevent
          >
            <div className="flex items-center gap-3 border-b border-ink/10 px-5">
              <span className="font-mono text-ink">›</span>
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    play("tick", active + 1);
                    setActive((a) => Math.min(a + 1, filtered.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    play("tick", active - 1);
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter") {
                    select(filtered[active]);
                  }
                }}
                placeholder="Where to? Type a command…"
                className="h-14 flex-1 bg-transparent text-[1.05rem] outline-none placeholder:text-muted"
                aria-label="Search commands"
              />
              <span className="kbd">esc</span>
            </div>

            <ul ref={list} className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center font-mono text-sm text-muted">no matches for “{query}”</li>
              )}
              {filtered.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <li key={item.group + item.label}>
                    {header && <p className="code-label px-3 pb-1 pt-3 text-muted">{`// ${header.toLowerCase()}`}</p>}
                    <button
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => select(item)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[1.05rem] transition-colors ${
                        i === active ? "bg-signal text-ink" : "text-ink"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`font-mono text-xs ${i === active ? "text-ink" : "text-muted"}`}>
                        {i === active ? (
                          <ReturnIcon />
                        ) : item.hint === "external" ? (
                          <ArrowUpRightIcon />
                        ) : (
                          item.hint
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex gap-4 border-t border-ink/10 px-5 py-3 font-mono text-[0.7rem] text-muted">
              <span className="sm:hidden">tap an item to select</span>
              <span className="hidden items-center gap-1 sm:flex">
                <ArrowUpIcon className="h-3 w-3" />
                <ArrowDownIcon className="h-3 w-3" /> navigate
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <ReturnIcon className="h-3 w-3" /> select
              </span>
              <span className="ml-auto">
                <span className="font-display text-xs font-bold text-ink">ERIK HEIN</span> · menu
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
