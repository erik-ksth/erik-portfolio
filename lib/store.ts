"use client";

import { useSyncExternalStore } from "react";

// A minimal external store so DOM components and WebGL scenes (which live in
// separate React roots under <Canvas>) can share state without prop drilling.
function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export const COLORS = {
  paper: "#f4f4f1",
  ink: "#0a0a0a",
  night: "#0a0a0a",
  signal: "#ffd60a",
  graphite: "#8a8a85",
} as const;

export const preloaderStore = createStore(false);
export const cursorStore = createStore<string | null>(null);
export const paletteStore = createStore(false);
// true: keycaps line up to spell the name; false: they float as a loose cluster.
export const keysAssembledStore = createStore(false);

function useStore<T>(store: ReturnType<typeof createStore<T>>, server: T) {
  return useSyncExternalStore(store.subscribe, store.get, () => server);
}

export const usePreloaderDone = () => useStore(preloaderStore, false);
export const useCursorLabel = () => useStore(cursorStore, null);
export const usePaletteOpen = () => useStore(paletteStore, false);
export const useKeysAssembled = () => useStore(keysAssembledStore, false);
