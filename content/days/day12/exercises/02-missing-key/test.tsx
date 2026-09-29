import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { calls } from './api';
import { ProductPage } from './main';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ProductPage />
    </QueryClientProvider>,
  );
  return client;
}

const names = () => screen.getAllByRole('listitem').map((li) => li.textContent);

beforeEach(() => {
  calls.length = 0;
});

test('最初は本の一覧を表示する', async () => {
  renderPage();
  expect(await screen.findByText('TypeScript 入門')).toBeInTheDocument();
  expect(names()).toEqual(['TypeScript 入門', 'React の本']);
});

test('「食品」タブを押すと食品の一覧に切り替わる', async () => {
  renderPage();
  await screen.findByText('TypeScript 入門');
  await userEvent.click(screen.getByRole('button', { name: '食品' }));
  expect(await screen.findByText('りんご')).toBeInTheDocument();
  expect(names()).toEqual(['りんご', 'コーヒー豆']);
  expect(calls).toEqual(['book', 'food']);
});

test("キャッシュはカテゴリごとに ['products', カテゴリ] のキーで保存される", async () => {
  const client = renderPage();
  await screen.findByText('TypeScript 入門');
  await userEvent.click(screen.getByRole('button', { name: '食品' }));
  await screen.findByText('りんご');
  expect(client.getQueryData(['products', 'book'])).toHaveLength(2);
  expect(client.getQueryData(['products', 'food'])).toHaveLength(2);
});

test('「本」に戻ると、キャッシュからすぐに表示される', async () => {
  renderPage();
  await screen.findByText('TypeScript 入門');
  await userEvent.click(screen.getByRole('button', { name: '食品' }));
  await screen.findByText('りんご');
  await userEvent.click(screen.getByRole('button', { name: '本' }));
  // findBy (待つ) ではなく getBy (待たない) で確かめる
  expect(screen.getByText('TypeScript 入門')).toBeInTheDocument();
});
