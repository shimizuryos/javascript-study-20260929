'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

export type Person = { id: number; name: string; age: number };

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: '名前' },
  { accessorKey: 'age', header: '年齢' },
];

const SORT_MARKS = { asc: ' ▲', desc: ' ▼' } as const;

export function SortableTable({ people }: { people: Person[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const direction = header.column.getIsSorted(); // 'asc' | 'desc' | false
              return (
                <th key={header.id}>
                  <button onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {direction ? SORT_MARKS[direction] : ''}
                  </button>
                </th>
              );
            })}
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
  );
}
