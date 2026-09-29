import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { ArticleList } from './main';

function renderAt(searchParams: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <QueryClientProvider client={client}>
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
        <ArticleList />
      </NuqsTestingAdapter>
    </QueryClientProvider>,
  );
  return { client, onUrlUpdate };
}

const titles = () => screen.getAllByRole('listitem').map((li) => li.textContent);

test('URL が ?page=2 なら 2 ページ目の記事を取得して表示する', async () => {
  renderAt('?page=2');
  expect(await screen.findByText('記事 4')).toBeInTheDocument();
  expect(titles()).toEqual(['記事 4', '記事 5', '記事 6']);
  expect(screen.getByText('2 / 3 ページ')).toBeInTheDocument();
});

test('「次へ」を押すと URL が ?page=3 になり、3 ページ目を取得する', async () => {
  const { onUrlUpdate } = renderAt('?page=2');
  await screen.findByText('記事 4');
  await userEvent.click(screen.getByRole('button', { name: '次へ' }));
  expect(await screen.findByText('記事 7')).toBeInTheDocument();
  expect(titles()).toEqual(['記事 7', '記事 8']);
  await waitFor(() => expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?page=3'));
  expect(screen.getByRole('button', { name: '次へ' })).toBeDisabled();
});

test("キャッシュのキーは ['articles', { page }]", async () => {
  const { client } = renderAt('?page=2');
  await screen.findByText('記事 4');
  expect(client.getQueryData(['articles', { page: 2 }])).toMatchObject({ total: 8 });
});
