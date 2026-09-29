import { useEffect, useState } from 'react';

export type SearchFn = (q: string, signal: AbortSignal) => Promise<string[]>;

export function useSearch(q: string, search: SearchFn) {
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);

  // TODO: useEffect で search(q, signal) を呼び、結果を results に入れる
  // TODO: クリーンアップで controller.abort() する。中断したリクエストの結果とエラーは無視する

  return { results, error };
}
