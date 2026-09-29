'use client';

/**
 * 演習一覧。このページ自体が Day 11〜13 の実例になっている:
 * - 絞り込み条件とページ番号は nuqs で URL に保存 (?level=2&status=todo&page=2)
 * - 表示とページ送りは TanStack Table
 * - URL の page (1 始まり) ⇔ テーブルの pageIndex (0 始まり) を onPaginationChange で変換
 */
import Link from 'next/link';
import { useMemo } from 'react';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table';
import type { ExerciseSummary, Level } from '@/content/types';
import { LEVELS } from '@/content/types';
import { useProgress } from '@/lib/progress/store';
import { exerciseStatus } from '@/lib/progress/selectors';
import { Badge, CheckIcon, LevelDot } from '@/components/ui';
import { exerciseHref } from '@/components/day/exercise-list';

const STATUSES = ['todo', 'tried', 'passed'] as const;
const KINDS = ['required', 'optional', 'exam'] as const;
const PAGE_SIZE = 10;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = { todo: '未着手', tried: '挑戦中', passed: 'クリア' };
const KIND_LABEL: Record<(typeof KINDS)[number], string> = { required: '必須', optional: '任意', exam: '試験' };

// パーサーはコンポーネントの外で定義する (毎回作り直さない)
const filterParsers = {
  level: parseAsInteger,
  status: parseAsStringLiteral(STATUSES),
  kind: parseAsStringLiteral(KINDS),
  q: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
};

type Row = ExerciseSummary & { level: Level; dayTitle: string; status: (typeof STATUSES)[number]; kind: (typeof KINDS)[number] };

const col = createColumnHelper<Row>();
const columns = [
  col.accessor('day', {
    header: 'Day',
    cell: (info) => (
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <LevelDot level={info.row.original.level} />
        Day {info.getValue()}
      </span>
    ),
  }),
  col.accessor('title', {
    header: '演習',
    cell: (info) => (
      <Link href={exerciseHref(info.row.original)} className="font-semibold text-accent-strong hover:underline">
        {info.getValue()}
      </Link>
    ),
  }),
  col.accessor('kind', {
    header: '種類',
    cell: (info) => (
      <span className="flex flex-wrap gap-1">
        <Badge tone={info.getValue() === 'required' ? 'accent' : info.getValue() === 'exam' ? 'warn' : 'neutral'}>
          {KIND_LABEL[info.getValue()]}
        </Badge>
        {info.row.original.typecheck && <Badge>型</Badge>}
      </span>
    ),
  }),
  col.accessor('status', {
    header: '状態',
    cell: (info) =>
      info.getValue() === 'passed' ? (
        <span className="inline-flex items-center gap-1 text-good">
          <CheckIcon /> クリア
        </span>
      ) : (
        <span className={info.getValue() === 'tried' ? 'text-warn' : 'text-ink-3'}>{STATUS_LABEL[info.getValue()]}</span>
      ),
  }),
];

export function ExercisesTable({ exercises, days }: { exercises: ExerciseSummary[]; days: { day: number; level: Level; title: string }[] }) {
  const progress = useProgress();
  const [{ level, status, kind, q, page }, setFilters] = useQueryStates(filterParsers);

  const rows = useMemo<Row[]>(() => {
    const dayInfo = new Map(days.map((d) => [d.day, d]));
    return exercises.map((e) => ({
      ...e,
      level: dayInfo.get(e.day)?.level ?? 1,
      dayTitle: dayInfo.get(e.day)?.title ?? '',
      status: exerciseStatus(progress, e),
      kind: e.exam ? 'exam' : e.optional ? 'optional' : 'required',
    }));
  }, [exercises, days, progress]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (level === null || r.level === level) &&
        (status === null || r.status === status) &&
        (kind === null || r.kind === kind) &&
        (keyword === '' || r.title.toLowerCase().includes(keyword) || r.dayTitle.toLowerCase().includes(keyword)),
    );
  }, [rows, level, status, kind, q]);

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: PAGE_SIZE }), [page]);
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    void setFilters({ page: next.pageIndex + 1 });
  };

  const table = useReactTable({
    data: filtered,
    columns,
    state: { pagination },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const passedCount = rows.filter((r) => r.status === 'passed').length;
  const selectClass = 'rounded-md border border-line bg-card px-2 py-1.5 text-sm';

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        全 {rows.length} 問中 <strong className="text-ink">{passedCount}</strong> 問クリア。条件は URL に保存されるので、ブックマークや共有もできます。
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-ink-2">
          レベル
          <select
            className={selectClass}
            value={level ?? ''}
            onChange={(e) => setFilters({ level: e.target.value ? Number(e.target.value) : null, page: null })}
          >
            <option value="">すべて</option>
            {([1, 2, 3, 4, 5] as Level[]).map((l) => (
              <option key={l} value={l}>
                Level {l}・{LEVELS[l].short}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-2">
          状態
          <select
            className={selectClass}
            value={status ?? ''}
            onChange={(e) => setFilters({ status: (e.target.value || null) as Row['status'] | null, page: null })}
          >
            <option value="">すべて</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-2">
          種類
          <select
            className={selectClass}
            value={kind ?? ''}
            onChange={(e) => setFilters({ kind: (e.target.value || null) as Row['kind'] | null, page: null })}
          >
            <option value="">すべて</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-ink-2">
          キーワード
          <input
            type="search"
            className={selectClass}
            value={q}
            placeholder="例: フック"
            onChange={(e) => setFilters({ q: e.target.value || null, page: null })}
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-ink-2">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 font-semibold">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-3">
                  条件に合う演習がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-ink-2">
          {filtered.length} 件中 {filtered.length === 0 ? 0 : pagination.pageIndex * PAGE_SIZE + 1}〜
          {Math.min((pagination.pageIndex + 1) * PAGE_SIZE, filtered.length)} 件
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← 前へ
          </button>
          <span className="text-ink-2 tabular-nums">
            {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            type="button"
            className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            次へ →
          </button>
        </span>
      </div>
    </div>
  );
}
