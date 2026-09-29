'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchUsersPage } from './api';

export function PagedUsers() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['users', { page }],
    queryFn: ({ signal }) => fetchUsersPage(page, signal),
    placeholderData: keepPreviousData,
  });

  if (isPending) return <p>読み込み中…</p>;
  if (isError) return <p>エラーが発生しました</p>;

  return (
    <div>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.items.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {isFetching && <p>更新中…</p>}
      <p>{page} ページ目</p>
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
        前へ
      </button>
      <button onClick={() => setPage((p) => p + 1)} disabled={isPlaceholderData || !data.hasMore}>
        次へ
      </button>
    </div>
  );
}
