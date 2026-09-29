'use client';

import { useState } from 'react';
// import { parseAsInteger, useQueryState } from 'nuqs';

export function Pager() {
  // TODO: useState ではなく URL の ?page= に置く (無い・不正なら 1)
  const [page, setPage] = useState(1);

  return (
    <div>
      <p>{page} ページ目</p>
      <button onClick={() => setPage(page - 1)}>前へ</button>
      <button onClick={() => setPage(page + 1)}>次へ</button>
    </div>
  );
}
