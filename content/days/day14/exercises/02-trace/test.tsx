import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { useSharedScopeQuery } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE } from './api';
import { answers } from './main';

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る。
// オブジェクトのキーの順番は問わない。
const normalize = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(normalize)
    : v !== null && typeof v === 'object'
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([k, x]) => [k, normalize(x)]),
        )
      : v;
const same = (answer: unknown, actual: unknown) =>
  typeof answer === typeof actual && JSON.stringify(normalize(answer)) === JSON.stringify(normalize(actual));

/** レッスンと同じ条件 (pageSize: PAGE_SIZE = 5) で、実際にフックを動かす */
function setup(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const fetcher = vi.fn(fetchMembers);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  const hook = renderHook(() => useSharedScopeQuery('members', fetcher, { pageSize: PAGE_SIZE }), { wrapper });
  /** 最後に書き込まれた URL のクエリを { key: value } の形にする */
  const urlObject = () => Object.fromEntries(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? []);
  return { ...hook, fetcher, onUrlUpdate, urlObject };
}

test('Q1: ?scope=team&page=2 のときの tableState.pagination', () => {
  const { result } = setup('?scope=team&page=2');
  expect(same(answers.q1, result.current.tableState.pagination)).toBe(true);
});

test('Q2: ?page=2&q=田 の読み込み完了後の [rows.length, rowCount]', async () => {
  const { result } = setup('?page=2&q=田');
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  expect(same(answers.q2, [result.current.rows.length, result.current.rowCount])).toBe(true);
});

test("Q3: ?scope=team&page=2 で setScope('mine') を呼んだ後の URL", async () => {
  const { result, onUrlUpdate, urlObject } = setup('?scope=team&page=2');
  act(() => {
    void result.current.setScope('mine');
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(same(answers.q3, urlObject())).toBe(true);
});

test('Q4: ?page=2 で「前へ」(pageIndex - 1) を呼んだ後の URL', async () => {
  const { result, onUrlUpdate, urlObject } = setup('?page=2');
  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex - 1 }));
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(same(answers.q4, urlObject())).toBe(true);
});

test('Q5: ?page=2 の読み込み完了後、「次へ」を呼んだ直後の状態', async () => {
  const { result } = setup('?page=2');
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));
  });
  const { rows, tableState, isPlaceholderData } = result.current;
  const actual = { first: rows[0]?.name, pageIndex: tableState.pagination.pageIndex, isPlaceholderData };
  expect(same(answers.q5, actual)).toBe(true);
});

/** 1 ページ目 → 次へ → 2 ページ目の表示 → 前へ (1 ページ目に戻る) */
async function nextThenBack() {
  const ctx = setup('');
  const { result } = ctx;
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));
  });
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  act(() => {
    result.current.onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex - 1 }));
  });
  return ctx;
}

test('Q6: 1 ページ目 → 次へ → 前へ と戻った直後の isPlaceholderData', async () => {
  const { result } = await nextThenBack();
  expect(same(answers.q6, result.current.isPlaceholderData)).toBe(true);
});

test('Q7: Q6 の操作のあと、すべて落ち着くまでに fetcher が呼ばれた回数', async () => {
  const { result, fetcher } = await nextThenBack();
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  expect(same(answers.q7, fetcher.mock.calls.length)).toBe(true);
});
