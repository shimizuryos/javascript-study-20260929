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
    manualPagination: true, // ページ分割はサーバー (API) がやる
    rowCount, // 全件数 → getPageCount() / getCanNextPage() の計算に使われる
    state: tableState, // { pagination } — URL から作った値を渡す
    onPaginationChange, // テーブルからの変更を URL に書き戻す
  });

  if (isPending) return <p>読み込み中…</p>;
  if (error) return <p role="alert">エラー: {error.message}</p>;

  return (
    <div>
      <label htmlFor="scope-select">表示範囲</label>{' '}
      <select id="scope-select" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
        {SCOPES.map((s) => (
          <option key={s} value={s}>
            {SCOPE_LABELS[s]}
          </option>
        ))}
      </select>

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
        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} ページ (全 {rowCount} 件)
        {isFetching ? ' 更新中…' : ''}
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
