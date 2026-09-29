'use client';

import { useState } from 'react';
// import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import { parseAsInteger, useQueryState } from 'nuqs';
import { fetchArticles, PAGE_SIZE } from './api';

export function ArticleList() {
  // TODO: URL の ?page= に置く (無ければ 1)
  const [page, setPage] = useState(1);

  // TODO: useQuery で fetchArticles(page, signal) を呼ぶ (キーは ['articles', { page }])
  const data = undefined as { items: { id: number; title: string }[]; total: number } | undefined;
  const isPlaceholderData = false;

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div>
      {data ? (
        <ul>
          {data.items.map((article) => (
            <li key={article.id}>{article.title}</li>
          ))}
        </ul>
      ) : (
        <p>読み込み中…</p>
      )}
      <p>
        {page} / {totalPages} ページ
      </p>
      <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        前へ
      </button>
      <button onClick={() => setPage(page + 1)} disabled={isPlaceholderData || page >= totalPages}>
        次へ
      </button>
    </div>
  );
}
