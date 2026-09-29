export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];
export type ScopeParams = { scope: Scope; page: number; q: string | null };
type Options = { pageSize?: number; enabled?: boolean };

/** 前後の空白を除いて小文字にする。null なら '' */
export function normalizeQuery(q: string | null): string {
  return q.trim().toLowerCase();
}

/** page ページ目 (1 始まり) の先頭が何件目か (0 始まり)。pageSize が省略されたら 20 */
export function offsetOf(page: number, options: Options): number {
  return (page - 1) * options.pageSize;
}

/** URL に何も無いときの初期値 */
export function defaultParams(): ScopeParams {
  const params = { scope: 'all', page: 1, q: null };
  return params;
}
