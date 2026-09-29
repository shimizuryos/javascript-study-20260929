// TODO: as const を付けて、要素を 'all' | 'mine' | 'team' のリテラル型として固定する
export const SCOPES = ['all', 'mine', 'team'];

// TODO: SCOPES から作る ('all' | 'mine' | 'team' と直接書かない)
export type Scope = string;

// TODO: as const を付ける
export const SCOPE_KEYS = {
  scope: 'scope',
  page: 'page',
  q: 'q',
};

// TODO: SCOPE_KEYS のキーのユニオン ('scope' | 'page' | 'q') を SCOPE_KEYS から作る
export type ScopeKey = string;

/** 'all' → 'mine' → 'team' → 'all' の順に切り替える (ここは変更不要) */
export function nextScope(current: Scope): Scope {
  const index = SCOPES.indexOf(current);
  return SCOPES[(index + 1) % SCOPES.length];
}
