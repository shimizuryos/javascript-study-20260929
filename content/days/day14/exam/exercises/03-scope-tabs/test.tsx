import type { ReactNode } from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { ScopeTabs, useMembersQuery } from './main';
import { PAGE_SIZE } from './api';

function providers(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  /** 最後に書き込まれた URL のクエリ (まだ書き込まれていなければ null) */
  const lastUrl = () => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? null;
  return { wrapper, queryClient, lastUrl, onUrlUpdate };
}

test("useMembersQuery: queryKey は ['members', { ..., pageSize: 5 }] で、1 ページ 5 件を返す", async () => {
  const { wrapper, queryClient } = providers('?scope=team');
  const { result } = renderHook(() => useMembersQuery(), { wrapper });
  await waitFor(() => expect(result.current.rows).toHaveLength(5));
  expect(result.current.rowCount).toBe(6);
  const keys = queryClient.getQueryCache().getAll().map((query) => query.queryKey);
  expect(keys).toEqual([['members', { scope: 'team', page: 1, q: null, pageSize: PAGE_SIZE }]]);
});

test('ScopeTabs: 3 つのボタンが SCOPES の順に並び、URL の scope のボタンだけ aria-pressed="true"', async () => {
  const { wrapper } = providers('?scope=team');
  render(<ScopeTabs />, { wrapper });
  const buttons = screen.getAllByRole('button');
  expect(buttons.map((b) => b.textContent)).toEqual(['すべて', '自分が追加', '自分のチーム']);
  expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
  expect(await screen.findByText('全 6 件')).toBeInTheDocument();
});

test('「自分が追加」を押すと URL が scope=mine になり、page が消え、全 3 件と表示される', async () => {
  const { wrapper, lastUrl } = providers('?page=2');
  render(<ScopeTabs />, { wrapper });
  await screen.findByText('全 12 件');
  await userEvent.setup().click(screen.getByRole('button', { name: '自分が追加' }));
  await waitFor(() => expect(lastUrl()?.get('scope')).toBe('mine'));
  expect(lastUrl()?.has('page')).toBe(false);
  expect(screen.getByRole('button', { name: '自分が追加' })).toHaveAttribute('aria-pressed', 'true');
  expect(await screen.findByText('全 3 件')).toBeInTheDocument();
});

test('?scope=team&page=2 で「すべて」を押すと、scope も page も URL から消える', async () => {
  const { wrapper, lastUrl } = providers('?scope=team&page=2');
  render(<ScopeTabs />, { wrapper });
  await screen.findByText('全 6 件');
  await userEvent.setup().click(screen.getByRole('button', { name: 'すべて' }));
  await waitFor(() => expect(lastUrl()?.toString()).toBe(''));
  expect(await screen.findByText('全 12 件')).toBeInTheDocument();
});
