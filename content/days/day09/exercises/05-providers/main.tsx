'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from './nuqs-adapter';

export function Providers({ children }: { children: ReactNode }) {
  // 最初のレンダーで 1 回だけ作り、以後は同じ QueryClient (= 同じキャッシュ) を使う
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
