import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { labelFor } from '@/lib/sections';

/** Label that follows the pointer while hovering a hotspot. */
export function Tooltip() {
  const hovered = useApp((s) => s.hovered);
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (el.current) el.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <div ref={el} className="tooltip" data-visible={!!hovered} aria-hidden="true">
      {hovered ? labelFor(hovered) : ''}
    </div>
  );
}

export function Toast() {
  const toast = useApp((s) => s.toast);
  return (
    <p className="toast" role="status" data-visible={!!toast}>
      {toast ?? ''}
    </p>
  );
}
