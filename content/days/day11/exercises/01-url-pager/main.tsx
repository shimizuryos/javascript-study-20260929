'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

export function Pager() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  return (
    <div>
      <p>{page} ページ目</p>
      <button onClick={() => setPage((old) => old - 1)} disabled={page <= 1}>
        前へ
      </button>
      <button onClick={() => setPage((old) => old + 1)}>次へ</button>
    </div>
  );
}
