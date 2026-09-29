'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { User } from './users';

const ROLE_LABELS = { admin: '管理者', member: 'メンバー' } as const;

// 列定義はコンポーネントの外に置く (参照が毎回変わらないように)
export const columns: ColumnDef<User>[] = [
  // TODO: 名前 (accessorFn で「姓 名」)
  { accessorKey: 'email', header: 'メール' },
  // TODO: 役割 (accessorKey: 'role' と、ROLE_LABELS を使う cell)
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
      <tbody>{/* TODO: getRowModel().rows → getVisibleCells() → flexRender */}</tbody>
    </table>
  );
}
