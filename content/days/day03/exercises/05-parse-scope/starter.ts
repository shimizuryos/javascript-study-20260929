export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];

export function isScope(value: unknown): value is Scope {
  // 型エラー: unknown は 'all' | 'mine' | 'team' に割り当てられない
  return SCOPES.includes(value);
}

export function parseScope(value: string | null): Scope {
  // TODO: isScope を使って、Scope ならそのまま、そうでなければ 'all' を返す
  return value;
}
