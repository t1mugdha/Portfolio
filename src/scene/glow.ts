/**
 * Live "glow" parts of the room (LEDs, screens, neon, fairy lights…).
 * They aren't baked: they use unlit materials with colour values above 1
 * so the bloom pass picks them up, and they animate every frame.
 */
import * as THREE from 'three';

export type GlowKind = 'bulb' | 'hex' | 'key' | 'neon' | 'led' | 'fan' | 'static';

export function glowKind(name: string): GlowKind {
  if (name.startsWith('Lights_Bulb')) return 'bulb';
  if (name.startsWith('Hex_')) return 'hex';
  if (name.startsWith('Keyboard_')) return 'key';
  if (name.startsWith('Neon_')) return 'neon';
  if (name.startsWith('Arcade_GlowTrim')) return 'hex'; // LED T-molding cycles colour like the hex panels
  if (name.startsWith('LED_') || name.startsWith('Shelf_LED') || name.startsWith('PC_Glow') || name.startsWith('Arcade_Glow')) return 'led';
  if (name.startsWith('PC_Fan')) return 'fan';
  return 'static';
}

/** Which clickable group a glowing part belongs to (so clicking an LED counts as clicking its object). */
export function glowOwner(name: string): string | null {
  if (name.startsWith('Keyboard_') || name.startsWith('Screen')) return 'Hot_Monitor';
  if (name.startsWith('Arcade')) return 'Hot_Arcade';
  if (name.startsWith('PC_')) return 'Hot_PC';
  if (name.startsWith('Peg_')) return 'Hot_Pegboard';
  if (name.startsWith('Shelf_')) return 'Hot_Shelf';
  return null;
}

/** Turns the exported emissive material into a bright unlit one. */
export function makeGlowMaterial(src: THREE.Material): THREE.MeshBasicMaterial {
  const s = src as THREE.MeshStandardMaterial;
  const strength = Math.min((s.emissiveIntensity ?? 1) * 0.35, 4);
  const c = (s.emissive ?? new THREE.Color(1, 1, 1)).clone().multiplyScalar(Math.max(strength, 1.1));
  const m = new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  m.userData.base = c.clone();
  return m;
}

/**
 * Screens have no reliable UVs from the export, so derive them from the
 * mesh's own bounding box: u along local X, v along whichever other axis is
 * longer (flipped when it's Z, because Blender's +Y becomes three's −Z).
 */
export function planarUVs(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const pos = geo.attributes.position!;
  const useZ = size.z > size.y;
  // Screens on a side wall (thinnest along X) map across Z instead, as seen from the room.
  const sideWall = size.x < size.y && size.x < size.z;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    if (sideWall) {
      uv[i * 2] = (bb.max.z - pos.getZ(i)) / (size.z || 1);
      uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / (size.y || 1);
      continue;
    }
    uv[i * 2] = (pos.getX(i) - bb.min.x) / (size.x || 1);
    uv[i * 2 + 1] = useZ ? 1 - (pos.getZ(i) - bb.min.z) / (size.z || 1) : (pos.getY(i) - bb.min.y) / (size.y || 1);
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
