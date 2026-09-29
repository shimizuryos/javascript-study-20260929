'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryState } from 'nuqs';
import { fetchArticles, PAGE_SIZE } from './api';

const pageParser = parseAsInteger.withDefault(1);

export function ArticleList() {
  const [page, setPage] = useQueryState('page', pageParser);

  const { data, isPlaceholderData } = useQuery({
    queryKey: ['articles', { page }],
    queryFn: ({ signal }) => fetchArticles(page, signal),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div>
      {data ? (
        <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
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
