"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { skillsDataCategorized } from "@/lib/data";
import { keyClack, type KeyTone } from "@/lib/sound";
import { SKILL_LOGOS, SKILL_MONOGRAMS } from "@/lib/skill-icons";
import { FadeUp, SectionLabel } from "./ui/reveal";
import type { BoardKey } from "./three/keyboard-scene";
import type { Shell, Swatch } from "./palette-picker";

const KeyboardScene = dynamic(() => import("./three/keyboard-scene"), { ssr: false });
// Colour tuning panel: only while developing, and only when asked for with
// ?colors in the URL (e.g. localhost:3100/?colors).
const PalettePicker = dynamic(() => import("./palette-picker"), { ssr: false });
const DEV = process.env.NODE_ENV === "development";

// Sixty skills, one 60% keyboard. Every key is a skill, laid out by category
// (languages on the number row, AI as the yellow accent row, tools as the
// modifiers), and it answers the visitor's real keyboard: type, and the key
// under your finger goes down with a clack and names itself.
//
// All the text is real DOM text, plus a plain list for screen readers, so
// search engines and AI agents still read the whole stack.

type KeyDef = { code: string; w: number };
// A keycap colourway per category, like a custom keycap set.
type Colorway = "butter" | "lemon" | "cream" | "sun" | "peach" | "lavender" | "mint";
type Cap = KeyDef & { skill?: string; category?: string; tone: Colorway };

const ROWS: KeyDef[][] = [
  [
    { code: "Backquote", w: 1 },
    ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => ({ code: `Digit${d}`, w: 1 })),
    { code: "Minus", w: 1 },
    { code: "Equal", w: 1 },
    { code: "Backspace", w: 2 },
  ],
  [
    { code: "Tab", w: 1.5 },
    ..."QWERTYUIOP".split("").map((c) => ({ code: `Key${c}`, w: 1 })),
    { code: "BracketLeft", w: 1 },
    { code: "BracketRight", w: 1 },
    { code: "Backslash", w: 1.5 },
  ],
  [
    { code: "CapsLock", w: 1.75 },
    ..."ASDFGHJKL".split("").map((c) => ({ code: `Key${c}`, w: 1 })),
    { code: "Semicolon", w: 1 },
    { code: "Quote", w: 1 },
    { code: "Enter", w: 2.25 },
  ],
  [
    { code: "ShiftLeft", w: 2.25 },
    ..."ZXCVBNM".split("").map((c) => ({ code: `Key${c}`, w: 1 })),
    { code: "Comma", w: 1 },
    { code: "Period", w: 1 },
    { code: "Slash", w: 1 },
    { code: "ShiftRight", w: 2.75 },
  ],
  [
    { code: "ControlLeft", w: 1.25 },
    { code: "MetaLeft", w: 1.25 },
    { code: "AltLeft", w: 1.25 },
    { code: "Space", w: 6.25 },
    { code: "AltRight", w: 1.25 },
    { code: "MetaRight", w: 1.25 },
    { code: "ContextMenu", w: 1.25 },
    { code: "ControlRight", w: 1.25 },
  ],
];

// Which keys each category lives on, and its keycap colour.
const ZONES: Record<string, { codes: string[]; tone: Colorway }> = {
  Languages: { codes: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => `Digit${d}`), tone: "butter" },
  "Frontend & Mobile": {
    codes: [..."QWERTYUIOP".split("").map((c) => `Key${c}`), "BracketLeft", "BracketRight", "Backslash"],
    tone: "lemon",
  },
  "Data & Database": { codes: "ASDFGHJKL".split("").map((c) => `Key${c}`), tone: "cream" },
  "AI & ML": { codes: "ZXCVBNM".split("").map((c) => `Key${c}`), tone: "sun" },
  Backend: { codes: ["Backquote", "Minus", "Equal", "Backspace", "Enter"], tone: "peach" },
  Design: { codes: ["Semicolon", "Quote", "Comma", "Period"], tone: "lavender" },
  "Tools & Platforms": {
    codes: [
      "Tab",
      "CapsLock",
      "ShiftLeft",
      "ShiftRight",
      "ControlLeft",
      "MetaLeft",
      "AltLeft",
      "AltRight",
      "MetaRight",
      "ContextMenu",
      "ControlRight",
      // Beside right Shift, so the grey tools key sits with its neighbours.
      "Slash",
    ],
    tone: "mint",
  },
};

// On a Mac the bottom row runs control, option, command | space | command,
// option; on Windows it's Ctrl, Win, Alt | space | Alt, Win, Menu, Ctrl. Keys
// keep their codes, so the visitor's real keys still land in the right place.
const MAC_BOTTOM = ["ControlLeft", "AltLeft", "MetaLeft", "Space", "MetaRight", "AltRight", "ContextMenu", "ControlRight"];
function rowsFor(mac: boolean): KeyDef[][] {
  if (!mac) return ROWS;
  const bottom = ROWS[4];
  return [...ROWS.slice(0, 4), MAC_BOTTOM.map((code) => bottom.find((k) => k.code === code)!)];
}

// Mac keyboards spell their keys out in lowercase.
const MAC_LABELS: Record<string, string> = {
  Backspace: "delete",
  Tab: "tab",
  CapsLock: "caps lock",
  Enter: "return",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  ControlLeft: "control",
  ControlRight: "control",
  AltLeft: "option",
  AltRight: "option",
  MetaLeft: "⌘",
  MetaRight: "⌘",
  ContextMenu: "fn",
};

// What a key would normally say, printed on keys that don't hold a skill.
const KEY_LABELS: Record<string, string> = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Backspace: "Backspace",
  Tab: "Tab",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  CapsLock: "Caps",
  Semicolon: ";",
  Quote: "'",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  Comma: ",",
  Period: ".",
  Slash: "/",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  MetaLeft: "Win",
  MetaRight: "Win",
  AltLeft: "Alt",
  AltRight: "Alt",
  ContextMenu: "Menu",
};
const keyLabel = (code: string, mac: boolean) =>
  (mac ? MAC_LABELS[code] : undefined) ?? KEY_LABELS[code] ?? code.replace(/^(Key|Digit)/, "");

const TOTAL = skillsDataCategorized.reduce((n, g) => n + g.skills.length, 0);

// Long names go on the wide keys; the rest fill the zone in their listed order.
function buildCaps(): Map<string, Cap> {
  const width = new Map(ROWS.flat().map((k) => [k.code, k.w]));
  const caps = new Map<string, Cap>();
  for (const k of ROWS.flat()) caps.set(k.code, { ...k, tone: k.code === "Space" ? "butter" : "cream" });
  for (const group of skillsDataCategorized) {
    const zone = ZONES[group.category];
    if (!zone) continue;
    const skills: string[] = [...group.skills];
    const wide = zone.codes.filter((c) => (width.get(c) ?? 1) > 1).sort((a, b) => width.get(b)! - width.get(a)!);
    const longest = [...skills].sort((a, b) => b.length - a.length).slice(0, wide.length);
    const assign = (code: string, skill?: string) => {
      const base = caps.get(code)!;
      caps.set(code, { ...base, tone: zone.tone, skill, category: group.category });
    };
    wide.forEach((code, i) => assign(code, longest[i]));
    const rest = skills.filter((s) => !longest.includes(s));
    zone.codes.filter((c) => !wide.includes(c)).forEach((code, i) => assign(code, rest[i]));
  }
  return caps;
}

// The keycap set, as picked with the dev colour panel: signal yellow and white
// with an orange accent and grey modifiers. (The keys are just names; the
// colours are what count.) body/legend: the 3D cap and its print; sound: its clack.
const TONES: Record<Colorway, { body: string; legend: string; sound: KeyTone }> = {
  butter: { body: "#ffd500", legend: "#4a3a0e", sound: "signal" }, // Languages (and the spacebar)
  lemon: { body: "#ffffff", legend: "#4b4019", sound: "white" }, // Frontend & Mobile
  cream: { body: "#ffffff", legend: "#4d4636", sound: "white" }, // Data & Database
  sun: { body: "#ffffff", legend: "#3d2e00", sound: "white" }, // AI & ML
  peach: { body: "#ffd500", legend: "#5a3422", sound: "signal" }, // Backend
  lavender: { body: "#ffffff", legend: "#3c3150", sound: "white" }, // Design
  mint: { body: "#c2c2c2", legend: "#2f4433", sound: "graphite" }, // Tools & Platforms
};

const SHELL: Shell = { case: "#ffffff", plate: "#8c7f62" };

// Relative brightness of a #rrggbb colour, 0 (black) to 1 (white).
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

const defaultPalette = () =>
  Object.fromEntries(Object.entries(TONES).map(([k, t]) => [k, { body: t.body, legend: t.legend }])) as Record<
    Colorway,
    Swatch
  >;

// A skill's mark: its brand logo, or a letter monogram when there isn't one.
function Mark({ skill, className }: { skill: string; className: string }) {
  const logo = SKILL_LOGOS[skill];
  if (logo) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 fill-current ${className}`}>
        <path d={logo.path} />
      </svg>
    );
  }
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-[22%] border-[0.08em] border-current font-mono font-bold leading-none tracking-[-0.04em] ${className}`}>
      <span style={{ fontSize: "0.42em" }}>{SKILL_MONOGRAMS[skill] ?? skill.slice(0, 2)}</span>
    </span>
  );
}

export default function Skills() {
  const caps = useMemo(buildCaps, []);
  // Pressed keys and the hovered category live in refs: the 3D board reads
  // them every frame, so pressing a key doesn't re-render the page.
  const pressed = useRef<Set<string>>(new Set());
  const focusRef = useRef<string | null>(null);
  const [last, setLast] = useState<Cap | null>(null);
  const [focus, setFocusState] = useState<string | null>(null);
  const setFocus = (f: string | null) => {
    focusRef.current = f;
    setFocusState(f);
  };
  const [touchy, setTouchy] = useState(false);
  const interacted = useRef(false);
  const { ref, inView } = useInView({ threshold: 0.2 });
  const visible = useRef(false);
  visible.current = inView;

  // Lay the board out like the visitor's own keyboard.
  const [mac, setMac] = useState(false);
  useEffect(() => {
    setTouchy(!window.matchMedia("(hover: hover)").matches);
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    setMac(/mac|iphone|ipad/i.test(nav.userAgentData?.platform || navigator.platform || navigator.userAgent));
  }, []);

  // The live palette: the TONES defaults, unless tuned with the dev colour panel.
  const [palette, setPalette] = useState(defaultPalette);
  const [shell, setShell] = useState<Shell>(SHELL);
  const [tuning, setTuning] = useState(false);
  useEffect(() => {
    if (!DEV || !new URLSearchParams(window.location.search).has("colors")) return;
    setTuning(true);
    try {
      const saved = JSON.parse(localStorage.getItem("dev-keyboard-palette-v2") ?? "null");
      if (saved?.palette) setPalette(saved.palette);
      if (saved?.shell) setShell(saved.shell);
    } catch {
      // Nothing saved yet.
    }
  }, []);
  useEffect(() => {
    if (!tuning) return;
    try {
      localStorage.setItem("dev-keyboard-palette-v2", JSON.stringify({ palette, shell }));
    } catch {
      // Storage blocked: changes just won't survive a reload.
    }
  }, [palette, shell, tuning]);

  // Where every key sits on the board, in key units from its centre.
  const boardKeys = useMemo<BoardKey[]>(
    () =>
      rowsFor(mac).flatMap((row, r) => {
        let cursor = -7.5;
        return row.map((k) => {
          const cap = caps.get(k.code)!;
          const x = cursor + k.w / 2;
          cursor += k.w;
          const tone = palette[cap.tone];
          return {
            code: k.code,
            w: k.w,
            row: r,
            x,
            skill: cap.skill,
            label: cap.skill ? undefined : keyLabel(k.code, mac),
            space: k.code === "Space",
            category: cap.category,
            body: tone.body,
            legend: tone.legend,
            lum: luminance(tone.body),
          };
        });
      }),
    [caps, palette, mac],
  );

  const press = useCallback(
    (code: string, sound = true) => {
      const cap = caps.get(code);
      if (!cap) return;
      pressed.current.add(code);
      if (cap.skill || code === "Space") setLast(cap);
      if (sound) {
        const row = ROWS.find((r) => r.some((k) => k.code === code)) ?? [];
        const idx = row.findIndex((k) => k.code === code);
        keyClack(0.75, TONES[cap.tone].sound, (idx / Math.max(1, row.length - 1)) * 2 - 1);
      }
    },
    [caps],
  );
  const release = useCallback((code: string) => {
    pressed.current.delete(code);
  }, []);

  const userPress = useCallback(
    (code: string) => {
      interacted.current = true;
      press(code);
    },
    [press],
  );

  // The visitor's real keyboard plays the board while it's on screen.
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const down = (e: KeyboardEvent) => {
      if (!visible.current || typing(e.target) || !caps.has(e.code)) return;
      if (["Space", "Quote", "Slash", "Backspace"].includes(e.code)) e.preventDefault();
      interacted.current = true;
      if (!e.repeat) press(e.code);
    };
    const up = (e: KeyboardEvent) => release(e.code);
    const clear = () => pressed.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [caps, press, release]);

  // Until someone plays, a ghost types on its own (silently), so it's alive.
  useEffect(() => {
    if (!inView) return;
    const keys = Array.from(caps.values()).filter((c) => c.skill);
    let timer = 0;
    const tick = () => {
      if (!interacted.current) {
        const cap = keys[Math.floor(Math.random() * keys.length)];
        press(cap.code, false);
        window.setTimeout(() => release(cap.code), 140);
      }
      timer = window.setTimeout(tick, 1100 + Math.random() * 500);
    };
    timer = window.setTimeout(tick, 700);
    return () => window.clearTimeout(timer);
  }, [inView, caps, press, release]);

  return (
    <section id="skills" ref={ref} className="overflow-hidden py-[16vh]">
      <div className="px-4 md:px-8">
        <SectionLabel index="03" className="text-muted">
          capabilities
        </SectionLabel>
      </div>

      {/* What was just pressed, big. */}
      <div className="mt-10 flex min-h-[clamp(6.5rem,13vw,11rem)] flex-col justify-end px-4 md:px-8">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={last ? last.code : "idle"}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-40%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="code-label text-muted">
              {last ? `// ${last.code === "Space" ? "and counting" : last.category?.toLowerCase()}` : "// try it"}
            </p>
            <p className="mt-1 flex items-center gap-[0.25em] font-display text-[clamp(2.4rem,7vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
              {last?.skill && <Mark skill={last.skill} className="h-[0.8em] w-[0.8em] text-[0.8em]" />}
              {last ? (last.code === "Space" ? "Always learning." : last.skill) : touchy ? "Tap a key." : "Type anything."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Category legend: hover one to light up its keys. */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 px-4 md:px-8">
        {skillsDataCategorized.map((g) => {
          const zone = ZONES[g.category];
          return (
            <button
              key={g.category}
              type="button"
              onMouseEnter={() => setFocus(g.category)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(g.category)}
              onBlur={() => setFocus(null)}
              onClick={() => setFocus(focus === g.category ? null : g.category)}
              className={`flex items-center gap-2 font-mono text-xs transition-colors ${
                focus === g.category ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-[3px] border border-line"
                style={{ background: zone ? palette[zone.tone].body : undefined }}
              />
              {g.category.toLowerCase()} <span className="opacity-50">{g.skills.length}</span>
            </button>
          );
        })}
      </div>

      <FadeUp className="mt-4">
        <div className="overflow-x-auto [scrollbar-width:none] md:overflow-visible">
          <div className="mx-auto aspect-[16/7] min-w-[900px] max-w-[88rem] md:min-w-0">
            <KeyboardScene
              keys={boardKeys}
              pressed={pressed}
              focus={focusRef}
              onPress={userPress}
              onRelease={release}
              active={inView}
              caseColor={shell.case}
              plateColor={shell.plate}
            />
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-xs text-muted md:hidden">← swipe the keyboard →</p>
      </FadeUp>

      {tuning && (
        <PalettePicker
          rows={Object.entries(ZONES).map(([category, z]) => ({ key: z.tone, label: category }))}
          palette={palette}
          shell={shell}
          onChange={(key, part, value) =>
            setPalette((p) => ({ ...p, [key]: { ...p[key as Colorway], [part]: value } }))
          }
          onShell={(part, value) => setShell((s) => ({ ...s, [part]: value }))}
          onReset={() => {
            setPalette(defaultPalette());
            setShell(SHELL);
          }}
        />
      )}

      {/* The same stack as a plain list, for screen readers, search engines and agents. */}
      <div className="sr-only">
        <h2>Skills: {TOTAL} tools and technologies</h2>
        {skillsDataCategorized.map((g) => (
          <div key={g.category}>
            <h3>{g.category}</h3>
            <ul>
              {g.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
