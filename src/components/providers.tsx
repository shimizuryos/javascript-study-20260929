'use client';

import { useEffect } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { startSync } from '@/lib/sync/sync';

/**
 * アプリ全体を包むクライアント側の Provider。
 * (Day 9 で学ぶ「layout から 'use client' の providers.tsx を使う」パターンそのもの)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // ログイン状態の確認と、サーバーとの進捗の同期を始める (サーバーが無い環境では何もしない)
  useEffect(() => startSync(), []);
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
