"use client";

import { useState } from "react";

// Dev-only tool for tuning the skills keyboard's colours live. Pick colours,
// watch the 3D board update, then "copy" the palette as JSON to paste back.
// Rendered only in development (see skills.tsx), never on the live site.

export type Swatch = { body: string; legend: string };
export type Shell = { case: string; plate: string };

export default function PalettePicker<K extends string>({
  rows,
  palette,
  shell,
  onChange,
  onShell,
  onReset,
}: {
  rows: { key: K; label: string }[];
  palette: Record<K, Swatch>;
  shell: Shell;
  onChange: (key: K, part: keyof Swatch, value: string) => void;
  onShell: (part: keyof Shell, value: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const out = {
      ...Object.fromEntries(rows.map((r) => [r.key, palette[r.key]])),
      case: shell.case,
      plate: shell.plate,
    };
    await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const field = (value: string, set: (v: string) => void, title: string) => (
    <label className="flex items-center gap-1.5" title={title}>
      <input
        type="color"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-6 w-8 cursor-pointer rounded border border-black/10 bg-transparent p-0"
      />
      <span className="w-[4.2rem] font-mono text-[10px] text-black/50">{value}</span>
    </label>
  );

  return (
    <div className="fixed bottom-4 left-4 z-[9000] w-[22rem] rounded-xl border border-black/10 bg-white/95 text-ink shadow-2xl backdrop-blur">
      <button
        type="button"
        data-sound="none"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 font-mono text-xs"
      >
        <span>keyboard colours (dev only)</span>
        <span className="text-black/40">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <div className="border-t border-black/10 px-4 pb-4 pt-3">
          <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-x-3 font-mono text-[10px] uppercase text-black/40">
            <span />
            <span>keycap</span>
            <span>legend</span>
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                <span className="truncate text-xs font-medium">{r.label}</span>
                {field(palette[r.key].body, (v) => onChange(r.key, "body", v), `${r.label} keycap`)}
                {field(palette[r.key].legend, (v) => onChange(r.key, "legend", v), `${r.label} legend`)}
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-t border-black/10 pt-2">
              <span className="text-xs font-medium">Case / plate</span>
              {field(shell.case, (v) => onShell("case", v), "Case")}
              {field(shell.plate, (v) => onShell("plate", v), "Plate between keys")}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              data-sound="none"
              onClick={copy}
              className="flex-1 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-paper"
            >
              {copied ? "Copied!" : "Copy palette"}
            </button>
            <button
              type="button"
              data-sound="none"
              onClick={onReset}
              className="rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
