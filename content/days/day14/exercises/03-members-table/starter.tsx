'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { SCOPES, useSharedScopeQuery, type Scope } from './useSharedScopeQuery';
import { fetchMembers, PAGE_SIZE, type Member } from './api';

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'name', header: '名前' },
  { accessorKey: 'team', header: 'チーム' },
];

export const SCOPE_LABELS: Record<Scope, string> = {
  all: 'すべて',
  mine: '自分が追加',
  team: '自分のチーム',
};

export function MembersTable() {
  const { scope, setScope, rows, rowCount, isPending, isFetching, error, tableState, onPaginationChange } =
    useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE });

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // TODO 1: サーバー側ページネーションの設定 (manualPagination / rowCount / state / onPaginationChange)
  });

  if (isPending) return <p>読み込み中…</p>;
  if (error) return <p role="alert">エラー: {error.message}</p>;

  return (
    <div>
      {/* TODO 2: 「表示範囲」の <label> と <select> (選択肢は SCOPES、表示名は SCOPE_LABELS) */}

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

      {/* TODO 3: 「1 / 3 ページ (全 12 件)」の表示 (取得中なら「更新中…」も) */}
      {/* TODO 4: 「前へ」「次へ」ボタン (押せないときは disabled) */}
    </div>
  );
}
