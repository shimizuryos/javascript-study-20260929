import type { OnChangeFn, PaginationState, Updater } from '@tanstack/react-table';

export function resolvePagination(updater: Updater<PaginationState>, current: PaginationState): PaginationState {
  return typeof updater === 'function' ? updater(current) : updater;
}

export function toPagination(page: number, pageSize: number): PaginationState {
  return { pageIndex: page - 1, pageSize };
}

export function createPaginationHandler(
  page: number,
  pageSize: number,
  setPage: (page: number) => void,
): OnChangeFn<PaginationState> {
  return (updater) => {
    const next = resolvePagination(updater, toPagination(page, pageSize));
    setPage(next.pageIndex + 1);
  };
}
