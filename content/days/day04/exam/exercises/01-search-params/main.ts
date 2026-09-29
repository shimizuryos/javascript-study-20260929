export const PARAM_KEYS = { scope: 'scope', page: 'p', q: 'keyword' } as const;
export type Params = { scope: string; page: number; q: string | null };

export function toSearchObject({ scope, page, q }: Params): Record<string, string> {
  const base = { [PARAM_KEYS.scope]: scope, [PARAM_KEYS.page]: String(page) };
  return q ? { ...base, [PARAM_KEYS.q]: q } : base;
}

export const changeScope = (params: Params, scope: string): Params => ({ ...params, scope, page: 1 });

export function fromSearchObject(search: Record<string, string | undefined>): Params {
  return {
    scope: search[PARAM_KEYS.scope] ?? 'all',
    page: Number(search[PARAM_KEYS.page] ?? '1'),
    q: search[PARAM_KEYS.q] || null,
  };
}
