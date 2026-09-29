import { useState } from 'react';

export type Scope = 'all' | 'mine' | 'team';
export type Doc = { id: number; title: string; owner: 'me' | 'team'; starred: boolean };

const SCOPES: Scope[] = ['all', 'mine', 'team'];
const SCOPE_LABELS: Record<Scope, string> = { all: 'すべて', mine: '自分', team: 'チーム' };

const matches = (doc: Doc, scope: Scope) =>
  scope === 'all' || (scope === 'mine' ? doc.owner === 'me' : doc.owner === 'team');

export function DocumentList({ initialDocs }: { initialDocs: Doc[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [scope, setScope] = useState<Scope>('all');

  const visible = docs.filter((doc) => matches(doc, scope));

  const toggleStar = (id: number) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)));
  };

  return (
    <div>
      <div role="group" aria-label="表示範囲">
        {SCOPES.map((s) => (
          <button key={s} aria-pressed={scope === s} onClick={() => setScope(s)}>
            {SCOPE_LABELS[s]}
          </button>
        ))}
      </div>
      <p>{visible.length} 件</p>
      {visible.length === 0 ? (
        <p>該当するドキュメントはありません</p>
      ) : (
        <ul>
          {visible.map((doc) => (
            <li key={doc.id}>
              {doc.title}
              <button
                aria-label={`${doc.title} をお気に入り`}
                aria-pressed={doc.starred}
                onClick={() => toggleStar(doc.id)}
              >
                {doc.starred ? '★' : '☆'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
