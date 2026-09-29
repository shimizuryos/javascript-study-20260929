import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { ArticleList } from './main';

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

/** プレビュー用: 今の URL を上に表示する */
export default function Preview() {
  const [query, setQuery] = useState('?page=2');
  return (
    <QueryClientProvider client={client}>
      <p style={{ fontFamily: 'monospace' }}>URL: /articles{query}</p>
      <NuqsTestingAdapter searchParams="?page=2" hasMemory onUrlUpdate={(event) => setQuery(event.queryString)}>
        <ArticleList />
      </NuqsTestingAdapter>
    </QueryClientProvider>
  );
}
