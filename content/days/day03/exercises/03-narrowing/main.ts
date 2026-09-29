export function formatQuery(q: string | null): string {
  if (q === null) return 'すべて';
  const text = q.trim();
  if (text === '') return 'すべて';
  return `「${text}」の検索結果`;
}

export function toPage(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 1;
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isNaN(n) ? 1 : n;
}

export type LoadResult = { items: string[] } | { error: string };

export function describeResult(result: LoadResult): string {
  if ('error' in result) return `エラー: ${result.error}`;
  return `${result.items.length} 件`;
}
