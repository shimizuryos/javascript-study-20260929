import { answers } from './main';

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) =>
  typeof answer === typeof actual &&
  JSON.stringify(answer) === JSON.stringify(actual) &&
  (typeof actual !== 'object' || actual === null || Object.keys(answer as object).join() === Object.keys(actual).join());

test('Q1: y の値', () => {
  const [, y = 5] = [1, undefined];
  expect(same(answers.q1, y)).toBe(true);
});

test('Q2: b の値', () => {
  const { a: b = 1 } = { a: null } as { a: number | null };
  expect(same(answers.q2, b)).toBe(true);
});

test('Q3: f(1) の値', () => {
  const f = (n: number): void => {
    void (n + 1);
  };
  expect(same(answers.q3, f(1))).toBe(true);
});

test('Q4: rest の値', () => {
  const { page: _page, ...rest } = { page: 2, q: 'ts', size: 20 };
  expect(same(answers.q4, rest)).toBe(true);
});

test('Q5: merged の値', () => {
  const merged = { ...{ page: 2, q: 'ts' }, ...{ q: undefined } };
  expect(same(answers.q5, merged)).toBe(true);
});

test('Q6: first の値', () => {
  const [first] = [] as unknown[];
  expect(same(answers.q6, first)).toBe(true);
});
