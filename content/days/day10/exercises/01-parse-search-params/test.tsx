import { render, screen } from '@testing-library/react';
import ProductsPage, { parseSearchParams } from './main';

test('普通の値を変換する', () => {
  expect(parseSearchParams({ page: '2', q: 'shoe', tags: 'red' })).toEqual({ page: 2, q: 'shoe', tags: ['red'] });
});

test('何も無ければ { page: 1, q: null, tags: [] }', () => {
  expect(parseSearchParams({})).toEqual({ page: 1, q: null, tags: [] });
});

test('同じキーが複数 (配列) のとき: page と q は最初の値、tags は配列のまま', () => {
  expect(parseSearchParams({ page: ['3', '4'], q: ['a', 'b'], tags: ['red', 'blue'] })).toEqual({
    page: 3,
    q: 'a',
    tags: ['red', 'blue'],
  });
});

test('page が 1 以上の整数でなければ 1 にする', () => {
  // 順に ?page=abc, ?page=0, ?page=-2, ?page=2.5, ?page= のとき
  const pages = ['abc', '0', '-2', '2.5', ''].map((page) => parseSearchParams({ page }).page);
  expect(pages).toEqual([1, 1, 1, 1, 1]);
});

test('q が空文字 (?q=) なら null にする', () => {
  expect(parseSearchParams({ q: '' }).q).toBeNull();
});

test('ProductsPage: searchParams を await して表示する', async () => {
  render(await ProductsPage({ searchParams: Promise.resolve({ page: '2', q: 'shoe', tags: ['red', 'blue'] }) }));
  expect(screen.getByText('2 ページ目')).toBeInTheDocument();
  expect(screen.getByText('検索語: shoe')).toBeInTheDocument();
  expect(screen.getByText('タグ: red, blue')).toBeInTheDocument();
});
