'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
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
    // TODO: ページ分けの行モデルと、1 ページ 5 件の初期状態
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
      {/* TODO: 「今のページ / 全ページ数」と、前へ・次へボタン */}
      <p>1 / 1</p>
      <button onClick={() => {}}>前へ</button>
      <button onClick={() => {}}>次へ</button>
    </div>
  );
}
