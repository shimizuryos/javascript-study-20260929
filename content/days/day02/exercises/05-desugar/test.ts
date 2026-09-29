import { ageOf, greetOf, nicknameOf } from './main';

test("nicknameOf: どこかが null / undefined なら '(なし)'", () => {
  expect(nicknameOf(null)).toBe('(なし)');
  expect(nicknameOf(undefined)).toBe('(なし)');
  expect(nicknameOf({ name: 'A' })).toBe('(なし)');
  expect(nicknameOf({ name: 'A', profile: null })).toBe('(なし)');
  expect(nicknameOf({ name: 'A', profile: { nickname: null } })).toBe('(なし)');
});

test('nicknameOf: 値があればそのまま (空文字も)', () => {
  expect(nicknameOf({ name: 'A', profile: { nickname: 'Ali' } })).toBe('Ali');
  expect(nicknameOf({ name: 'A', profile: { nickname: '' } })).toBe('');
});

test('ageOf: 無ければ -1、0 は 0 のまま', () => {
  expect(ageOf(null)).toBe(-1);
  expect(ageOf({ name: 'A', profile: {} })).toBe(-1);
  expect(ageOf({ name: 'A', profile: { age: 0 } })).toBe(0);
  expect(ageOf({ name: 'A', profile: { age: 30 } })).toBe(30);
});

test('greetOf: greet があれば呼んだ結果、無ければ undefined', () => {
  expect(greetOf({ name: 'A', greet: () => 'hi' })).toBe('hi');
  expect(greetOf({ name: 'A' })).toBeUndefined();
  expect(greetOf(null)).toBeUndefined();
});

test('?. と ?? を使っていない', () => {
  // コメントを取り除いたソースコードを調べる
  const source = (f: (...args: never[]) => unknown) =>
    f
      .toString()
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  for (const f of [nicknameOf, ageOf, greetOf]) {
    expect(source(f)).not.toMatch(/\?\.|\?\?/);
  }
});
