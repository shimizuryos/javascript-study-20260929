import type { A1, A10, A2, A3, A4, A5, A6, A7, A8, A9 } from './main';

const e1 = 'mine';
let e2 = 'mine';
const e3 = { page: 1, q: 'ts' };
const e4 = { page: 1, q: 'ts' } as const;
const e5 = [1, 2, 3];
const e6 = ['a', 1];
const e7 = ['all', 'mine'] as const;
const e8 = Math.random() > 0.5 ? 'x' : null;

type cases = [
  Expect<Equal<A1, typeof e1>>, // Q1
  Expect<Equal<A2, typeof e2>>, // Q2
  Expect<Equal<A3, typeof e3>>, // Q3
  Expect<Equal<A4, typeof e4>>, // Q4
  Expect<Equal<A5, typeof e5>>, // Q5
  Expect<Equal<A6, typeof e6>>, // Q6
  Expect<Equal<A7, typeof e7>>, // Q7
  Expect<Equal<A8, (typeof e7)[number]>>, // Q8
  Expect<Equal<A9, typeof e8>>, // Q9
  Expect<Equal<A10, keyof typeof e3>>, // Q10
];

test('型の答え合わせは「型チェック」の結果で行います (ここでは実行時の値だけ確認)', () => {
  e2 = 'team';
  expect([e1, e2]).toEqual(['mine', 'team']);
  expect(e3).toEqual(e4);
  expect([...e5, ...e6, ...e7]).toHaveLength(7);
  expect(e8 === null || e8 === 'x').toBe(true);
});
