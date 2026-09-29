'use client';

import { useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { getOrdersPage, type Order } from './api';

const PAGE_SIZE = 10;

const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: '注文番号', cell: ({ row }) => `#${row.original.id}` },
  { accessorKey: 'customer', header: '顧客' },
];

export function OrdersTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // サーバーから「今のページの行」と「全件数」を受け取る (page ごとに参照を安定させる)
  const { items, total } = useMemo(() => getOrdersPage(page, PAGE_SIZE), [page]);

  // URL の 1 始まりの page → 表の 0 始まりの pageIndex
  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: PAGE_SIZE }), [page]);

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    void setPage(next.pageIndex + 1);
  };

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    state: { pagination },
    onPaginationChange,
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} ページ
      </p>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        前へ
      </button>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        次へ
      </button>
    </div>
  );
}
