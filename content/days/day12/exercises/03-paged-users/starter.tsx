'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsersPage } from './api';

export function PagedUsers() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useQuery({
    queryKey: ['users', { page }],
    queryFn: () => fetchUsersPage(page), // TODO: signal を渡す
    // TODO: ページ切り替え中も前のデータを表示する
  });

  if (isPending) return <p>読み込み中…</p>;
  if (isError) return <p>エラーが発生しました</p>;

  return (
    <div>
      <ul>
        {data.items.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {/* TODO: 取得中は「更新中…」 */}
      <p>{page} ページ目</p>
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
        前へ
      </button>
      {/* TODO: 仮のデータを表示している間も押せないようにする */}
      <button onClick={() => setPage((p) => p + 1)} disabled={!data.hasMore}>
        次へ
      </button>
    </div>
  );
}
