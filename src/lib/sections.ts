import type { SectionId, ToyId } from './store';

/**
 * Where each section lives in the room. Camera positions are in three.js
 * world space (Y up). The Blender scene is Z up: (x, y, z)ᴮ → (x, z, -y)ᵀ.
 */
export interface Spot {
  label: string;
  /** Short game-flavoured name shown on hover and in the nav. */
  verb: string;
  mesh: string;
  camera: [number, number, number];
  target: [number, number, number];
}

export const SECTIONS: Record<SectionId, Spot> = {
  projects: { label: 'Projects', verb: 'Level select', mesh: 'Hot_Monitor', camera: [1.0, 1.58, -0.72], target: [0.72, 1.08, -2.25] },
  quests: { label: 'Experience', verb: 'Quest log', mesh: 'Hot_Corkboard', camera: [-1.25, 1.75, -0.25], target: [-1.85, 1.68, -2.5] },
  loadout: { label: 'Skills', verb: 'Loadout', mesh: 'Hot_Pegboard', camera: [-0.75, 1.55, 0.35], target: [-3.0, 1.45, 1.05] },
  about: { label: 'About', verb: 'Character', mesh: 'Hot_Shelf', camera: [0.15, 1.3, -1.0], target: [-2.8, 1.0, -1.35] },
  arcade: { label: 'Beyond', verb: 'Arcade', mesh: 'Hot_Arcade', camera: [0.45, 1.55, -0.45], target: [2.45, 1.2, -1.95] },
  contact: { label: 'Contact', verb: 'Mailbox', mesh: 'Hot_Mailbox', camera: [1.0, 1.45, 3.4], target: [2.35, 0.95, 1.45] },
};

export const SECTION_ORDER: SectionId[] = ['projects', 'quests', 'loadout', 'about', 'arcade', 'contact'];

export const TOYS: Record<ToyId, { mesh: string; label: string }> = {
  duck: { mesh: 'Hot_Duck', label: 'Rubber duck' },
  chair: { mesh: 'Hot_Chair', label: 'Spin the chair' },
  fridge: { mesh: 'Hot_Fridge', label: 'Snack fridge' },
  pc: { mesh: 'Hot_PC', label: 'Overclock' },
};

/** Overview shot. Narrow screens step back so the whole room fits. */
export const OVERVIEW = {
  wide: { camera: [5.25, 3.95, 5.35] as [number, number, number], target: [-0.1, 0.95, -0.4] as [number, number, number] },
  narrow: { camera: [7.75, 7.65, 8.8] as [number, number, number], target: [0.1, 0.75, -0.2] as [number, number, number] },
};

export const meshToSection = Object.fromEntries(
  (Object.entries(SECTIONS) as [SectionId, Spot][]).map(([id, s]) => [s.mesh, id]),
) as Record<string, SectionId>;
export const meshToToy = Object.fromEntries(
  (Object.entries(TOYS) as [ToyId, { mesh: string }][]).map(([id, t]) => [t.mesh, id]),
) as Record<string, ToyId>;

/** Label for the hover tooltip. */
export function labelFor(hot: string): string {
  const s = meshToSection[hot];
  if (s) return `${SECTIONS[s].verb} · ${SECTIONS[s].label}`;
  const toy = meshToToy[hot];
  return toy ? { duck: 'Rubber duck (senior engineer)', chair: 'Spin the chair', fridge: 'Snack fridge', pc: 'Overclock the PC' }[toy] : '';
}
