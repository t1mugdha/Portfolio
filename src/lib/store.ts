/**
 * Tiny global store (no dependency). Readable from DOM components and from
 * inside the WebGL canvas alike.
 */
import { useSyncExternalStore } from 'react';

export type SectionId = 'projects' | 'quests' | 'loadout' | 'about' | 'arcade' | 'contact';
export type ToyId = 'duck' | 'chair' | 'fridge' | 'pc';

export interface AppState {
  /** boot → room. 'flat' is the no-3D version. */
  phase: 'boot' | 'room' | 'flat';
  /** Assets loaded (0..1). */
  progress: number;
  section: SectionId | null;
  project: string | null;
  hovered: string | null;
  sound: boolean;
  reducedMotion: boolean;
  /** Bumped whenever a toy is poked, so scenes can react. */
  pokes: Record<ToyId, number>;
  duckLine: string | null;
  toast: string | null;
}

function readPref<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`mugdha:${key}`);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
export function writePref(key: string, value: unknown) {
  try {
    localStorage.setItem(`mugdha:${key}`, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

let state: AppState = {
  phase: 'boot',
  progress: 0,
  section: null,
  project: null,
  hovered: null,
  sound: readPref('sound', true),
  reducedMotion: readPref<boolean | null>('reducedMotion', null) ?? motionQuery?.matches ?? false,
  pokes: { duck: 0, chair: 0, fridge: 0, pc: 0 },
  duckLine: null,
  toast: null,
};
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
    const next = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useApp<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()), () => selector(store.get()));
}

let toastTimer: number | undefined;
export function toast(msg: string, ms = 2600) {
  store.set({ toast: msg });
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => store.set({ toast: null }), ms);
}
