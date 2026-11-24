import { useEffect, useRef, useState } from 'react';
import { profile } from '@/content/profile';
import { store, useApp, writePref } from '@/lib/store';
import { applySound, sfx, startAmbient } from '@/lib/audio';
import { readHash } from './navigation';

const TIPS = [
  'TIP: The duck has opinions. Click it.',
  'TIP: Drag to look around the room.',
  'TIP: Everything glowing is clickable. Probably.',
  'TIP: The arcade is playable. High scores are not.',
  'TIP: Stay hydrated. The fridge is right there.',
  'TIP: Press Esc to back out of any menu.',
  'TIP: No loot boxes were harmed in this build.',
];

export function Boot() {
  const progress = useApp((s) => s.progress);
  const [tip, setTip] = useState(0);
  const [minTime, setMinTime] = useState(false);
  const ready = progress >= 0.999 && minTime;
  const startBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const a = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    const b = window.setTimeout(() => setMinTime(true), 1400);
    return () => {
      window.clearInterval(a);
      window.clearTimeout(b);
    };
  }, []);

  useEffect(() => {
    if (ready) startBtn.current?.focus();
  }, [ready]);

  const start = (sound: boolean) => {
    store.set({ sound });
    writePref('sound', sound);
    if (sound) {
      startAmbient();
      sfx.start();
    } else applySound(false);
    store.set({ phase: 'room', ...readHash() });
  };

  const blocks = 20;
  const filled = Math.round(progress * blocks);

  return (
    <div className="boot" role="dialog" aria-modal="true" aria-labelledby="boot-title">
      <div className="boot-inner">
        <p className="boot-kicker">PLAYER ONE</p>
        <h1 id="boot-title" className="boot-title">
          {profile.name.split(' ').map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </h1>
        <p className="boot-role">{profile.role}</p>

        {!ready ? (
          <div className="boot-load" aria-live="polite">
            <p className="boot-label">LOADING SAVE FILE…</p>
            <div className="boot-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              {Array.from({ length: blocks }, (_, i) => (
                <span key={i} data-on={i < filled} />
              ))}
            </div>
            <p className="boot-pct">{String(Math.round(progress * 100)).padStart(3, '0')}%</p>
          </div>
        ) : (
          <div className="boot-start">
            <p className="boot-press" aria-hidden="true">
              PRESS START
            </p>
            <div className="boot-actions">
              <button ref={startBtn} type="button" className="btn btn-primary" onClick={() => start(true)}>
                ▶ Start with sound
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => start(false)}>
                Start muted
              </button>
            </div>
          </div>
        )}

        <p className="boot-tip" key={tip}>
          {TIPS[tip]}
        </p>
        <a className="boot-skip" href="?flat">
          Skip the room — show me the plain version →
        </a>
      </div>
    </div>
  );
}
