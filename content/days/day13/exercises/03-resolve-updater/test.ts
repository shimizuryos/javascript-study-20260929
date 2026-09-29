import { act, renderHook } from '@testing-library/react';
import { getCoreRowModel, useReactTable, type PaginationState } from '@tanstack/react-table';
import { createPaginationHandler, resolvePagination, toPagination } from './main';

test('resolvePagination: 値が来たらそのまま返す', () => {
  const current = { pageIndex: 2, pageSize: 20 };
  expect(resolvePagination({ pageIndex: 0, pageSize: 20 }, current)).toEqual({ pageIndex: 0, pageSize: 20 });
});

test('resolvePagination: 関数が来たら今の値を渡して呼ぶ (今の値は変更しない)', () => {
  const current = { pageIndex: 2, pageSize: 20 };
  const next = resolvePagination((old: PaginationState) => ({ ...old, pageIndex: old.pageIndex + 1 }), current);
  expect(next).toEqual({ pageIndex: 3, pageSize: 20 });
  expect(current).toEqual({ pageIndex: 2, pageSize: 20 });
});

test('toPagination: 1 始まりの page を 0 始まりの pageIndex にする', () => {
  expect(toPagination(3, 20)).toEqual({ pageIndex: 2, pageSize: 20 });
  expect(toPagination(1, 10)).toEqual({ pageIndex: 0, pageSize: 10 });
});

test('createPaginationHandler: 解決した結果を 1 始まりに戻して setPage を呼ぶ', () => {
  const setPage = vi.fn();
  const onPaginationChange = createPaginationHandler(3, 20, setPage);
  onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }));
  expect(setPage).toHaveBeenLastCalledWith(4);
  onPaginationChange({ pageIndex: 0, pageSize: 20 });
  expect(setPage).toHaveBeenLastCalledWith(1);
});

test('本物の表で「次へ」「最初へ」「最後へ」を押したときの setPage', () => {
  const setPage = vi.fn();
  const { result } = renderHook(() =>
    useReactTable({
      data: [],
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
      rowCount: 100, // 1 ページ 10 件なら 10 ページ
      state: { pagination: toPagination(3, 10) },
      onPaginationChange: createPaginationHandler(3, 10, setPage),
    }),
  );
  act(() => result.current.nextPage());
  expect(setPage).toHaveBeenLastCalledWith(4);
  act(() => result.current.firstPage());
  expect(setPage).toHaveBeenLastCalledWith(1);
  act(() => result.current.lastPage());
  expect(setPage).toHaveBeenLastCalledWith(10);
});
