export type Params = Record<string, string | string[]>;

export function matchRoute(pattern: string, pathname: string): Params | null {
  // TODO: pattern と pathname を '/' で分けて、セグメントを 1 つずつ比べる
  //   - [id]        → params.id = '42'
  //   - [...slug]   → params.slug = ['a', 'b'] (1 つ以上)
  //   - (group)     → 無視する
  // 今は「完全に同じ文字列なら {}」しか判定できていない
  return pattern === pathname ? {} : null;
}
