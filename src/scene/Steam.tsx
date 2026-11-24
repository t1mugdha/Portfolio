import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '@/lib/store';

/** Subtle steam curling up from the coffee mug on the desk. */

const MUG_TOP = new THREE.Vector3(-0.05, 0.845, -1.95); // Blender (-0.05, 1.95, 0.85)
const COUNT = 12;
const LIFE = 3.2;
const RISE = 0.2;

function puffTexture(): THREE.Texture {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,0.8)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.3)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

export function Steam() {
  const reduced = useApp((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const tex = puffTexture();
    return Array.from({ length: COUNT }, (_, i) => ({
      offset: (i / COUNT) * LIFE,
      seed: Math.random() * 10,
      mat: new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(1, 0.96, 0.92), transparent: true, opacity: 0, depthWrite: false }),
    }));
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.visible = !reduced;
    if (reduced) return;
    const t = clock.elapsedTime;
    g.children.forEach((child, i) => {
      const p = puffs[i]!;
      const k = ((t + p.offset) % LIFE) / LIFE; // 0 → 1 over its life
      const sway = Math.sin(t * 1.3 + p.seed + k * 5) * 0.012 * (0.4 + k);
      child.position.set(sway, k * RISE, Math.cos(t * 1.1 + p.seed) * 0.008 * k);
      const size = 0.025 + k * 0.06;
      child.scale.set(size, size * 1.25, 1);
      // fade in quickly, linger, fade out
      p.mat.opacity = 0.16 * Math.min(1, k * 5) * (1 - k) ** 1.4;
    });
  });

  return (
    <group ref={group} position={MUG_TOP}>
      {puffs.map((p, i) => (
        <sprite key={i} material={p.mat} raycast={() => null} />
      ))}
    </group>
  );
}
