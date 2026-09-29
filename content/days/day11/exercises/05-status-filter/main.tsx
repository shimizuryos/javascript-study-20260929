'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

export const STATUSES = ['all', 'open', 'closed'] as const;
const STATUS_LABELS = { all: 'すべて', open: '未対応', closed: '完了' } as const;

export const statusParser = parseAsStringLiteral(STATUSES).withDefault('all');

export type Issue = { id: number; title: string; status: 'open' | 'closed' };

export function IssueList({ issues }: { issues: Issue[] }) {
  const [status, setStatus] = useQueryState('status', statusParser);
  const visible = status === 'all' ? issues : issues.filter((issue) => issue.status === status);

  return (
    <div>
      {STATUSES.map((s) => (
        <button key={s} aria-pressed={s === status} onClick={() => setStatus(s)}>
          {STATUS_LABELS[s]}
        </button>
      ))}
      <ul>
        {visible.map((issue) => (
          <li key={issue.id}>{issue.title}</li>
        ))}
      </ul>
    </div>
  );
}
