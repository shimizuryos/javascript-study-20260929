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
  hash(['use-client', key, answers[key]]) === expected;

test('Q1: app/posts/page.tsx', () => {
  expect(check('q1', 's0ik8x')).toBe(true);
});

test('Q2: app/ui/like-button.tsx', () => {
  expect(check('q2', '1nmrlu5')).toBe(true);
});

test('Q3: app/ui/price.tsx', () => {
  expect(check('q3', '1glh4kn')).toBe(true);
});

test('Q4: app/users/row-actions.tsx', () => {
  expect(check('q4', '1daly4e')).toBe(true);
});

test('Q5: app/dashboard/error.tsx', () => {
  expect(check('q5', '1iqtvgu')).toBe(true);
});

test('Q6: app/layout.tsx', () => {
  expect(check('q6', '1gra01o')).toBe(true);
});

test('Q7: app/providers.tsx', () => {
  expect(check('q7', '1d7xqjg')).toBe(true);
});

test('Q8: app/products/search-box.tsx', () => {
  expect(check('q8', 'shh6ev')).toBe(true);
});
