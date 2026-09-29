import { defaultParams, normalizeQuery, offsetOf, type ScopeParams } from './main';

type cases = [Expect<Equal<ReturnType<typeof defaultParams>, ScopeParams>>];

test('normalizeQuery: 前後の空白を除いて小文字にする', () => {
  expect(normalizeQuery(' React ')).toBe('react');
});

test("normalizeQuery: null なら ''", () => {
  expect(normalizeQuery(null)).toBe('');
});

test('offsetOf: pageSize を指定したとき', () => {
  expect(offsetOf(3, { pageSize: 10 })).toBe(20);
  expect(offsetOf(1, { pageSize: 10 })).toBe(0);
});

test('offsetOf: pageSize を省略したら 20 件ずつ', () => {
  expect(offsetOf(3, {})).toBe(40);
});

test('defaultParams: 初期値を返す', () => {
  expect(defaultParams()).toEqual({ scope: 'all', page: 1, q: null });
});
