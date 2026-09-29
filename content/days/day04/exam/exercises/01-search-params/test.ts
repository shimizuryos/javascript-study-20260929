import { changeScope, fromSearchObject, toSearchObject, type Params } from './main';

test('toSearchObject: PARAM_KEYS の名前をキーにして、値を文字列にする', () => {
  expect(toSearchObject({ scope: 'mine', page: 2, q: 'react' })).toEqual({ scope: 'mine', p: '2', keyword: 'react' });
});

test('toSearchObject: q が null や空文字なら keyword を含めない', () => {
  expect(toSearchObject({ scope: 'all', page: 1, q: null })).toEqual({ scope: 'all', p: '1' });
  expect(toSearchObject({ scope: 'all', page: 1, q: '' })).toEqual({ scope: 'all', p: '1' });
  expect(Object.keys(toSearchObject({ scope: 'all', page: 1, q: null }))).toEqual(['scope', 'p']);
});

test('changeScope: scope を変えて page を 1 に戻す (元のオブジェクトは変えない)', () => {
  const params: Params = { scope: 'all', page: 5, q: 'ts' };
  const next = changeScope(params, 'team');
  expect(next).toEqual({ scope: 'team', page: 1, q: 'ts' });
  expect(next).not.toBe(params);
  expect(params).toEqual({ scope: 'all', page: 5, q: 'ts' });
});

test('fromSearchObject: 値があればそれを使う (page は数値)', () => {
  expect(fromSearchObject({ scope: 'mine', p: '3', keyword: 'react' })).toEqual({ scope: 'mine', page: 3, q: 'react' });
});

test("fromSearchObject: 無いときは 'all' / 1 / null。keyword の空文字も null", () => {
  expect(fromSearchObject({})).toEqual({ scope: 'all', page: 1, q: null });
  expect(fromSearchObject({ keyword: '' })).toEqual({ scope: 'all', page: 1, q: null });
});
