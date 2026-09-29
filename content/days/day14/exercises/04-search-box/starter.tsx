'use client';

import { useState } from 'react';
import { useSharedScopeQuery } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE } from './api';

export function MemberSearch() {
  const { rows, rowCount, isPending } = useSharedScopeQuery('members', fetchMembers, {
    pageSize: PAGE_SIZE,
  });

  // TODO: 入力がこのコンポーネントの state にしか入っていない。
  //       フックの q / setSearch を使って URL とつなげる (useState は要らなくなる)
  const [text, setText] = useState('');

  return (
    <div>
      <label htmlFor="member-search">名前で検索</label>{' '}
      <input id="member-search" value={text} onChange={(e) => setText(e.target.value)} />{' '}
      {/* TODO: 押すと検索語を消す。検索語が無い (q が null) ときは disabled */}
      <button>クリア</button>
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
