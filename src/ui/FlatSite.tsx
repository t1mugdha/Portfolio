import { profile } from '@/content/profile';
import { SECTION_ORDER, SECTIONS } from '@/lib/sections';
import { hasWebGL } from '@/lib/util';
import { ProjectsPanel } from './panels/Projects';
import { QuestsPanel } from './panels/Quests';
import { LoadoutPanel } from './panels/Loadout';
import { AboutPanel } from './panels/About';
import { ArcadePanel } from './panels/Arcade';
import { ContactPanel } from './panels/Contact';

const BODIES = { projects: ProjectsPanel, quests: QuestsPanel, loadout: LoadoutPanel, about: AboutPanel, arcade: ArcadePanel, contact: ContactPanel };

/** The whole portfolio as one plain, accessible page — no WebGL needed. */
export function FlatSite() {
  const can3D = hasWebGL();
  return (
    <div className="flat">
      <a className="skip" href="#flat-main">
        Skip to content
      </a>
      <header className="flat-head">
        <p className="boot-kicker">PLAYER ONE</p>
        <h1 className="flat-name">{profile.name}</h1>
        <p className="flat-role">{profile.role}</p>
        <p className="flat-intro">{profile.intro}</p>
        <nav aria-label="Sections" className="flat-nav">
          {SECTION_ORDER.map((id, i) => (
            <a key={id} href={`#flat-${id}`}>
              <span className="nav-idx">{String(i + 1).padStart(2, '0')}</span> {SECTIONS[id].label}
            </a>
          ))}
        </nav>
        {can3D ? (
          <a className="btn btn-ghost" href="./">
            ← Back to the 3D room
          </a>
        ) : (
          <p className="muted">This browser can’t show the 3D room, so here’s everything as a plain page.</p>
        )}
      </header>
      <main id="flat-main">
        {SECTION_ORDER.map((id, i) => {
          const Body = BODIES[id];
          return (
            <section key={id} id={`flat-${id}`} className="flat-section" aria-labelledby={`flat-h-${id}`}>
              <p className="panel-kicker">
                <span className="panel-idx">{String(i + 1).padStart(2, '0')}</span> {SECTIONS[id].verb.toUpperCase()}
              </p>
              <h2 id={`flat-h-${id}`} className="panel-title">
                {SECTIONS[id].label}
              </h2>
              <Body />
            </section>
          );
        })}
      </main>
    </div>
  );
}
