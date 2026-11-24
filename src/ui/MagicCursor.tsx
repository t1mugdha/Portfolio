import { useEffect, useRef } from 'react';
import { store } from '@/lib/store';

/**
 * A violet-blue ring with a glowing dot in the middle, in place of the mouse
 * pointer. Ring and dot move together; over anything clickable the ring
 * tightens around the dot. Moving the mouse draws a short neon streak that
 * fades within about a second.
 * Only on devices with a real mouse; touch screens keep their normal behaviour.
 * With reduced motion the cursor stays but the neon trail is off.
 */

const CLICKABLE = 'a[href], button, [role="button"], input, select, textarea, label, summary, [tabindex]:not([tabindex="-1"])';
const LIFE = 0.9; // seconds a trail point lives
const MAX_POINTS = 120;

interface Pt {
  x: number;
  y: number;
  t: number;
}

export function MagicCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = ring.current!;
    const dot = dotRef.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    document.documentElement.classList.add('magic-cursor');

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
    };
    resize();
    addEventListener('resize', resize);

    const pts: Pt[] = [];
    let mx = -100,
      my = -100,
      shown = false,
      small = false,
      down = false,
      raf = 0,
      lastTarget: EventTarget | null = null;

    const isClickable = (target: EventTarget | null) => {
      if (store.get().hovered) return true; // something in the 3D room
      const t = target as Element | null;
      return !!t?.closest?.(CLICKABLE);
    };

    const place = () => {
      const tf = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      el.style.transform = `${tf} scale(${down ? 0.85 : 1})`;
      dot.style.transform = tf;
      el.classList.toggle('is-small', small);
      dot.classList.toggle('is-small', small);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = '1';
        dot.style.opacity = '1';
      }
      lastTarget = e.target;
      small = isClickable(e.target);
      place();
      if (!store.get().reducedMotion) {
        pts.push({ x: mx, y: my, t: performance.now() / 1000 });
        if (pts.length > MAX_POINTS) pts.shift();
        kick();
      }
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = '0';
      dot.style.opacity = '0';
    };
    const onDown = () => {
      down = true;
      place();
    };
    const onUp = () => {
      down = false;
      place();
    };
    // The 3D hover state can change without the mouse moving (camera easing, toys).
    const unsub = store.subscribe(() => {
      const want = isClickable(lastTarget);
      if (want !== small && shown) {
        small = want;
        place();
      }
    });

    const frame = () => {
      const now = performance.now() / 1000;
      while (pts.length && now - pts[0]!.t > LIFE) pts.shift();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Draw the trail as a few continuous strokes (oldest → newest), each a
      // little thicker and brighter, so it tapers without beading at joints.
      // Two passes: a wide soft glow, then a thin bright core.
      const BANDS = 8;
      for (const pass of [0, 1] as const) {
        for (let band = 0; band < BANDS; band++) {
          const lo = band / BANDS;
          const hi = (band + 1) / BANDS;
          ctx.beginPath();
          let started = false;
          let kMid = 0;
          for (let i = 0; i < pts.length; i++) {
            const p = pts[i]!;
            const k = Math.max(0, 1 - (now - p.t) / LIFE); // 1 new → 0 old
            const next = pts[i + 1];
            const kNext = next ? Math.max(0, 1 - (now - next.t) / LIFE) : k;
            // include the point if it, or the segment leaving it, falls in this band
            if ((k >= lo && k < hi) || (k < lo && kNext >= lo)) {
              if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
              } else ctx.lineTo(p.x, p.y);
              if (next && kNext >= lo) ctx.lineTo(next.x, next.y);
            } else if (started && k >= hi) break;
          }
          if (!started) continue;
          kMid = (lo + hi) / 2;
          const hue = 255 - (1 - kMid) * 30; // violet at the head, blue at the tail
          if (pass === 0) {
            ctx.strokeStyle = `hsla(${hue}, 100%, 62%, ${0.16 * kMid})`;
            ctx.lineWidth = 10 * kMid + 2;
          } else {
            ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${0.8 * kMid})`;
            ctx.lineWidth = 2.4 * kMid + 0.4;
          }
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = pts.length > 1 ? requestAnimationFrame(frame) : 0;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('magic-cursor');
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="magic-trail" aria-hidden="true" />
      <div ref={ring} className="magic-ring" aria-hidden="true" />
      <div ref={dotRef} className="magic-dot" aria-hidden="true" />
    </>
  );
}
