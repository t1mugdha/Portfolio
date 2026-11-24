import { quests } from '@/content/quests';
import { profile } from '@/content/profile';
import type { QuestType } from '@/content/types';
import { asset } from '@/lib/util';

const KIND: Record<QuestType, string> = {
  education: 'MAIN QUEST',
  work: 'QUEST',
  internship: 'SIDE QUEST',
  volunteering: 'SIDE QUEST',
  leadership: 'GUILD',
  award: 'ACHIEVEMENT',
  certification: 'BADGE',
};

export function QuestsPanel() {
  const list = quests.filter((q) => !q.hidden);
  return (
    <>
      <p className="lead">Education and experience so far. Not every quest was a coding quest — they all levelled something up.</p>
      <ol className="quests">
        {list.map((q) => {
          const active = /present|now|expected/i.test(q.end ?? '') || !q.end;
          return (
            <li key={q.id} className="quest" data-type={q.type}>
              <p className="quest-kind">
                {KIND[q.type]} <span className="quest-state">{active ? '· IN PROGRESS' : '· COMPLETE'}</span>
              </p>
              <h3 className="quest-title">
                {q.title}
              </h3>
              <p className="quest-org">
                {q.org}
                {q.location && (
                  <>
                    {' · '}
                    {q.location}
                  </>
                )}
              </p>
              <p className="quest-when">
                {q.start}
                {q.end && (
                  <>
                    {' → '}
                    {q.end}
                  </>
                )}
              </p>
              <p className="quest-sum">{q.summary}</p>
              {q.objectives && q.objectives.length > 0 && (
                <ul className="objectives" aria-label="Objectives">
                  {q.objectives.map((o, i) => (
                    <li key={i}>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      <div className="actions">
        <a className="btn btn-primary" href={asset(profile.cvPath)} download>
          ↓ Download full CV (PDF)
        </a>
      </div>
    </>
  );
}
