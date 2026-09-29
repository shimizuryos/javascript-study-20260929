'use client';

import { parseAsString, useQueryState } from 'nuqs';

export const STATUSES = ['all', 'open', 'closed'] as const;
const STATUS_LABELS = { all: 'すべて', open: '未対応', closed: '完了' } as const;

// TODO: STATUSES のどれかだけを受け付け、それ以外は 'all' になるパーサーにする
export const statusParser = parseAsString;

export type Issue = { id: number; title: string; status: 'open' | 'closed' };

export function IssueList({ issues }: { issues: Issue[] }) {
  // TODO: 第 2 引数に statusParser を渡す
  const [status, setStatus] = useQueryState('status');
  const visible = issues.filter((issue) => status === null || issue.status === status);

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
