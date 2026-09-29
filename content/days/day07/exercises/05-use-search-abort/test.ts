import { renderHook, waitFor } from '@testing-library/react';
import { useSearch } from './main';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 疑似 API: q ごとに決めた時間 (ms) で `${q}-1` を返す。abort されたら AbortError で失敗する (fetch と同じ)
const createApi = (delays: Record<string, number> = {}) =>
  vi.fn(
    (q: string, signal: AbortSignal) =>
      new Promise<string[]>((resolve, reject) => {
        const timer = setTimeout(() => resolve([`${q}-1`]), delays[q] ?? 10);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  );

test('search の結果を results として返す (最初は [])', async () => {
  const search = createApi();
  const { result } = renderHook(({ q }) => useSearch(q, search), { initialProps: { q: 'react' } });
  expect(result.current.results).toEqual([]);
  await waitFor(() => expect(result.current.results).toEqual(['react-1']));
  expect(search.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
});

test('q が変わったら、前のリクエストを中断して新しい q で検索する', async () => {
  const search = createApi({ a: 80 });
  const { result, rerender } = renderHook(({ q }) => useSearch(q, search), { initialProps: { q: 'a' } });
  const firstSignal = search.mock.calls[0][1];
  rerender({ q: 'ab' });
  expect(firstSignal.aborted).toBe(true);
  await waitFor(() => expect(result.current.results).toEqual(['ab-1']));
  expect(result.current.error).toBeNull();
});

test('中断を無視する API でも、遅れて届いた古い結果で上書きしない', async () => {
  // signal を無視して、必ず結果を返してしまう API
  const search = vi.fn(async (q: string, _signal: AbortSignal) => {
    await sleep(q === 'a' ? 80 : 10);
    return [`${q}-1`];
  });
  const { result, rerender } = renderHook(({ q }) => useSearch(q, search), { initialProps: { q: 'a' } });
  rerender({ q: 'ab' });
  await waitFor(() => expect(result.current.results).toEqual(['ab-1']));
  await sleep(120); // 'a' の結果が届くのを待つ
  expect(result.current.results).toEqual(['ab-1']);
});

test('アンマウントしたらリクエストを中断する', () => {
  const search = createApi({ a: 50 });
  const { unmount } = renderHook(() => useSearch('a', search));
  unmount();
  expect(search.mock.calls[0][1].aborted).toBe(true);
});

test('中断以外の失敗は error として返す', async () => {
  const search = vi.fn(async (_q: string, _signal: AbortSignal): Promise<string[]> => {
    throw new Error('サーバーエラー');
  });
  const { result } = renderHook(() => useSearch('a', search));
  await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  expect(result.current.results).toEqual([]);
});
