import { useState } from 'react';

export type Scope = 'all' | 'mine' | 'team';
export type Doc = { id: number; title: string; owner: 'me' | 'team'; starred: boolean };

const SCOPES: Scope[] = ['all', 'mine', 'team'];
const SCOPE_LABELS: Record<Scope, string> = { all: 'すべて', mine: '自分', team: 'チーム' };

export function DocumentList({ initialDocs }: { initialDocs: Doc[] }) {
  // TODO: docs と scope の state を持つ
  // TODO: scope で絞り込み、件数・0 件のメッセージ・お気に入りボタンを表示する

  return (
    <div>
      <div role="group" aria-label="表示範囲">
        {SCOPES.map((s) => (
          <button key={s} aria-pressed={s === 'all'}>
            {SCOPE_LABELS[s]}
          </button>
        ))}
      </div>
      <p>{initialDocs.length} 件</p>
      <ul>
        {initialDocs.map((doc) => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  );
}
