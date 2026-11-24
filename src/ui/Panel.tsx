import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { SECTION_ORDER, SECTIONS } from '@/lib/sections';
import { closeSection, openSection } from './navigation';
import { ProjectsPanel } from './panels/Projects';
import { QuestsPanel } from './panels/Quests';
import { LoadoutPanel } from './panels/Loadout';
import { AboutPanel } from './panels/About';
import { ArcadePanel } from './panels/Arcade';
import { ContactPanel } from './panels/Contact';

const BODIES = {
  projects: ProjectsPanel,
  quests: QuestsPanel,
  loadout: LoadoutPanel,
  about: AboutPanel,
  arcade: ArcadePanel,
  contact: ContactPanel,
};

export function Panel() {
  const section = useApp((s) => s.section);
  const project = useApp((s) => s.project);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (section) {
      if (!lastFocus.current) lastFocus.current = document.activeElement as HTMLElement;
      // wait for the slide-in so focus doesn't jump the page
      const id = window.setTimeout(() => heading.current?.focus({ preventScroll: true }), 60);
      return () => window.clearTimeout(id);
    }
    lastFocus.current?.focus?.({ preventScroll: true });
    lastFocus.current = null;
  }, [section, project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!section) return null;
  const spot = SECTIONS[section];
  const i = SECTION_ORDER.indexOf(section);
  const prev = SECTION_ORDER[(i - 1 + SECTION_ORDER.length) % SECTION_ORDER.length]!;
  const next = SECTION_ORDER[(i + 1) % SECTION_ORDER.length]!;
  const Body = BODIES[section];

  return (
    <aside className="panel" role="dialog" aria-labelledby="panel-title" key={section}>
      <header className="panel-head">
        <p className="panel-kicker">
          <span className="panel-idx">{String(i + 1).padStart(2, '0')}</span> {spot.verb.toUpperCase()}
        </p>
        <h2 id="panel-title" className="panel-title" tabIndex={-1} ref={heading}>
          {spot.label}
        </h2>
        <button type="button" className="panel-close" onClick={closeSection} aria-label="Close and go back to the room">
          ✕ <span>Back to room</span>
        </button>
      </header>
      <div className="panel-body">
        <Body />
      </div>
      <footer className="panel-foot">
        <button type="button" className="panel-step" onClick={() => openSection(prev)}>
          ← {SECTIONS[prev].label}
        </button>
        <button type="button" className="panel-step" onClick={() => openSection(next)}>
          {SECTIONS[next].label} →
        </button>
      </footer>
    </aside>
  );
}
