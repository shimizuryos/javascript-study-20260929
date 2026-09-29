import { render, screen } from '@testing-library/react';
import ProductsPage, { parseListParams } from './main';

test('正しい値はそのまま使う', () => {
  expect(parseListParams({ page: '2', q: 'shoe', sort: 'old' })).toEqual({ page: 2, q: 'shoe', sort: 'old' });
});

test('値が無いときはデフォルト値 (page: 1, q: 空文字, sort: new)', () => {
  expect(parseListParams({})).toEqual({ page: 1, q: '', sort: 'new' });
});

test('不正な page や sort はデフォルト値にする', () => {
  expect(parseListParams({ page: 'abc', sort: 'popular' })).toEqual({ page: 1, q: '', sort: 'new' });
  expect(parseListParams({ page: '0' }).page).toBe(1);
  expect(parseListParams({ page: '-3' }).page).toBe(1);
  expect(parseListParams({ page: '2.5' }).page).toBe(1);
});

test('同じキーが複数あって配列になっているときは、最初の値を使う', () => {
  expect(parseListParams({ q: ['a', 'b'], page: ['3', '4'] })).toEqual({ page: 3, q: 'a', sort: 'new' });
});

test('ProductsPage: searchParams (Promise) を読んで表示する', async () => {
  render(await ProductsPage({ searchParams: Promise.resolve({ page: '3', q: 'bag' }) }));
  expect(screen.getByText('page=3 q=bag sort=new')).toBeInTheDocument();
});
