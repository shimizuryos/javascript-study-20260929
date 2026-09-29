import { answers } from './main';

// 正解がテストコードやエラーメッセージから読み取れないように、答えを「ハッシュ値」にして照合する
const hash = (value: unknown) => {
  const text = JSON.stringify(value) ?? 'undefined';
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
};
const check = (key: keyof typeof answers, expected: string) =>
  hash(['hydration', key, answers[key]]) === expected;

test('Q1: レンダー中に new Date() (Client Component)', () => {
  expect(check('q1', '1muw6ix')).toBe(true);
});

test('Q2: useEffect で時刻を入れる', () => {
  expect(check('q2', '1bgwrjp')).toBe(true);
});

test('Q3: typeof window で分岐', () => {
  expect(check('q3', '1ovdu63')).toBe(true);
});

test('Q4: <p> の中に <div>', () => {
  expect(check('q4', '1r4e9hs')).toBe(true);
});

test('Q5: Server Component で new Date()', () => {
  expect(check('q5', 'ogf94o')).toBe(true);
});

test('Q6: suppressHydrationWarning', () => {
  expect(check('q6', '1rcoy1t')).toBe(true);
});
