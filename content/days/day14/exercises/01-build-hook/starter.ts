'use client';

import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import type { Paginated } from './api';

/** URL のクエリ名。複数の画面で共有するので定数にまとめておく */
export const SCOPE_KEYS = {
  scope: 'scope',
  page: 'page',
  q: 'q',
} as const;

export const SCOPES = ['all', 'mine', 'team'] as const;
export type Scope = (typeof SCOPES)[number];

const scopeParsers = {
  [SCOPE_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [SCOPE_KEYS.page]: parseAsInteger.withDefault(1),
  [SCOPE_KEYS.q]: parseAsString,
};

export type ScopeParams = { scope: Scope; page: number; q: string | null };

type Options = {
  pageSize?: number;
  enabled?: boolean;
};

export function useSharedScopeQuery<TRow>(
  resource: string,
  fetcher: (params: ScopeParams, signal: AbortSignal) => Promise<Paginated<TRow>>,
  { pageSize = 20, enabled = true }: Options = {},
) {
  // TODO 1: useQueryStates(scopeParsers) で URL から { scope, page, q } と setParams を受け取る
  const scope: Scope = 'all';
  const page = 1;
  const q: string | null = null;

  // TODO 2: useQuery を呼ぶ
  //   - queryKey: [resource, { scope, page, q, pageSize }] as const
  //   - queryFn: ({ signal }) => fetcher({ scope, page, q }, signal)
  //   - placeholderData: keepPreviousData
  //   - enabled

  // TODO 3: URL の page (1 始まり) → テーブルの pageIndex (0 始まり)。useMemo で包む
  const pagination: PaginationState = { pageIndex: 0, pageSize };

  // TODO 4: updater は「新しい値」か「(old) => 新しい値」の関数。どちらでも page を URL に書き戻す
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {};

  // TODO 5: scope / 検索語を変えたら page を URL から消す (1 ページ目に戻す)。空文字の検索語も消す
  const setScope = (next: Scope) => {};
  const setSearch = (text: string) => {};

  return {
    scope,
    q,
    setScope,
    setSearch,
    rows: [] as TRow[], // TODO: 取得したデータの items (無ければ [])
    rowCount: 0, // TODO: 取得したデータの total (無ければ 0)
    isPending: true,
    isFetching: false,
    isPlaceholderData: false,
    error: null as Error | null,
    tableState: { pagination },
    onPaginationChange,
  };
}
