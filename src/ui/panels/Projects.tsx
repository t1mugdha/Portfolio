import { useEffect, useState } from 'react';
import { projects } from '@/content/projects';
import { social } from '@/content/profile';
import type { Project } from '@/content/types';
import { useApp } from '@/lib/store';
import { asset } from '@/lib/util';
import { openProject } from '../navigation';

const STATUS: Record<Project['status'], string> = {
  completed: 'CLEARED',
  'in-progress': 'IN PROGRESS',
  prototype: 'PROTOTYPE',
  archived: 'ARCHIVED',
};

export function ProjectsPanel() {
  const slug = useApp((s) => s.project);
  const list = projects.filter((p) => !p.hidden);
  const current = slug ? list.find((p) => p.slug === slug) : undefined;
  if (current) return <ProjectDetail p={current} />;

  return (
    <>
      <p className="lead">Pick a world. Each one opens into the story of how it was built — why, what, how, and what I’d change.</p>
      <ul className="carts">
        {list.map((p, i) => (
          <li key={p.slug}>
            <button type="button" className="cart" style={{ '--cart': p.color } as React.CSSProperties} onClick={() => openProject(p.slug)}>
              <span className="cart-idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="cart-body">
                <span className="cart-title">{p.title}</span>
                <span className="cart-tag">{p.tagline}</span>
                <span className="cart-meta">
                  <span className="pill">{STATUS[p.status]}</span>
                  {p.year && <span>{p.year}</span>}
                </span>
              </span>
              <span className="cart-go" aria-hidden="true">
                ▶
              </span>
            </button>
          </li>
        ))}
      </ul>

      <h3 className="sub">AT A GLANCE</h3>
      <table className="ptable">
        <caption className="sr">My projects, my role in each and the main tools used</caption>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">My role</th>
            <th scope="col">Built with</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.slug}>
              <th scope="row">{p.title}</th>
              <td>{p.role}</td>
              <td>{p.stack.slice(0, 3).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <GitHubRepos />
    </>
  );
}

type Repo = { id: number; name: string; html_url: string; description: string | null; language: string | null };

/** Latest public repos, loaded live from the GitHub API with AJAX (no page reload). */
function GitHubRepos() {
  const user = social.find((l) => l.label === 'GitHub')?.url?.split('/').pop();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/users/' + user + '/repos?sort=updated&per_page=5');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4 || !live) return; // 4 = DONE
      if (xhr.status === 200) {
        setRepos(JSON.parse(xhr.responseText) as Repo[]);
        setState('ok');
      } else {
        setState('error');
      }
    };
    xhr.send();
    return () => {
      live = false;
      xhr.abort();
    };
  }, [user]);

  if (!user) return null;
  return (
    <section aria-live="polite">
      <h3 className="sub">LIVE FROM GITHUB</h3>
      {state === 'loading' && <p className="muted">Loading repositories…</p>}
      {state === 'error' && (
        <p className="muted">
          GitHub didn’t answer just now. <a href={'https://github.com/' + user} target="_blank" rel="noopener noreferrer">See my GitHub ↗</a>
        </p>
      )}
      {state === 'ok' && (
        <ul className="repos">
          {repos.map((r) => (
            <li key={r.id}>
              <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                {r.name} ↗<span className="sr"> (opens in a new tab)</span>
              </a>
              {r.language && <span className="repo-lang">{r.language}</span>}
              {r.description && <p className="muted">{r.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="brief">
      <h4 className="brief-title">{title}</h4>
      {children}
    </section>
  );
}

function ProjectDetail({ p }: { p: Project }) {
  const links = [
    ...(p.liveUrl ? [{ label: 'Play it live', url: p.liveUrl }] : []),
    ...(p.repoUrl ? [{ label: 'Source code', url: p.repoUrl }] : []),
  ];
  return (
    <article className="detail" style={{ '--cart': p.color } as React.CSSProperties}>
      <button type="button" className="back" onClick={() => openProject(null)}>
        ← All worlds
      </button>
      <h3 className="detail-title">
        {p.title}
      </h3>
      <p className="lead">{p.tagline}</p>
      <dl className="facts">
        <div>
          <dt>Status</dt>
          <dd>{STATUS[p.status]}</dd>
        </div>
        {p.year && (
          <div>
            <dt>When</dt>
            <dd>
              {p.year}
            </dd>
          </div>
        )}
        <div>
          <dt>Role</dt>
          <dd>
            {p.role}
          </dd>
        </div>
        {p.team && (
          <div>
            <dt>Party</dt>
            <dd>
              {p.team}
            </dd>
          </div>
        )}
      </dl>

      {p.video ? (
        p.video.match(/\.(mp4|webm)$/) ? (
          <video className="media" src={asset(p.video)} poster={p.poster ? asset(p.poster.src) : undefined} controls muted playsInline preload="metadata" />
        ) : (
          <iframe className="media" src={p.video} title={`${p.title} demo`} loading="lazy" allowFullScreen />
        )
      ) : p.poster ? (
        <img className="media" src={asset(p.poster.src)} alt={p.poster.alt} loading="lazy" />
      ) : null}

      <Block title="Mission brief — why I built it">
        <p>{p.why}</p>
      </Block>
      <Block title="What it does">
        <ul className="ticks">
          {p.what.map((w, i) => (
            <li key={i}>
              {w}
            </li>
          ))}
        </ul>
      </Block>
      <Block title="How it’s built">
        <ul className="ticks">
          {p.how.map((w, i) => (
            <li key={i}>
              {w}
            </li>
          ))}
        </ul>
      </Block>
      {p.decisions && p.decisions.length > 0 && (
        <Block title="Decisions worth noting">
          <ul className="ticks">
            {p.decisions.map((w, i) => (
              <li key={i}>
                {w}
              </li>
            ))}
          </ul>
        </Block>
      )}
      {p.learned && (
        <Block title="After-action report">
          <p>{p.learned}</p>
        </Block>
      )}
      <Block title="Equipped">
        <p className="mono-list">
          [{' '}
          {p.stack.map((s, i) => (
            <span key={i}>
              “{s}”{i < p.stack.length - 1 ? ', ' : ' '}
            </span>
          ))}
          ]
        </p>
      </Block>
      {links.length > 0 && (
        <div className="actions">
          {links.map((l, i) => (
            <a key={l.url} className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}`} href={l.url} target="_blank" rel="noopener noreferrer">
              {l.label} ↗<span className="sr"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
