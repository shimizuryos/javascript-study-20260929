import { describeResult, headAndTail, swap } from './main';

test('swap([1, 2]) は [2, 1]', () => {
  expect(swap([1, 2])).toEqual([2, 1]);
});

test('headAndTail: 最初の要素と残りに分ける', () => {
  expect(headAndTail(['a', 'b', 'c'])).toEqual({ head: 'a', tail: ['b', 'c'] });
});

test('headAndTail: 1 要素なら tail は空配列', () => {
  expect(headAndTail(['only'])).toEqual({ head: 'only', tail: [] });
});

test('describeResult: data の件数を返す', () => {
  expect(describeResult({ data: ['a', 'b'], isPending: false })).toBe('2 件');
});

test('describeResult: data が無ければ 0 件', () => {
  expect(describeResult({ isPending: false })).toBe('0 件');
});

test('describeResult: 読み込み中', () => {
  expect(describeResult({ isPending: true })).toBe('読み込み中');
});
