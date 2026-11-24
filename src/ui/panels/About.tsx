import { character, profile } from '@/content/profile';
import { asset } from '@/lib/util';

export function AboutPanel() {
  return (
    <>
      <div className="sheet">
        {character.photo ? (
          <img className="sheet-photo" src={asset(character.photo.src)} alt={character.photo.alt} />
        ) : (
          <div className="sheet-photo sheet-avatar" aria-hidden="true">
            <span>{profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
          </div>
        )}
        <dl className="sheet-stats">
          <div>
            <dt>Player</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Class</dt>
            <dd>
              {character.className}
            </dd>
          </div>
          <div>
            <dt>Origin</dt>
            <dd>
              {character.origin}
            </dd>
          </div>
          <div>
            <dt>Main quest</dt>
            <dd>
              {character.mainQuest}
            </dd>
          </div>
        </dl>
      </div>
      <div className="prose">
        {character.bio.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </div>
      <h3 className="sub">Traits</h3>
      <ul className="traits">
        {character.traits.map((t, i) => (
          <li key={i}>
            {t}
          </li>
        ))}
      </ul>
    </>
  );
}
