/**
 * Sections are deep-linkable with plain hashes: #projects, #quests,
 * #loadout, #about, #arcade, #contact, and #p-<slug> for one project.
 * The browser back button closes panels.
 */
import { store, type SectionId } from '@/lib/store';
import { SECTION_ORDER } from '@/lib/sections';
import { sfx } from '@/lib/audio';

function setHash(h: string) {
  try {
    if (location.hash.slice(1) !== h) history.pushState(null, '', h ? `#${h}` : location.pathname + location.search);
  } catch {
    /* sandboxed frames may refuse; state still updates */
  }
}

export function openSection(id: SectionId, project: string | null = null) {
  if (store.get().phase === 'boot') return;
  sfx.click();
  sfx.whoosh();
  store.set({ section: id, project, hovered: null });
  setHash(project ? `p-${project}` : id);
}

export function openProject(slug: string | null) {
  sfx.click();
  store.set({ section: 'projects', project: slug });
  setHash(slug ? `p-${slug}` : 'projects');
}

export function closeSection() {
  if (!store.get().section) return;
  sfx.back();
  store.set({ section: null, project: null });
  setHash('');
}

export function readHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('p-')) return { section: 'projects' as SectionId, project: h.slice(2) };
  if ((SECTION_ORDER as string[]).includes(h)) return { section: h as SectionId, project: null };
  return { section: null, project: null };
}

export function listenHash() {
  const on = () => {
    if (store.get().phase === 'boot') return;
    store.set(readHash());
  };
  window.addEventListener('popstate', on);
  window.addEventListener('hashchange', on);
  return () => {
    window.removeEventListener('popstate', on);
    window.removeEventListener('hashchange', on);
  };
}
