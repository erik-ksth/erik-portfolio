"use client";

import { useSyncExternalStore } from "react";

// Every sound on the site is synthesized live with the Web Audio API: no audio
// files to download, nothing to license, and each hit can vary slightly.

export type SoundName =
  | "hover"
  | "click"
  | "tick"
  | "open"
  | "close"
  | "shuffle"
  | "whoosh"
  | "land"
  | "on"
  | "success"
  | "error";

export type KeyTone = "white" | "black" | "signal" | "graphite";

const MUSIC_KEY = "erik-music";

// Sound effects are always on. The header toggle controls only the lofi music,
// which is on by default and remembered per visitor. Browsers keep everything
// silent until the visitor's first click or key press, then it all starts.

// ---------- music on/off state (shared with React) ----------

let musicOn = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const musicStore = {
  get: () => musicOn,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useMusicOn() {
  return useSyncExternalStore(musicStore.subscribe, musicStore.get, () => false);
}

export function getMusicPref(): boolean {
  try {
    return localStorage.getItem(MUSIC_KEY) !== "off";
  } catch {
    return true;
  }
}

// ---------- audio graph ----------

type Graph = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
  reverb: GainNode; // send into the reverb
  noise: AudioBuffer;
  analyser: AnalyserNode; // taps the final mix for the header visualizer
};

let graph: Graph | null = null;
// Browsers only allow audio after the visitor has clicked or pressed a key.
let unlocked = false;

function makeNoise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// A generated room: stereo noise with an exponential tail.
function makeImpulse(ctx: AudioContext, seconds: number, decay: number) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}

function ensureGraph(): Graph | null {
  if (graph) return graph;
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.ratio.value = 4;
  compressor.connect(ctx.destination);

  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(compressor);

  const sfx = ctx.createGain();
  sfx.gain.value = 0.8;
  sfx.connect(master);

  const music = ctx.createGain();
  music.gain.value = 0;
  music.connect(master);

  const convolver = ctx.createConvolver();
  convolver.buffer = makeImpulse(ctx, 3.5, 2.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  convolver.connect(wet);
  wet.connect(master);
  const reverb = ctx.createGain();
  reverb.connect(convolver);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.6;
  compressor.connect(analyser);

  graph = { ctx, master, sfx, music, reverb, noise: makeNoise(ctx, 1), analyser };

  // Don't play to an empty room when the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) ctx.suspend();
    else if (unlocked) ctx.resume();
  });
  return graph;
}

// Call once on page load: the first click or key press anywhere wakes audio up.
let listening = false;
export function initAudio() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  const unlock = () => {
    const g = ensureGraph();
    if (!g) return;
    unlocked = true;
    if (g.ctx.state === "suspended" && !document.hidden) g.ctx.resume();
  };
  // Browsers only let audio start inside a real gesture. On touch screens that
  // is the finger lifting (pointerup/touchend), not pointerdown, so listen to all.
  for (const type of ["pointerdown", "pointerup", "touchend", "click", "keydown"])
    window.addEventListener(type, unlock, { capture: true });

  // Some browsers allow sound straight away (Safari/Firefox when the visitor
  // allows auto-play for the site, Chrome for sites they often play media on).
  // Try now so those visitors hear it without clicking first.
  const g = ensureGraph();
  if (!g) return;
  const track = () => {
    if (g.ctx.state === "running") unlocked = true;
  };
  g.ctx.addEventListener("statechange", track);
  track();
  if (g.ctx.state === "suspended") g.ctx.resume().catch(() => {});
}

type MusicIntro = { delay: number; fade: number };

// Turn the lofi on or off. `intro` controls how it eases in: wait `delay`
// seconds, then fade over `fade`. The fade only starts once audio is actually
// running (browsers may hold it until the first click), so it's never cut short.
export function setMusicOn(on: boolean, persist = true, intro: MusicIntro = { delay: 0.5, fade: 5 }) {
  musicOn = on;
  if (persist) {
    try {
      localStorage.setItem(MUSIC_KEY, on ? "on" : "off");
    } catch {
      // Private mode: the choice just won't be remembered.
    }
  }
  notify();
  const g = ensureGraph();
  if (!g) return;
  if (on) {
    const start = () => musicOn && startMusic(intro);
    if (g.ctx.state === "running") start();
    else {
      // Wait for the first interaction to unlock audio, then begin.
      const wait = () => {
        if (g.ctx.state === "running") {
          g.ctx.removeEventListener("statechange", wait);
          start();
        }
      };
      g.ctx.addEventListener("statechange", wait);
      if (unlocked) g.ctx.resume();
    }
  } else stopMusic();
}

// The live waveform of everything playing, or null before audio exists.
export function getAnalyser(): AnalyserNode | null {
  return graph?.analyser ?? null;
}

// ---------- building blocks ----------

function envelope(param: AudioParam, t: number, peak: number, attack: number, decay: number) {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(
  g: Graph,
  opts: {
    type?: OscillatorType;
    freq: number;
    to?: number;
    peak: number;
    attack?: number;
    decay: number;
    at?: number;
    out?: AudioNode;
    send?: number;
  }
) {
  const t = opts.at ?? g.ctx.currentTime;
  const attack = opts.attack ?? 0.002;
  const osc = g.ctx.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + attack + opts.decay);
  const amp = g.ctx.createGain();
  envelope(amp.gain, t, opts.peak, attack, opts.decay);
  osc.connect(amp);
  amp.connect(opts.out ?? g.sfx);
  if (opts.send) {
    const s = g.ctx.createGain();
    s.gain.value = opts.send;
    amp.connect(s);
    s.connect(g.reverb);
  }
  osc.start(t);
  osc.stop(t + attack + opts.decay + 0.05);
}

function noiseHit(
  g: Graph,
  opts: {
    type: BiquadFilterType;
    freq: number;
    to?: number;
    q?: number;
    peak: number;
    attack?: number;
    decay: number;
    at?: number;
    out?: AudioNode;
    send?: number;
  }
) {
  const t = opts.at ?? g.ctx.currentTime;
  const attack = opts.attack ?? 0.001;
  const src = g.ctx.createBufferSource();
  src.buffer = g.noise;
  const filter = g.ctx.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, t);
  if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, t + attack + opts.decay);
  filter.Q.value = opts.q ?? 1;
  const amp = g.ctx.createGain();
  envelope(amp.gain, t, opts.peak, attack, opts.decay);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(opts.out ?? g.sfx);
  if (opts.send) {
    const s = g.ctx.createGain();
    s.gain.value = opts.send;
    amp.connect(s);
    s.connect(g.reverb);
  }
  src.start(t, Math.random() * 0.5);
  src.stop(t + attack + opts.decay + 0.05);
}

function live(): Graph | null {
  const g = graph;
  if (!g || g.ctx.state !== "running") return null;
  return g;
}

// ---------- interface sounds ----------

export function play(name: SoundName, variant = 0) {
  const g = live();
  if (!g) return;
  const t = g.ctx.currentTime;
  switch (name) {
    case "hover":
      tone(g, { freq: 2600, to: 2300, peak: 0.018, decay: 0.03 });
      break;
    case "click":
      tone(g, { type: "triangle", freq: 1500, to: 720, peak: 0.11, decay: 0.06 });
      noiseHit(g, { type: "highpass", freq: 3200, peak: 0.04, decay: 0.018 });
      break;
    case "tick":
      tone(g, { freq: 880 + (variant % 8) * 70, to: 760 + (variant % 8) * 60, peak: 0.05, decay: 0.07, send: 0.15 });
      break;
    case "open":
      noiseHit(g, { type: "bandpass", freq: 400, to: 2600, q: 1.4, peak: 0.07, attack: 0.08, decay: 0.2 });
      tone(g, { freq: 520, to: 780, peak: 0.05, attack: 0.02, decay: 0.22, send: 0.3 });
      break;
    case "close":
      noiseHit(g, { type: "bandpass", freq: 2200, to: 450, q: 1.4, peak: 0.06, attack: 0.04, decay: 0.18 });
      tone(g, { freq: 700, to: 470, peak: 0.04, attack: 0.01, decay: 0.18 });
      break;
    case "shuffle":
      noiseHit(g, { type: "bandpass", freq: 900, to: 3000, q: 0.8, peak: 0.05, attack: 0.05, decay: 0.25 });
      break;
    case "whoosh":
      noiseHit(g, { type: "lowpass", freq: 250, to: 5000, q: 0.7, peak: 0.16, attack: 0.75, decay: 0.25 });
      tone(g, { freq: 110, to: 220, peak: 0.05, attack: 0.7, decay: 0.3 });
      break;
    case "land":
      tone(g, { freq: 70, to: 38, peak: 0.32, decay: 0.7 });
      noiseHit(g, { type: "lowpass", freq: 900, to: 200, peak: 0.12, decay: 0.35, send: 0.4 });
      break;
    case "on":
      tone(g, { freq: 660, peak: 0.06, decay: 0.25, send: 0.4 });
      tone(g, { freq: 990, peak: 0.05, decay: 0.35, at: t + 0.09, send: 0.4 });
      break;
    case "success":
      tone(g, { freq: 784, peak: 0.07, decay: 0.4, send: 0.5 });
      tone(g, { freq: 1175, peak: 0.06, decay: 0.6, at: t + 0.11, send: 0.5 });
      break;
    case "error":
      tone(g, { type: "triangle", freq: 330, to: 250, peak: 0.08, decay: 0.25 });
      break;
  }
}

// Play once audio is running: the click that unlocks audio resumes it a moment
// later, so a sound triggered by that same click would otherwise be lost.
export function playSoon(name: SoundName, maxWait = 400) {
  const g = graph;
  if (!g) return;
  if (g.ctx.state === "running") return play(name);
  const asked = performance.now();
  const wait = () => {
    if (g.ctx.state !== "running") return;
    g.ctx.removeEventListener("statechange", wait);
    if (performance.now() - asked < maxWait) play(name);
  };
  g.ctx.addEventListener("statechange", wait);
}

// ---------- keycaps ----------

// Between a dull thock and a bright ceramic clink: a firm, rounded "tok". A soft
// contact click excites a few mid-high resonances that ring only briefly, over a
// hint of low body, with the harsh top end filtered away.
const KEY_BASE: Record<KeyTone, number> = { white: 1250, black: 1050, signal: 1400, graphite: 1150 };
const MODES = [
  { ratio: 1, level: 1, decay: 0.12 },
  { ratio: 1.87, level: 0.5, decay: 0.07 },
  { ratio: 2.93, level: 0.25, decay: 0.04 },
];
let recentClacks: number[] = [];

export function keyClack(strength: number, keyTone: KeyTone, pan: number) {
  const g = live();
  if (!g) return;
  // Cap simultaneous hits so a big pile-up stays gentle.
  const now = g.ctx.currentTime;
  recentClacks = recentClacks.filter((t) => now - t < 0.08);
  if (recentClacks.length >= 4) return;
  recentClacks.push(now);

  const s = Math.min(Math.max(strength, 0), 1);
  const base = KEY_BASE[keyTone] * (0.95 + Math.random() * 0.1);
  const panner = g.ctx.createStereoPanner();
  panner.pan.value = Math.max(-0.9, Math.min(0.9, pan));
  const soften = g.ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 4200;
  soften.Q.value = 0.6;
  panner.connect(soften);
  soften.connect(g.sfx);

  // 1. A soft contact click.
  noiseHit(g, { type: "bandpass", freq: 2600, q: 1, peak: 0.05 * s, attack: 0.0004, decay: 0.004, out: panner });
  // 2. The short ring.
  MODES.forEach((m, i) => {
    tone(g, {
      freq: base * m.ratio * (1 + (Math.random() - 0.5) * 0.01),
      peak: 0.032 * s * m.level * (i === 0 ? 1 : 0.5 + 0.5 * s),
      attack: 0.0008,
      decay: m.decay * (0.7 + 0.4 * s),
      out: panner,
      send: i === 0 ? 0.05 : 0,
    });
  });
  // 3. A hint of body underneath, so it isn't thin.
  tone(g, { freq: 380, to: 340, peak: 0.04 * s, attack: 0.001, decay: 0.045, out: panner });
}

// ---------- lofi music ----------

// Everything is scheduled on a 16th-note grid a little ahead of time
// (the standard Web Audio "lookahead" pattern), with swing and small timing
// drift so it feels played rather than programmed.
const BPM = 74;
const STEP = 60 / BPM / 4;
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// ii–V–I–vi in C, voiced as warm 7th/9th chords. MIDI notes (60 = middle C).
const CHORDS = [
  { bass: 38, keys: [53, 57, 60, 64] }, // Dm9
  { bass: 43, keys: [53, 59, 62, 64] }, // G13
  { bass: 36, keys: [52, 55, 59, 62] }, // Cmaj9
  { bass: 45, keys: [55, 59, 60, 64] }, // Am9
];
const MELODY = [72, 74, 76, 79, 81]; // C major pentatonic, up high

type Lofi = { input: GainNode; crackle: AudioBufferSourceNode | null; wow: OscillatorNode };
let lofi: Lofi | null = null;
let schedTimer: number | null = null;
let step = 0;
let nextStepTime = 0;

// The "old tape" chain every instrument plays into: gentle saturation, a slowly
// wobbling delay (pitch wow), and a dark low-pass.
function buildLofi(g: Graph): Lofi {
  if (lofi) return lofi;
  const input = g.ctx.createGain();
  const shaper = g.ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 1.6) / Math.tanh(1.6);
  }
  shaper.curve = curve;
  const delay = g.ctx.createDelay(0.05);
  delay.delayTime.value = 0.012;
  const wow = g.ctx.createOscillator();
  wow.frequency.value = 0.45;
  const wowDepth = g.ctx.createGain();
  wowDepth.gain.value = 0.0011;
  wow.connect(wowDepth);
  wowDepth.connect(delay.delayTime);
  wow.start();
  const tapeLowpass = g.ctx.createBiquadFilter();
  tapeLowpass.type = "lowpass";
  tapeLowpass.frequency.value = 3200;
  tapeLowpass.Q.value = 0.5;
  input.connect(shaper);
  shaper.connect(delay);
  delay.connect(tapeLowpass);
  tapeLowpass.connect(g.music);
  lofi = { input, crackle: null, wow };
  return lofi;
}

// Vinyl surface noise: faint hiss plus random pops, looped.
function makeCrackle(ctx: AudioContext) {
  const seconds = 4;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < data.length; i++) {
    lp = lp * 0.97 + (Math.random() * 2 - 1) * 0.03;
    data[i] = lp * 0.5;
  }
  const pops = seconds * 9;
  for (let p = 0; p < pops; p++) {
    const at = Math.floor(Math.random() * (data.length - 200));
    const amp = (Math.random() < 0.15 ? 0.6 : 0.2) * (Math.random() < 0.5 ? -1 : 1);
    const len = 20 + Math.floor(Math.random() * 120);
    for (let k = 0; k < len; k++) data[at + k] += amp * Math.exp(-k / (len / 5)) * (Math.random() * 0.6 + 0.4);
  }
  return buffer;
}

function startCrackle(g: Graph, l: Lofi) {
  if (l.crackle) return;
  const src = g.ctx.createBufferSource();
  src.buffer = makeCrackle(g.ctx);
  src.loop = true;
  const hp = g.ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;
  const amp = g.ctx.createGain();
  amp.gain.value = 0.05;
  src.connect(hp);
  hp.connect(amp);
  amp.connect(g.music);
  src.start();
  l.crackle = src;
}

// A Rhodes-style electric piano: a sine whose brightness comes from a fast-
// decaying FM "tine" at the attack, then settles into a warm hum.
function epiano(g: Graph, out: AudioNode, midi: number, t: number, velocity: number, length: number) {
  const f = hz(midi);
  const carrier = g.ctx.createOscillator();
  carrier.frequency.value = f;
  carrier.detune.value = (Math.random() - 0.5) * 8;
  const mod = g.ctx.createOscillator();
  mod.frequency.value = f;
  const modDepth = g.ctx.createGain();
  modDepth.gain.setValueAtTime(f * 1.1 * velocity, t);
  modDepth.gain.exponentialRampToValueAtTime(f * 0.06 + 1, t + 0.5);
  mod.connect(modDepth);
  modDepth.connect(carrier.frequency);
  const amp = g.ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.05 * velocity, t + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.018 * velocity, t + 0.9);
  amp.gain.setValueAtTime(0.018 * velocity, t + length);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.45);
  carrier.connect(amp);
  amp.connect(out);
  const send = g.ctx.createGain();
  send.gain.value = 0.22;
  amp.connect(send);
  send.connect(g.reverb);
  carrier.start(t);
  mod.start(t);
  carrier.stop(t + length + 0.5);
  mod.stop(t + length + 0.5);
}

function bass(g: Graph, out: AudioNode, midi: number, t: number, length: number) {
  const osc = g.ctx.createOscillator();
  osc.frequency.value = hz(midi);
  const lp = g.ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  const amp = g.ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.16, t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.09, t + length);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.12);
  osc.connect(lp);
  lp.connect(amp);
  amp.connect(out);
  osc.start(t);
  osc.stop(t + length + 0.15);
}

function kick(g: Graph, out: AudioNode, t: number, velocity: number) {
  tone(g, { freq: 130, to: 46, peak: 0.42 * velocity, attack: 0.002, decay: 0.32, at: t, out });
}

function snare(g: Graph, out: AudioNode, t: number, velocity: number) {
  noiseHit(g, { type: "bandpass", freq: 1900, q: 0.9, peak: 0.13 * velocity, attack: 0.001, decay: 0.17, at: t, out, send: 0.3 });
  tone(g, { type: "triangle", freq: 200, to: 165, peak: 0.07 * velocity, decay: 0.07, at: t, out });
}

function hat(g: Graph, out: AudioNode, t: number, velocity: number) {
  noiseHit(g, { type: "highpass", freq: 7500, peak: 0.032 * velocity, attack: 0.0008, decay: 0.035 + Math.random() * 0.02, at: t, out });
}

// Swing: offbeat 8ths land late, offbeat 16ths a little late.
function swing(s: number) {
  if (s % 4 === 2) return STEP * 0.42;
  if (s % 2 === 1) return STEP * 0.22;
  return 0;
}

function scheduleStep(g: Graph, out: AudioNode, n: number, t0: number) {
  const bar = Math.floor(n / 16);
  const s = n % 16;
  const t = t0 + swing(s);
  const human = () => (Math.random() - 0.5) * 0.012;
  const chord = CHORDS[bar % CHORDS.length];
  const beat = STEP * 4;

  // Keys: a lazily strummed chord on the downbeat, a softer re-hit late in the bar.
  if (s === 0) chord.keys.forEach((k, i) => epiano(g, out, k, t + i * 0.022 + human(), 0.9, beat * 2.4));
  if (s === 11) chord.keys.slice(1).forEach((k, i) => epiano(g, out, k, t + i * 0.018 + human(), 0.55, beat * 1.1));

  // Bass: root on the one, again on the and-of-3, a fifth leading into the next bar.
  if (s === 0) bass(g, out, chord.bass, t, beat * 1.6);
  if (s === 10) bass(g, out, chord.bass, t, beat * 0.7);
  if (s === 14 && bar % 2 === 1) bass(g, out, chord.bass + 7, t, beat * 0.4);

  // A few melody notes now and then, decided per bar.
  if (s === 0) melodyBars.set(bar, Math.random() < 0.4);
  if (melodyBars.get(bar) && (s === 6 || s === 8 || s === 14) && Math.random() < 0.6) {
    epiano(g, out, MELODY[Math.floor(Math.random() * MELODY.length)], t + human(), 0.5, beat * 0.9);
  }

  // Drums come in after two bars of just keys and crackle.
  if (bar < 2) return;
  const pattern = bar % 2 === 0 ? [0, 7, 10] : [0, 10, 13];
  if (pattern.includes(s)) kick(g, out, t, s === 0 ? 1 : 0.75);
  if (s === 4 || s === 12) snare(g, out, t + 0.006, 1);
  if (s % 2 === 0) hat(g, out, t + human(), s % 4 === 0 ? 1 : 0.6 + Math.random() * 0.3);
}
const melodyBars = new Map<number, boolean>();

function scheduler() {
  const g = graph;
  if (!g || !musicOn || !lofi) return;
  // Audio clock is frozen while suspended (hidden tab); resync when it resumes.
  if (g.ctx.state !== "running") return;
  const now = g.ctx.currentTime;
  if (nextStepTime < now) nextStepTime = now + 0.08;
  while (nextStepTime < now + 0.25) {
    scheduleStep(g, lofi.input, step, nextStepTime);
    melodyBars.delete(Math.floor(step / 16) - 2);
    nextStepTime += STEP;
    step++;
  }
}

const MUSIC_LEVEL = 0.6;

function startMusic({ delay, fade }: MusicIntro) {
  const g = ensureGraph();
  if (!g || schedTimer !== null) return;
  const l = buildLofi(g);
  startCrackle(g, l);

  // Ease-in curve (slow at first, then rising): the lofi creeps in rather than starting.
  const now = g.ctx.currentTime;
  const gain = g.music.gain;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(0, now);
  const curve = new Float32Array(64);
  for (let i = 0; i < curve.length; i++) {
    const x = i / (curve.length - 1);
    curve[i] = MUSIC_LEVEL * x * x * (3 - 2 * x) * x;
  }
  gain.setValueCurveAtTime(curve, now + delay, fade);

  step = 0;
  nextStepTime = now + delay;
  schedTimer = window.setInterval(scheduler, 50);
}

function stopMusic() {
  if (schedTimer !== null) window.clearInterval(schedTimer);
  schedTimer = null;
  const g = graph;
  if (!g) return;
  const gain = g.music.gain;
  const now = g.ctx.currentTime;
  // Freeze wherever a fade-in had got to, then fade out from there.
  if (typeof gain.cancelAndHoldAtTime === "function") gain.cancelAndHoldAtTime(now);
  else {
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
  }
  gain.setTargetAtTime(0, now, 0.4);
  if (lofi?.crackle) {
    lofi.crackle.stop(g.ctx.currentTime + 1.5);
    lofi.crackle = null;
  }
}
