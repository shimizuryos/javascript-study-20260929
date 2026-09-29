import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { useMemberList } from './variant';
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

function setup(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  const hook = renderHook(() => useMemberList(), { wrapper });
  const lastEvent = () => onUrlUpdate.mock.calls.at(-1)?.[0];
  /** 最後に書き込まれた URL のクエリを { key: value } の形にする */
  const urlObject = () => Object.fromEntries(lastEvent()?.searchParams ?? []);
  return { ...hook, onUrlUpdate, lastEvent, urlObject };
}

test('Q1: ?scope=team&p=2 のときの [scope, page]', () => {
  const { result } = setup('?scope=team&p=2');
  expect(same(answers.q1, [result.current.scope, result.current.page])).toBe(true);
});

test('Q2: ?s=team の読み込み完了後の data', async () => {
  const { result } = setup('?s=team');
  await waitFor(() => expect(result.current.data).toBeDefined());
  expect(same(answers.q2, result.current.data)).toBe(true);
});

test("Q3: URL が空の状態で setParams({ scope: 'mine', page: 2 }) を呼んだ後の URL", async () => {
  const { result, onUrlUpdate, urlObject } = setup('');
  act(() => {
    void result.current.setParams({ scope: 'mine', page: 2 });
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(same(answers.q3, urlObject())).toBe(true);
});

test('Q4: Q3 の URL 更新の { history, shallow }', async () => {
  const { result, onUrlUpdate, lastEvent } = setup('');
  act(() => {
    void result.current.setParams({ scope: 'mine', page: 2 });
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  const options = lastEvent()?.options;
  expect(same(answers.q4, { history: options?.history, shallow: options?.shallow })).toBe(true);
});

test('Q5: ?p=3 で setParams({ page: 1 }) を呼んだ後の URL', async () => {
  const { result, onUrlUpdate, urlObject } = setup('?p=3');
  act(() => {
    void result.current.setParams({ page: 1 });
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(same(answers.q5, urlObject())).toBe(true);
});

test('Q6: ?s=mine で setParams((old) => ({ page: old.page + 1 })) を呼んだ後の URL', async () => {
  const { result, onUrlUpdate, urlObject } = setup('?s=mine');
  act(() => {
    void result.current.setParams((old) => ({ page: old.page + 1 }));
  });
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(same(answers.q6, urlObject())).toBe(true);
});

test("Q7: ?s=team&p=2 で setParams({ q: '田' }) を呼び、読み込みが終わった後の data", async () => {
  const { result } = setup('?s=team&p=2');
  await waitFor(() => expect(result.current.data).toBeDefined());
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  act(() => {
    void result.current.setParams({ q: '田' });
  });
  await waitFor(() => expect(result.current.q).toBe('田'));
  await waitFor(() => expect(result.current.isFetching).toBe(false));
  expect(same(answers.q7, result.current.data)).toBe(true);
});
