import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { MembersTable } from './main';

/** プレビュー用: メモリ上の URL で動かし、今の URL を上に表示する */
export default function Preview() {
  const [queryClient] = useState(() => new QueryClient());
  const [url, setUrl] = useState('');
  return (
    <NuqsTestingAdapter hasMemory onUrlUpdate={(e) => setUrl(e.queryString)}>
      <QueryClientProvider client={queryClient}>
        <p>
          URL: <code>/members{url}</code>
        </p>
        <MembersTable />
      </QueryClientProvider>
    </NuqsTestingAdapter>
  );
}
