'use client';

import { useSharedScopeQuery } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE } from './api';

export function MemberSearch() {
  const { q, setSearch, rows, rowCount, isPending } = useSharedScopeQuery('members', fetchMembers, {
    pageSize: PAGE_SIZE,
  });

  return (
    <div>
      <label htmlFor="member-search">名前で検索</label>{' '}
      <input id="member-search" value={q ?? ''} onChange={(e) => void setSearch(e.target.value)} />{' '}
      <button onClick={() => void setSearch('')} disabled={q === null}>
        クリア
      </button>
      <p>該当 {rowCount} 件</p>
      {isPending ? (
        <p>読み込み中…</p>
      ) : (
        <ul>
          {rows.map((member) => (
            <li key={member.id}>{member.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
