export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];
export type ScopeParams = { scope: Scope; page: number; q: string | null };
type Options = { pageSize?: number; enabled?: boolean };

export function normalizeQuery(q: string | null): string {
  if (q === null) return '';
  return q.trim().toLowerCase();
}

export function offsetOf(page: number, options: Options): number {
  const pageSize = options.pageSize ?? 20;
  return (page - 1) * pageSize;
}

export function defaultParams(): ScopeParams {
  const params: ScopeParams = { scope: 'all', page: 1, q: null };
  return params;
}
