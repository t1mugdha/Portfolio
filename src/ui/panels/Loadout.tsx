import { loadout } from '@/content/loadout';

const LEVEL = { comfortable: 'Comfortable', familiar: 'Familiar', learning: 'Learning' } as const;

export function LoadoutPanel() {
  const groups = loadout.filter((g) => g.slots.length > 0);
  return (
    <>
      <p className="lead">My current loadout — the tools I’ve actually used, grouped by what they’re for. No stat bars; just where each one has come in handy.</p>
      {groups.map((g) => (
        <section key={g.id} className="inv">
          <h3 className="inv-title">
            <span className="inv-icon" aria-hidden="true">
              {g.icon}
            </span>
            {g.title}
          </h3>
          <ul className="slots">
            {g.slots.map((s, i) => (
              <li key={i} className="slot">
                <span className="slot-name">{s.name}</span>
                {s.note && <span className="slot-note">{s.note}</span>}
                {s.level && <span className="slot-level">{LEVEL[s.level]}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
