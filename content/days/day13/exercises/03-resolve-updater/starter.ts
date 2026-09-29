import type { OnChangeFn, PaginationState, Updater } from '@tanstack/react-table';

export function resolvePagination(updater: Updater<PaginationState>, current: PaginationState): PaginationState {
  // TODO: updater が関数なら current を渡して呼ぶ。値ならそのまま返す
  return current;
}

export function toPagination(page: number, pageSize: number): PaginationState {
  // TODO: 1 始まりの page → 0 始まりの pageIndex
  return { pageIndex: page, pageSize };
}

export function createPaginationHandler(
  page: number,
  pageSize: number,
  setPage: (page: number) => void,
): OnChangeFn<PaginationState> {
  return (updater) => {
    // バグ: updater が関数のときに対応していない
    const next = updater as PaginationState;
    setPage(next.pageIndex + 1);
  };
}
