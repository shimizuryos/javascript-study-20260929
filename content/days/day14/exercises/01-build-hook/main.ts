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
  const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);

  const query = useQuery({
    queryKey: [resource, { scope, page, q, pageSize }] as const,
    queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
    placeholderData: keepPreviousData,
    enabled,
  });

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    void setParams({ page: next.pageIndex + 1 });
  };

  const setScope = (next: Scope) => setParams({ scope: next, page: null });
  const setSearch = (text: string) => setParams({ q: text || null, page: null });

  return {
    scope,
    q,
    setScope,
    setSearch,
    rows: query.data?.items ?? [],
    rowCount: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    error: query.error,
    tableState: { pagination },
    onPaginationChange,
  };
}
