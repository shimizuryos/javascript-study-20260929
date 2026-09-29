export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];

export const SCOPE_KEYS = {
  scope: 'scope',
  page: 'page',
  q: 'q',
} as const;
export type ScopeKey = keyof typeof SCOPE_KEYS;

/** 'all' → 'mine' → 'team' → 'all' の順に切り替える */
export function nextScope(current: Scope): Scope {
  const index = SCOPES.indexOf(current);
  return SCOPES[(index + 1) % SCOPES.length];
}
