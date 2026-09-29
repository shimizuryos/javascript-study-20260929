import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { useSharedScopeQuery, type ScopeParams } from './main';
import { fetchMembers, PAGE_SIZE } from './api';

/** URL (searchParams) と取得関数を決めてフックを動かす */
function setup(searchParams: string, fetcher: typeof fetchMembers = fetchMembers) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const spy = vi.fn(fetcher);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  const hook = renderHook(() => useSharedScopeQuery('members', spy, { pageSize: PAGE_SIZE }), { wrapper });
  /** 最後に書き込まれた URL のクエリ (まだ書き込まれていなければ null) */
  const lastUrl = () => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? null;
  return { ...hook, fetcher: spy, queryClient, lastUrl };
}

const names = (rows: { name: string }[]) => rows.map((r) => r.name);

test('URL の ?scope=team&page=2&q=田 を読み取り、scope / q / pagination (0 始まり) に反映する', () => {
  const { result } = setup('?scope=team&page=2&q=田');
  expect(result.current.scope).toBe('team');
  expect(result.current.q).toBe('田');
  expect(result.current.tableState.pagination).toEqual({ pageIndex: 1, pageSize: PAGE_SIZE });
});

test('URL が空なら scope=all, page=1, q=null で fetcher を呼び、rows と rowCount を返す', async () => {
  const { result, fetcher, queryClient } = setup('');
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(fetcher).toHaveBeenCalledWith({ scope: 'all', page: 1, q: null } satisfies ScopeParams, expect.any(AbortSignal));
  expect(names(result.current.rows)).toEqual(['佐藤', '鈴木', '高橋', '田中', '伊藤']);
  expect(result.current.rowCount).toBe(12);
  const keys = queryClient.getQueryCache().getAll().map((query) => query.queryKey);
  expect(keys).toEqual([['members', { scope: 'all', page: 1, q: null, pageSize: PAGE_SIZE }]]);
});

test('setScope / setSearch は page を URL から消す (1 ページ目に戻す)。空の検索語は q を消す', async () => {
  const { result, lastUrl } = setup('?page=3&q=田');
  act(() => {
    void result.current.setScope('team');
  });
  await waitFor(() => expect(lastUrl()?.get('scope')).toBe('team'));
  expect(lastUrl()?.has('page')).toBe(false);
  expect(result.current.tableState.pagination.pageIndex).toBe(0);

  act(() => {
    result.current.onPaginationChange({ pageIndex: 1, pageSize: PAGE_SIZE });
  });
  await waitFor(() => expect(lastUrl()?.get('page')).toBe('2'));
  act(() => {
    void result.current.setSearch('');
  });
  await waitFor(() => expect(lastUrl()?.has('page')).toBe(false));
  expect(lastUrl()?.has('q')).toBe(false);
  expect(result.current.q).toBeNull();
});

test('onPaginationChange に「値」{ pageIndex: 2, pageSize } を渡すと URL が page=3 になる', async () => {
  const { result, lastUrl } = setup('');
  act(() => {
    result.current.onPaginationChange({ pageIndex: 2, pageSize: PAGE_SIZE });
  });
  await waitFor(() => expect(lastUrl()?.get('page')).toBe('3'));
  expect(result.current.tableState.pagination.pageIndex).toBe(2);
  await waitFor(() => expect(names(result.current.rows)).toEqual(['吉田', '山田']));
});

test('onPaginationChange に「関数」(old) => ({ ...old, pageIndex: old.pageIndex + 1 }) を渡すと次のページへ進む', async () => {
  const { result, lastUrl } = setup('?page=2');
  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));
  });
  await waitFor(() => expect(lastUrl()?.get('page')).toBe('3'));
  expect(result.current.tableState.pagination).toEqual({ pageIndex: 2, pageSize: PAGE_SIZE });
});

test('次のページの取得中は前のページの rows が残り、isPlaceholderData が true になる', async () => {
  const slowFetch: typeof fetchMembers = async (params, signal) => {
    await new Promise((r) => setTimeout(r, 150));
    return fetchMembers(params, signal);
  };
  const { result } = setup('', slowFetch);
  await waitFor(() => expect(result.current.isPending).toBe(false));
  expect(names(result.current.rows)[0]).toBe('佐藤');

  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));
  });
  await waitFor(() => expect(result.current.isFetching).toBe(true));
  expect(result.current.isPlaceholderData).toBe(true);
  expect(names(result.current.rows)[0]).toBe('佐藤');

  await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  expect(names(result.current.rows)[0]).toBe('渡辺');
  expect(result.current.isFetching).toBe(false);
});
