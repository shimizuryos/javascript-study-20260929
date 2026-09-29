'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { User } from './users';

const ROLE_LABELS = { admin: '管理者', member: 'メンバー' } as const;

// 列定義はコンポーネントの外に置く (参照が毎回変わらないように)
export const columns: ColumnDef<User>[] = [
  { id: 'name', header: '名前', accessorFn: (row) => `${row.lastName} ${row.firstName}` },
  { accessorKey: 'email', header: 'メール' },
  { accessorKey: 'role', header: '役割', cell: ({ row }) => ROLE_LABELS[row.original.role] },
];

export function UserTable({ users }: { users: User[] }) {
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
