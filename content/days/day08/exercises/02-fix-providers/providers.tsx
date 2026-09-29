'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme | null>(null);

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error('useTheme は <Providers> の中で使ってください');
  }
  return theme;
}

/** アプリ全体で使う Provider をまとめたもの (Next.js なら app/providers.tsx) */
export function Providers({ theme = 'dark', children }: { theme?: Theme; children: ReactNode }) {
  // マウント中はずっと同じ QueryClient (キャッシュ) を使う
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext value={theme}>{children}</ThemeContext>
    </QueryClientProvider>
  );
}
