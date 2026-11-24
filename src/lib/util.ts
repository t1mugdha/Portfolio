let webgl: boolean | null = null;
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    if (new URLSearchParams(location.search).has('nowebgl')) return (webgl = false);
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    webgl = !!gl;
  } catch {
    webgl = false;
  }
  return webgl;
}

export function isLowPower(): boolean {
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 4 || matchMedia('(max-width: 700px)').matches;
}

/** Resolve a public asset path against Vite's base (works when served from a sub-path). */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
