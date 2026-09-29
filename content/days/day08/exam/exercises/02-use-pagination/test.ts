import { act, renderHook } from '@testing-library/react';
import { usePagination } from './main';

test('最初は 1 ページ目。pageCount は total ÷ pageSize の切り上げ (0 件なら 1)', () => {
  const { result } = renderHook(() => usePagination(45, 10));
  expect(result.current.page).toBe(1);
  expect(result.current.pageCount).toBe(5);
  expect(renderHook(() => usePagination(40)).result.current.pageCount).toBe(4);
  expect(renderHook(() => usePagination(0)).result.current.pageCount).toBe(1);
});

test('next / prev で移動し、canPrev / canNext が変わる', () => {
  const { result } = renderHook(() => usePagination(30, 10));
  expect([result.current.canPrev, result.current.canNext]).toEqual([false, true]);
  act(() => result.current.next());
  expect(result.current.page).toBe(2);
  expect([result.current.canPrev, result.current.canNext]).toEqual([true, true]);
  act(() => result.current.next());
  expect(result.current.page).toBe(3);
  expect([result.current.canPrev, result.current.canNext]).toEqual([true, false]);
  act(() => result.current.prev());
  expect(result.current.page).toBe(2);
});

test('最初のページより前・最後のページより後には行かない', () => {
  const { result } = renderHook(() => usePagination(20, 10));
  act(() => result.current.prev());
  expect(result.current.page).toBe(1);
  act(() => result.current.next());
  act(() => result.current.next());
  expect(result.current.page).toBe(2);
});

test('1 回の act の中で next を 2 回呼ぶと 2 ページ進む', () => {
  const { result } = renderHook(() => usePagination(100, 10));
  act(() => {
    result.current.next();
    result.current.next();
  });
  expect(result.current.page).toBe(3);
});

test('pagination は 0 始まりの { pageIndex, pageSize }', () => {
  const { result } = renderHook(() => usePagination(100, 20));
  expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 20 });
  act(() => result.current.next());
  expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
});

test('page が変わらない再レンダーでは pagination は同じオブジェクト、変わると新しいオブジェクト', () => {
  const { result, rerender } = renderHook(() => usePagination(100, 20));
  const first = result.current.pagination;
  rerender();
  expect(result.current.pagination).toBe(first);
  act(() => result.current.next());
  expect(result.current.pagination).not.toBe(first);
});
