import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '@/lib/store';
import { SECTIONS, TOYS } from '@/lib/sections';

/**
 * Floating neon diamonds over everything you can click.
 * Sections get the big violet-blue ones; toys get small sage-green ones.
 * Colours are pushed above 1.0 so the bloom pass makes them glow.
 */

type Handlers = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
};

const SECTION_COL = new THREE.Color(0.55, 0.45, 2.2);
const TOY_COL = new THREE.Color(0.55, 1.35, 0.72);
const TOY_MARKERS = ['duck', 'fridge', 'pc'] as const;

/** Where the diamond floats, relative to the object's bounding box. */
function anchorFor(hot: string, box: THREE.Box3): THREE.Vector3 {
  const c = box.getCenter(new THREE.Vector3());
  // The PC sits under the desk, so its marker floats in front of the case instead of above it.
  // The pegboard has the GG sign above its left end, so its marker sits over the right end.
  if (hot === 'Hot_Pegboard') return new THREE.Vector3(c.x + 0.12, box.max.y + 0.16, box.min.z + 0.35);
  if (hot === 'Hot_PC') return new THREE.Vector3(c.x, c.y + 0.05, box.max.z + 0.18);
  const lift = hot === 'Hot_Duck' ? 0.16 : hot === 'Hot_Shelf' ? 0.2 : 0.18;
  return new THREE.Vector3(c.x, box.max.y + lift, c.z);
}

let haloTex: THREE.Texture | null = null;
function halo(): THREE.Texture {
  if (haloTex) return haloTex;
  const s = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  haloTex = new THREE.CanvasTexture(cv);
  return haloTex;
}

function Marker({ hot, anchor, size, color, handlers, index }: { hot: string; anchor: THREE.Vector3; size: number; color: THREE.Color; handlers: Handlers; index: number }) {
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const reduced = useApp((s) => s.reducedMotion);
  const hovered = useApp((s) => s.hovered);
  const section = useApp((s) => s.section);

  const { gemMat, haloMat } = useMemo(
    () => ({
      gemMat: new THREE.MeshBasicMaterial({ color: color.clone(), toneMapped: false, transparent: true }),
      haloMat: new THREE.SpriteMaterial({ map: halo(), color: color.clone().multiplyScalar(0.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    }),
    [color],
  );

  const vis = useRef(1);
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime + index * 0.7;
    const on = hovered === hot;
    // Fade out while a section panel is open.
    vis.current = THREE.MathUtils.damp(vis.current, section ? 0 : 1, 8, dt);
    g.visible = vis.current > 0.02;
    g.position.set(anchor.x, anchor.y + (reduced ? 0 : Math.sin(t * 1.6) * size * 0.35), anchor.z);
    if (gem.current && !reduced) gem.current.rotation.y += dt * (on ? 2.6 : 0.9);
    const k = on ? 1.35 : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, k * vis.current, 10, dt) || 0.0001);
    const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 2.4);
    gemMat.color.copy(color).multiplyScalar(pulse * (on ? 1.4 : 1));
    gemMat.opacity = vis.current;
    haloMat.opacity = vis.current * (on ? 0.9 : 0.55) * pulse;
  });

  return (
    <group ref={group} position={anchor}>
      <mesh ref={gem} material={gemMat} scale={[0.62, 1, 0.62]} {...handlers}>
        <octahedronGeometry args={[size, 0]} />
      </mesh>
      <sprite material={haloMat} scale={[size * 6, size * 6, 1]} raycast={() => null} />
      {/* bigger invisible hit area so the diamond is easy to click */}
      <mesh {...handlers}>
        <sphereGeometry args={[size * 1.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Markers({ nodes, handlers }: { nodes: Record<string, THREE.Object3D>; handlers: (hot: string) => Handlers }) {
  const items = useMemo(() => {
    const list: { hot: string; anchor: THREE.Vector3; size: number; color: THREE.Color }[] = [];
    const add = (hot: string, size: number, color: THREE.Color) => {
      const n = nodes[hot];
      if (!n) return;
      n.updateWorldMatrix(true, true);
      list.push({ hot, anchor: anchorFor(hot, new THREE.Box3().setFromObject(n)), size, color });
    };
    for (const s of Object.values(SECTIONS)) add(s.mesh, 0.095, SECTION_COL);
    for (const id of TOY_MARKERS) add(TOYS[id].mesh, 0.055, TOY_COL);
    return list;
  }, [nodes]);

  return (
    <group name="Markers">
      {items.map((m, i) => (
        <Marker key={m.hot} index={i} hot={m.hot} anchor={m.anchor} size={m.size} color={m.color} handlers={handlers(m.hot)} />
      ))}
    </group>
  );
}
