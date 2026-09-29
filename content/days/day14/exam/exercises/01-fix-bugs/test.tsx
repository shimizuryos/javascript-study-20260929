import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { useSharedScopeQuery } from './main';
import { fetchMembers, PAGE_SIZE, type Member } from './api';

const columns: ColumnDef<Member>[] = [{ accessorKey: 'name', header: '名前' }];

/** 実務と同じく、フックの戻り値を useReactTable につないで動かす */
function useMembersTable() {
  const members = useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE });
  const table = useReactTable({
    data: members.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: members.rowCount,
    state: members.tableState,
    onPaginationChange: members.onPaginationChange,
  });
  return { members, table };
}

function setup(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  const hook = renderHook(() => useMembersTable(), { wrapper });
  const lastUrl = () => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams ?? null;
  return { ...hook, lastUrl };
}

const names = (rows: Member[]) => rows.map((m) => m.name);

test('URL の page=2 は pageIndex 1 (0 始まり) になり、テーブルは「2 ページ目」と認識する', async () => {
  const { result } = setup('?page=2');
  expect(result.current.members.tableState.pagination).toEqual({ pageIndex: 1, pageSize: PAGE_SIZE });
  await waitFor(() => expect(result.current.table.getPageCount()).toBe(3));
  expect(result.current.table.getCanNextPage()).toBe(true);
  expect(result.current.table.getCanPreviousPage()).toBe(true);
});

test('onPaginationChange に値 { pageIndex: 2, pageSize } を渡すと URL が page=3 になる', async () => {
  const { result, lastUrl } = setup('');
  act(() => {
    result.current.members.onPaginationChange({ pageIndex: 2, pageSize: PAGE_SIZE });
  });
  await waitFor(() => expect(lastUrl()?.get('page')).toBe('3'));
  await waitFor(() => expect(names(result.current.members.rows)).toEqual(['吉田', '山田']));
});

test('table.nextPage() (updater として関数が渡ってくる) で page=2 → page=3 に進む', async () => {
  const { result, lastUrl } = setup('?page=2');
  await waitFor(() => expect(result.current.members.isPending).toBe(false));
  act(() => {
    result.current.table.nextPage();
  });
  await waitFor(() => expect(lastUrl()?.get('page')).toBe('3'));
  expect(result.current.table.getState().pagination.pageIndex).toBe(2);
  await waitFor(() => expect(names(result.current.members.rows)).toEqual(['吉田', '山田']));
});

test('検索語を変えると取り直して、結果が変わる (queryKey に q が入っている)', async () => {
  const { result } = setup('?q=山');
  await waitFor(() => expect(names(result.current.members.rows)).toEqual(['山本', '山田']));
  act(() => {
    void result.current.members.setSearch('田');
  });
  await waitFor(() => expect(names(result.current.members.rows)).toEqual(['田中', '吉田', '山田']));
  expect(result.current.members.rowCount).toBe(3);
});
