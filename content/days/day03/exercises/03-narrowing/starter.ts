export function formatQuery(q: string | null): string {
  // TODO: null や空白だけなら 'すべて'、それ以外は「...」の検索結果
  return '';
}

export function toPage(value: string | number | null | undefined): number {
  // TODO: typeof で場合分けする
  return 0;
}

export type LoadResult = { items: string[] } | { error: string };

export function describeResult(result: LoadResult): string {
  // TODO: 'error' in result で見分ける
  return '';
}
