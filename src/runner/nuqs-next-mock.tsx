/**
 * 'nuqs/adapters/next/app' の代わり。ブラウザ内では Next.js が動かないので、
 * URL をメモリ上に持つ NuqsTestingAdapter で置き換える (layout や providers.tsx の演習用)。
 */
import type { ReactNode } from 'react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';

export function NuqsAdapter({ children }: { children?: ReactNode }) {
  return <NuqsTestingAdapter hasMemory>{children}</NuqsTestingAdapter>;
}
