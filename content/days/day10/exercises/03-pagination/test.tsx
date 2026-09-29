import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@study/next-mock';
import { Pagination } from './main';

// 普通の <a> をクリックすると実行環境ごとページ移動してしまうので、テスト中は止めておく
const stopFullPageLoad = (e: MouseEvent) => {
  if (!e.defaultPrevented && e.target instanceof Element && e.target.closest('a')) e.preventDefault();
};
beforeEach(() => document.addEventListener('click', stopFullPageLoad));
afterEach(() => document.removeEventListener('click', stopFullPageLoad));

/** リンクの href を URL として分解する (クエリの順番に左右されずに確認するため) */
const hrefOf = (name: string) => new URL(screen.getByRole('link', { name }).getAttribute('href') ?? '', 'http://localhost');

test('今のページと全ページ数を表示する', () => {
  mockRouter.setUrl('/products?q=shoe&page=2');
  render(<Pagination totalPages={5} />);
  expect(screen.getByText('2 / 5')).toBeInTheDocument();
});

test('「次へ」は page だけを +1 し、パスと他のクエリを残す', () => {
  mockRouter.setUrl('/products?q=shoe&page=2&tags=a&tags=b');
  render(<Pagination totalPages={5} />);
  const next = hrefOf('次へ');
  expect(next.pathname).toBe('/products');
  expect(next.searchParams.get('page')).toBe('3');
  expect(next.searchParams.get('q')).toBe('shoe');
  expect(next.searchParams.getAll('tags')).toEqual(['a', 'b']);
});

test('「前へ」で 1 ページ目に戻るリンクは page を URL から消す', () => {
  mockRouter.setUrl('/products?q=shoe&page=2&tags=a&tags=b');
  render(<Pagination totalPages={5} />);
  const prev = hrefOf('前へ');
  expect(prev.pathname).toBe('/products');
  expect(prev.searchParams.has('page')).toBe(false);
  expect(prev.searchParams.get('q')).toBe('shoe');
  expect(prev.searchParams.getAll('tags')).toEqual(['a', 'b']);
});

test('1 ページ目では「前へ」が、最後のページでは「次へ」がリンクにならない', () => {
  mockRouter.setUrl('/products?q=shoe');
  const { unmount } = render(<Pagination totalPages={5} />);
  expect(screen.queryByRole('link', { name: '前へ' })).toBeNull();
  expect(screen.getByRole('link', { name: '次へ' })).toBeInTheDocument();
  unmount();

  mockRouter.setUrl('/products?q=shoe&page=5');
  render(<Pagination totalPages={5} />);
  expect(screen.queryByRole('link', { name: '次へ' })).toBeNull();
  expect(screen.getByRole('link', { name: '前へ' })).toBeInTheDocument();
});

test('page が不正な値 (abc) なら 1 ページ目として扱う', () => {
  mockRouter.setUrl('/products?page=abc');
  render(<Pagination totalPages={5} />);
  expect(screen.getByText('1 / 5')).toBeInTheDocument();
});

test('「次へ」をクリックすると URL が変わり、表示も更新される', async () => {
  const user = userEvent.setup();
  mockRouter.setUrl('/products?q=shoe&page=2');
  render(<Pagination totalPages={5} />);
  await user.click(screen.getByRole('link', { name: '次へ' }));
  expect(mockRouter.searchParams.get('page')).toBe('3');
  expect(mockRouter.searchParams.get('q')).toBe('shoe');
  expect(screen.getByText('3 / 5')).toBeInTheDocument();
});
