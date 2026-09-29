'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import type { Product } from './products';

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: '商品名' },
  { accessorKey: 'price', header: '価格', cell: ({ row }) => `${row.original.price} 円` },
];

export function ProductTable({ products }: { products: Product[] }) {
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
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
        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
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
