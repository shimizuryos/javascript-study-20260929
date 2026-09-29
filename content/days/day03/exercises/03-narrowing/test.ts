import { describeResult, formatQuery, toPage } from './main';

test("formatQuery: null や空白だけなら 'すべて'", () => {
  expect(formatQuery(null)).toBe('すべて');
  expect(formatQuery('')).toBe('すべて');
  expect(formatQuery('   ')).toBe('すべて');
});

test('formatQuery: 前後の空白を取り除いて「...」の検索結果', () => {
  expect(formatQuery('react')).toBe('「react」の検索結果');
  expect(formatQuery(' next js ')).toBe('「next js」の検索結果');
});

test('toPage: 数値と、数値に変換できる文字列', () => {
  expect(toPage(3)).toBe(3);
  expect(toPage('4')).toBe(4);
});

test('toPage: null / undefined / 変換できない文字列は 1', () => {
  expect(toPage(null)).toBe(1);
  expect(toPage(undefined)).toBe(1);
  expect(toPage('abc')).toBe(1);
});

test('describeResult: 成功なら件数、失敗ならエラーメッセージ', () => {
  expect(describeResult({ items: ['a', 'b'] })).toBe('2 件');
  expect(describeResult({ items: [] })).toBe('0 件');
  expect(describeResult({ error: '通信に失敗しました' })).toBe('エラー: 通信に失敗しました');
});
