export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];

export function isScope(value: unknown): value is Scope {
  return SCOPES.some((scope) => scope === value);
}

export function parseScope(value: string | null): Scope {
  return isScope(value) ? value : 'all';
}
