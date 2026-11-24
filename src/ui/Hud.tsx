import { useEffect, useState } from 'react';
import { profile } from '@/content/profile';
import { store, useApp, writePref } from '@/lib/store';
import { SECTION_ORDER, SECTIONS } from '@/lib/sections';
import { applySound, sfx } from '@/lib/audio';
import { openSection } from './navigation';

function Clock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.timeZone }).format(new Date());
  const [now, setNow] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt()), 15000);
    return () => window.clearInterval(id);
  });
  return (
    <span className="hud-clock" title={`Local time for ${profile.city}`}>
      <span className="hud-dot" aria-hidden="true" />
      {now} · {profile.city}
    </span>
  );
}

export function Hud() {
  const section = useApp((s) => s.section);
  const sound = useApp((s) => s.sound);
  const reduced = useApp((s) => s.reducedMotion);
  const [hint, setHint] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setHint(false), 9000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <header className="hud-top">
        <div className="hud-id">
          <p className="hud-name">{profile.name}</p>
          <p className="hud-role">{profile.role}</p>
        </div>
        <div className="hud-tools">
          <Clock />
          <button
            type="button"
            className="hud-btn"
            aria-pressed={sound}
            onClick={() => {
              const on = !sound;
              store.set({ sound: on });
              writePref('sound', on);
              applySound(on);
              if (on) sfx.click();
            }}
          >
            {sound ? '♪ Sound on' : '♪ Muted'}
          </button>
          <button
            type="button"
            className="hud-btn"
            aria-pressed={reduced}
            onClick={() => {
              store.set({ reducedMotion: !reduced });
              writePref('reducedMotion', !reduced);
            }}
          >
            Reduce motion
          </button>
          <a className="hud-btn" href="?flat">
            Plain version
          </a>
        </div>
      </header>

      <nav className="hud-nav" aria-label="Sections" data-hidden={section ? 'mobile' : undefined}>
        <ol>
          {SECTION_ORDER.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                className="nav-item"
                aria-current={section === id ? 'page' : undefined}
                onClick={() => openSection(id)}
                onMouseEnter={() => sfx.hover()}
              >
                <span className="nav-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav-label">{SECTIONS[id].label}</span>
                <span className="nav-verb">{SECTIONS[id].verb}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {hint && !section && (
        <p className="hud-hint" aria-hidden="true">
          <span className="hint-fine">Drag to look · scroll to zoom · click anything that glows</span>
          <span className="hint-touch">Drag · pinch to zoom · tap what glows</span>
        </p>
      )}
    </>
  );
}
