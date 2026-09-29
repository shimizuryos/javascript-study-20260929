import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@study/next-mock';
import DashboardLayout from './layout';

// 普通の <a> をクリックすると実行環境ごとページ移動してしまうので、テスト中は止めておく
const stopFullPageLoad = (e: MouseEvent) => {
  if (!e.defaultPrevented && e.target instanceof Element && e.target.closest('a')) e.preventDefault();
};
beforeEach(() => document.addEventListener('click', stopFullPageLoad));
afterEach(() => document.removeEventListener('click', stopFullPageLoad));

const renderLayout = () =>
  render(
    <DashboardLayout>
      <p>ページの本文</p>
    </DashboardLayout>,
  );

test('layout の children が <main> の中に表示される', () => {
  mockRouter.setUrl('/dashboard');
  renderLayout();
  expect(screen.getByRole('main')).toHaveTextContent('ページの本文');
});

test('各リンクの href が正しい', () => {
  mockRouter.setUrl('/dashboard');
  renderLayout();
  expect(screen.getByRole('link', { name: '概要' })).toHaveAttribute('href', '/dashboard');
  expect(screen.getByRole('link', { name: 'ユーザー' })).toHaveAttribute('href', '/dashboard/users');
  expect(screen.getByRole('link', { name: '設定' })).toHaveAttribute('href', '/dashboard/settings');
});

test('今のページのリンクにだけ aria-current="page" が付く', () => {
  mockRouter.setUrl('/dashboard/users');
  renderLayout();
  expect(screen.getByRole('link', { name: 'ユーザー' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '概要' })).not.toHaveAttribute('aria-current');
  expect(screen.getByRole('link', { name: '設定' })).not.toHaveAttribute('aria-current');
});

test('URL にクエリ (?page=2) が付いていても、パスが同じなら今のページとみなす', () => {
  mockRouter.setUrl('/dashboard/users?page=2');
  renderLayout();
  expect(screen.getByRole('link', { name: 'ユーザー' })).toHaveAttribute('aria-current', 'page');
});

test('リンクをクリックすると URL が変わり、aria-current も移る', async () => {
  const user = userEvent.setup();
  mockRouter.setUrl('/dashboard');
  renderLayout();
  expect(screen.getByRole('link', { name: '概要' })).toHaveAttribute('aria-current', 'page');

  await user.click(screen.getByRole('link', { name: '設定' }));

  expect(mockRouter.url).toBe('/dashboard/settings');
  expect(screen.getByRole('link', { name: '設定' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '概要' })).not.toHaveAttribute('aria-current');
});
