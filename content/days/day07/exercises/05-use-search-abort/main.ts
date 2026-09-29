import { useEffect, useState } from 'react';

export type SearchFn = (q: string, signal: AbortSignal) => Promise<string[]>;

export function useSearch(q: string, search: SearchFn) {
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const controller = new AbortController();
    search(q, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResults(items);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e);
      });
    return () => controller.abort();
  }, [q, search]);

  return { results, error };
}
