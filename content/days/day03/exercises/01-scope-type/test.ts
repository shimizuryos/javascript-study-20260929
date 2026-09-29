import { SCOPES, SCOPE_KEYS, nextScope, type Scope, type ScopeKey } from './main';

type cases = [
  Expect<Equal<typeof SCOPES, readonly ['all', 'mine', 'team']>>,
  Expect<Equal<Scope, 'all' | 'mine' | 'team'>>,
  Expect<Equal<typeof SCOPE_KEYS, { readonly scope: 'scope'; readonly page: 'page'; readonly q: 'q' }>>,
  Expect<Equal<ScopeKey, 'scope' | 'page' | 'q'>>,
];

// @ts-expect-error — Scope に無い値は代入できない
const bad: Scope = 'org';

// この関数は呼ばない (型チェックだけに使う)
function readonlyCheck() {
  // @ts-expect-error — as const を付けた配列は読み取り専用なので push できない
  SCOPES.push('org');
  // @ts-expect-error — as const を付けたオブジェクトのプロパティは書き換えられない
  SCOPE_KEYS.page = 'p';
}

test('nextScope: all → mine → team → all の順に切り替わる', () => {
  expect(nextScope('all')).toBe('mine');
  expect(nextScope('mine')).toBe('team');
  expect(nextScope('team')).toBe('all');
});

test('実行時の値は as const を付けても変わらない', () => {
  expect(SCOPES).toEqual(['all', 'mine', 'team']);
  expect(SCOPE_KEYS).toEqual({ scope: 'scope', page: 'page', q: 'q' });
  expect(bad).toBe('org');
  expect(readonlyCheck).toBeTypeOf('function');
});
