'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

/**
 * アプリ全体を包むクライアント側の Provider。
 * (Day 9 で学ぶ「layout から 'use client' の providers.tsx を使う」パターンそのもの)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
