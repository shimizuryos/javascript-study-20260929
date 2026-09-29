'use client';

import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates, type inferParserType } from 'nuqs';

export const FILTER_KEYS = { scope: 'scope', page: 'page', q: 'q' } as const;
export const SCOPES = ['all', 'mine', 'team'] as const;

export const filterParsers = {
  [FILTER_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'),
  [FILTER_KEYS.page]: parseAsInteger.withDefault(1),
  [FILTER_KEYS.q]: parseAsString,
};

export type Filters = inferParserType<typeof filterParsers>;

export function describeFilters({ scope, page, q }: Filters): string {
  return `${scope} / ${page} ページ / ${q ?? '(検索なし)'}`;
}

export function FilterSummary() {
  const [filters, setFilters] = useQueryStates(filterParsers);

  return (
    <div>
      <p>{describeFilters(filters)}</p>
      <button onClick={() => setFilters({ scope: 'team', page: null })}>チームに切り替え</button>
      <button onClick={() => setFilters(null)}>条件をリセット</button>
    </div>
  );
}
