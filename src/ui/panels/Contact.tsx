import { profile, social } from '@/content/profile';
import { asset } from '@/lib/util';

export function ContactPanel() {
  const links = social.filter((l) => l.url);
  return (
    <>
      <p className="lead">
        Hiring, building something interesting, or just want to talk games and interfaces? Drop a letter in the box — email is the fastest way to reach me.
      </p>
      <a className="mail" href={`mailto:${profile.email}`}>
        <span className="mail-label">Send a letter</span>
        <span className="mail-addr">{profile.email}</span>
      </a>
      <ul className="links">
        {links.map((l) =>
          l.url ? (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} ↗<span className="sr"> (opens in a new tab)</span>
              </a>
              <span className="link-handle">{l.handle}</span>
            </li>
          ) : (
            <li key={l.label} className="muted">
              {l.label} — add the URL in src/content/profile.ts
            </li>
          ),
        )}
      </ul>
      {profile.availability && <p className="avail">● {profile.availability}</p>}
      <div className="actions">
        <a className="btn btn-primary" href={`mailto:${profile.email}`}>
          Email me
        </a>
        <a className="btn btn-ghost" href={asset(profile.cvPath)} download>
          ↓ CV (PDF)
        </a>
      </div>
    </>
  );
}
