import { answers } from './main';

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) =>
  typeof answer === typeof actual &&
  JSON.stringify(answer) === JSON.stringify(actual) &&
  (typeof actual !== 'object' || actual === null || Object.keys(answer as object).join() === Object.keys(actual).join());

type Res = {
  data?: { items: string[]; total: number };
  error: { message: string } | null;
};
const loaded: Res = { data: { items: [], total: 0 }, error: null };
const loading: Res = { error: null };

test('Q1: loaded.data?.total || 10', () => {
  expect(same(answers.q1, loaded.data?.total || 10)).toBe(true);
});

test('Q2: loaded.data?.total ?? 10', () => {
  expect(same(answers.q2, loaded.data?.total ?? 10)).toBe(true);
});

test("Q3: loading.data?.items ?? ['なし']", () => {
  expect(same(answers.q3, loading.data?.items ?? ['なし'])).toBe(true);
});

test('Q4: loading.data?.items.length', () => {
  expect(same(answers.q4, loading.data?.items.length)).toBe(true);
});

test('Q5: loaded.error?.message', () => {
  expect(same(answers.q5, loaded.error?.message)).toBe(true);
});

test("Q6: [text || 'なし', text ?? 'なし']", () => {
  const text: string = '';
  expect(same(answers.q6, [text || 'なし', text ?? 'なし'])).toBe(true);
});

test("Q7: handlers.onDone?.() ?? '未登録'", () => {
  const handlers: { onDone?: () => string } = {};
  expect(same(answers.q7, handlers.onDone?.() ?? '未登録')).toBe(true);
});

test("Q8: loaded.data?.items?.[0] ?? '(空)'", () => {
  expect(same(answers.q8, loaded.data?.items?.[0] ?? '(空)')).toBe(true);
});
