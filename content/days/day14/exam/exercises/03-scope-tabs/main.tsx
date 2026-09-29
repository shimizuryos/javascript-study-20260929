'use client';

import { SCOPES, useSharedScopeQuery, type Scope } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE } from './api';

/** メンバー一覧専用のラッパー。画面側は resource 名や fetcher を知らなくてよくなる */
export const useMembersQuery = () => useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE });

export const SCOPE_LABELS: Record<Scope, string> = {
  all: 'すべて',
  mine: '自分が追加',
  team: '自分のチーム',
};

export function ScopeTabs() {
  const { scope, setScope, rowCount, isPending } = useMembersQuery();
  return (
    <div>
      {SCOPES.map((s) => (
        <button key={s} aria-pressed={s === scope} onClick={() => void setScope(s)}>
          {SCOPE_LABELS[s]}
        </button>
      ))}
      <p>{isPending ? '読み込み中…' : `全 ${rowCount} 件`}</p>
    </div>
  );
}
