'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

export type Person = { id: number; name: string; age: number };

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: '名前' },
  { accessorKey: 'age', header: '年齢' },
];

export function SortableTable({ people }: { people: Person[] }) {
  // TODO: 並び替えの状態を useState<SortingState>([]) で持つ

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // TODO: getSortedRowModel、state: { sorting }、onSortingChange
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {/* TODO: クリックで並び替え、向きに応じて ▲ / ▼ を付ける */}
                <button onClick={() => {}}>{flexRender(header.column.columnDef.header, header.getContext())}</button>
              </th>
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
  );
}
