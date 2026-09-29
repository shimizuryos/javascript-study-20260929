import { render, screen } from '@testing-library/react';
import { apiCalls } from './api';
import { App } from './main';

beforeEach(() => {
  apiCalls.me = 0;
  apiCalls.users = 0;
});

test('エラーにならず、ヘッダーにログイン中のユーザーが表示される', async () => {
  render(<App />);
  expect(await screen.findByText('ログイン中: Alice')).toBeInTheDocument();
});

test('ヘッダーにもテーマが届いている', () => {
  render(<App />);
  expect(screen.getByRole('banner')).toHaveAttribute('class', 'header theme-dark');
});

test('一覧に 3 人が表示され、自分の行に (あなた) が付く', async () => {
  render(<App />);
  expect(await screen.findByText('Alice (あなた)')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('ヘッダーと一覧が同じ QueryClient を共有している (fetchMe は 1 回だけ)', async () => {
  render(<App />);
  await screen.findByText('ログイン中: Alice');
  await screen.findByText('Alice (あなた)');
  expect(apiCalls.me).toBe(1);
});
