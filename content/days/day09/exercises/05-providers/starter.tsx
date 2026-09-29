'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from './nuqs-adapter';

export function Providers({ children }: { children: ReactNode }) {
  // TODO 1: これだとレンダーのたびに新しい QueryClient (= 空のキャッシュ) が作られてしまう
  const queryClient = new QueryClient();

  // TODO 2: NuqsAdapter でも children を囲む
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
