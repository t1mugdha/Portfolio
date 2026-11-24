import { use, useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { roomPromise } from './loadRoom';
import * as THREE from 'three';
import { store, useApp, toast, type ToyId } from '@/lib/store';
import { meshToSection, meshToToy } from '@/lib/sections';
import { asset, isLowPower } from '@/lib/util';
import { sfx } from '@/lib/audio';
import { duckLines } from '@/content/profile';
import { glowKind, glowOwner, makeGlowMaterial, planarUVs } from './glow';
import { createScreens } from './screens';
import { openSection } from '@/ui/navigation';
import { Markers } from './Markers';
import { Steam } from './Steam';

const GLB = asset('room/room.glb');
const BAKE = asset(isLowPower() ? 'room/bake-2k.webp' : 'room/bake-4k.webp');

type Nodes = Record<string, THREE.Object3D>;

/** Clicking a hotspot: sections open their panel, toys do their thing. */
function activate(hot: string) {
  const section = meshToSection[hot];
  if (section) {
    openSection(section);
    return;
  }
  const toy = meshToToy[hot];
  if (toy) poke(toy);
}

function poke(toy: ToyId) {
  store.set((s) => ({ pokes: { ...s.pokes, [toy]: s.pokes[toy] + 1 } }));
  if (toy === 'duck') {
    sfx.squeak();
    const prev = store.get().duckLine;
    let line = duckLines[Math.floor(Math.random() * duckLines.length)]!;
    if (line === prev && duckLines.length > 1) line = duckLines[(duckLines.indexOf(line) + 1) % duckLines.length]!;
    store.set({ duckLine: line });
    window.clearTimeout((poke as unknown as { t?: number }).t);
    (poke as unknown as { t?: number }).t = window.setTimeout(() => store.set({ duckLine: null }), 3800);
  }
  if (toy === 'chair') sfx.whoosh();
  if (toy === 'fridge') {
    sfx.hiss();
    toast('+1 Energy. Stay hydrated, player.');
  }
  if (toy === 'pc') {
    sfx.rev();
    toast('Overclocked! (Not really. Please don’t.)');
  }
}

export function Room() {
  const nodes: Nodes = use(roomPromise(GLB));
  const bake = useTexture(BAKE);
  const reduced = useApp((s) => s.reducedMotion);
  const hovered = useApp((s) => s.hovered);

  const { bakedMat, hoverMat } = useMemo(() => {
    bake.flipY = false;
    bake.colorSpace = THREE.SRGBColorSpace;
    bake.anisotropy = 8;
    bake.generateMipmaps = true;
    // The bake is already tone-mapped in Blender (AgX), so show it as-is.
    const bakedMat = new THREE.MeshBasicMaterial({ map: bake, toneMapped: false });
    const hoverMat = new THREE.MeshBasicMaterial({ map: bake, toneMapped: false, color: new THREE.Color(1.45, 1.38, 1.65) });
    return { bakedMat, hoverMat };
  }, [bake]);

  const screens = useMemo(() => createScreens(), []);
  // Everything this component needs has loaded once it renders.
  useEffect(() => store.set({ progress: 1 }), []);

  // Split the GLB into baked meshes and glowing parts.
  const { baked, glows } = useMemo(() => {
    const baked: THREE.Mesh[] = [];
    const glows: { mesh: THREE.Mesh; kind: ReturnType<typeof glowKind>; owner: string | null; mat: THREE.MeshBasicMaterial; i: number }[] = [];
    let i = 0;
    for (const o of Object.values(nodes)) {
      if (!(o as THREE.Mesh).isMesh) continue;
      const m = o as THREE.Mesh;
      if (m.name === 'Room_Static' || m.name.startsWith('Hot_')) {
        // Hovered objects scale up slightly; make them scale about their own
        // bottom centre rather than the export origin, so they don't sink into the desk.
        if (m.name.startsWith('Hot_') && !['Hot_Duck', 'Hot_Fridge', 'Hot_Chair'].includes(m.name) && !m.userData.centred) {
          m.geometry.computeBoundingBox();
          // anchor at the bottom centre so things resting on a surface stay on it
          const c = m.geometry.boundingBox!.getCenter(new THREE.Vector3());
          c.y = m.geometry.boundingBox!.min.y;
          m.geometry.translate(-c.x, -c.y, -c.z);
          m.position.add(c.multiply(m.scale).applyQuaternion(m.quaternion));
          m.userData.centred = true;
        }
        baked.push(m);
      } else {
        const tex = screens.textures[m.name];
        let mat: THREE.MeshBasicMaterial;
        if (tex) {
          planarUVs(m.geometry);
          // The arcade screen sits flush with its bezel in the export; lift it off so it isn't hidden.
          if (m.name === 'ArcadeScreen') m.geometry.translate(0, 0.02, 0);
          mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: m.name === 'ArcadeScreen' ? new THREE.Color(1.25, 1.25, 1.25) : new THREE.Color(1.6, 1.6, 1.6), side: THREE.DoubleSide });
        } else {
          mat = makeGlowMaterial(m.material as THREE.Material);
          // The arcade's trim, marquee and coin lights were overpowering the corner: run them at about half strength.
          if (m.name.startsWith('Arcade_')) {
            mat.color.multiplyScalar(0.45);
            (mat.userData.base as THREE.Color).multiplyScalar(0.45);
          }
        }
        glows.push({ mesh: m, kind: glowKind(m.name), owner: glowOwner(m.name), mat, i: i++ });
      }
    }
    return { baked, glows };
  }, [nodes, screens]);

  // --- animation refs
  const refs = useRef<Record<string, THREE.Object3D | null>>({});
  const chairSpin = useRef(0);
  const duckHop = useRef(0);
  const fridgeShake = useRef(0);
  const pcBoost = useRef(0);
  const pokes = useApp((s) => s.pokes);
  const prev = useRef(pokes);
  useEffect(() => {
    if (pokes.chair !== prev.current.chair) chairSpin.current += reduced ? 0 : 14;
    if (pokes.duck !== prev.current.duck) duckHop.current = 1;
    if (pokes.fridge !== prev.current.fridge) fridgeShake.current = 1;
    if (pokes.pc !== prev.current.pc) pcBoost.current = 1;
    prev.current = pokes;
  }, [pokes, reduced]);

  const base = useMemo(() => {
    const b: Record<string, { pos: THREE.Vector3; rotY: number }> = {};
    for (const m of baked) b[m.name] = { pos: m.position.clone(), rotY: m.rotation.y };
    return b;
  }, [baked]);

  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    screens.update(t);
    const pcB = pcBoost.current;

    for (const g of glows) {
      const baseCol = g.mat.userData.base as THREE.Color | undefined;
      if (!baseCol) continue;
      switch (g.kind) {
        case 'bulb': {
          const k = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.8 + g.i * 1.7) * Math.sin(t * 0.7 + g.i);
          g.mat.color.copy(baseCol).multiplyScalar(k);
          break;
        }
        case 'hex': {
          const h = reduced ? (g.i * 0.13) % 1 : (t * 0.04 + g.i * 0.13) % 1;
          g.mat.color.setHSL(h * 0.35 + 0.65, 0.85, 0.6).multiplyScalar(g.owner === 'Hot_Arcade' ? 0.95 : 2.2);
          break;
        }
        case 'key': {
          const idx = Number(g.mesh.name.replace(/\D/g, '')) || 7;
          const h = reduced ? idx / 15 : (idx / 15 - t * 0.18) % 1;
          g.mat.color.setHSL((h + 1) % 1, 0.9, 0.6).multiplyScalar(1.6);
          break;
        }
        case 'neon': {
          // mostly steady, with the occasional cheap-sign flicker
          const flick = !reduced && Math.sin(t * 13.0) > 0.985 - 0.01 * Math.sin(t * 0.3) ? 0.35 : 1;
          g.mat.color.copy(baseCol).multiplyScalar(flick);
          break;
        }
        case 'led': {
          const k = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 1.1 + g.i);
          g.mat.color.copy(baseCol).multiplyScalar(k * (1 + pcB * 0.8));
          break;
        }
        case 'fan': {
          tmp.setHSL(((reduced ? 0 : t * (0.1 + pcB * 0.8)) + g.i * 0.33) % 1, 0.85, 0.55);
          g.mat.color.copy(tmp).multiplyScalar(2 + pcB * 2);
          break;
        }
      }
    }
    pcBoost.current = Math.max(0, pcB - dt / 3);

    // Toys
    const chair = refs.current.Hot_Chair;
    if (chair) {
      const spin = chairSpin.current;
      const step = Math.min(spin, dt * Math.max(2, spin * 2.2));
      chair.rotation.y += step;
      chairSpin.current = spin - step;
    }
    const duck = refs.current.Hot_Duck;
    if (duck && base.Hot_Duck) {
      const h = duckHop.current;
      duck.position.y = base.Hot_Duck.pos.y + Math.sin((1 - h) * Math.PI) * 0.12 * (reduced ? 0 : 1);
      duck.rotation.y = base.Hot_Duck.rotY + (reduced ? 0 : (1 - h) * Math.PI * 2) * (h > 0 ? 1 : 0);
      duckHop.current = Math.max(0, h - dt * 1.6);
      if (duckHop.current === 0) duck.rotation.y = base.Hot_Duck.rotY;
    }
    const fridge = refs.current.Hot_Fridge;
    if (fridge && base.Hot_Fridge) {
      const s = fridgeShake.current;
      fridge.position.x = base.Hot_Fridge.pos.x + (reduced ? 0 : Math.sin(t * 60) * 0.012 * s);
      fridgeShake.current = Math.max(0, s - dt * 2);
    }
    // Hovered objects breathe a little
    for (const m of baked) {
      if (!m.name.startsWith('Hot_') || m.name === 'Hot_Duck' || m.name === 'Hot_Fridge') continue;
      const o = refs.current[m.name];
      if (!o) continue;
      const target = hovered === m.name && !reduced ? 1.025 : 1;
      o.scale.setScalar(THREE.MathUtils.damp(o.scale.x, target, 10, dt));
    }
  });

  const handlers = (hot: string) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (store.get().hovered !== hot) sfx.hover();
      store.set({ hovered: hot });
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      if (store.get().hovered === hot) store.set({ hovered: null });
      document.body.style.cursor = '';
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // ignore the click that ends a drag
      if (e.delta > 6) return;
      activate(hot);
    },
  });

  const duckLine = useApp((s) => s.duckLine);

  return (
    <group>
      {baked.map((m) => {
        const hot = m.name.startsWith('Hot_');
        const isHover = hovered === m.name;
        return (
          <mesh
            key={m.name}
            ref={(el) => {
              refs.current[m.name] = el;
            }}
            name={m.name}
            geometry={m.geometry}
            position={m.position}
            quaternion={m.quaternion}
            scale={m.scale}
            material={isHover ? hoverMat : bakedMat}
            {...(hot ? handlers(m.name) : {})}
          >
            {m.name === 'Hot_Duck' && (
              // the duck is tiny from the overview; give it a friendlier hit area
              <mesh>
                <sphereGeometry args={[0.16, 12, 12]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
            {m.name === 'Hot_Duck' && duckLine && (
              <Html center position={[0, 0.32, 0]} zIndexRange={[30, 0]} wrapperClass="duck-bubble-wrap">
                <div className="duck-bubble" role="status">
                  {duckLine}
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
      <Markers nodes={nodes} handlers={handlers} />
      <Steam />
      {glows.map((g) => (
        <mesh
          key={g.mesh.name}
          name={g.mesh.name}
          geometry={g.mesh.geometry}
          position={g.mesh.position}
          quaternion={g.mesh.quaternion}
          scale={g.mesh.scale}
          material={g.mat}
          {...(g.owner ? handlers(g.owner) : {})}
        />
      ))}
    </group>
  );
}

// start downloading the model as soon as this chunk loads
void roomPromise(GLB);
