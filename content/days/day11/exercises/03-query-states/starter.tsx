'use client';

import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates, type inferParserType } from 'nuqs';

export const FILTER_KEYS = { scope: 'scope', page: 'page', q: 'q' } as const;
export const SCOPES = ['all', 'mine', 'team'] as const;

// TODO: FILTER_KEYS を計算されたキー ([FILTER_KEYS.scope]: ...) に使って、3 つのパーサーを並べる
//   scope: SCOPES のどれか (無ければ 'all') / page: 整数 (無ければ 1) / q: 文字列 (無ければ null)
export const filterParsers = {};

// TODO: 手で書かずに inferParserType<typeof filterParsers> で取り出す
export type Filters = { scope: string; page: number; q: string | null };

export function describeFilters({ scope, page, q }: Filters): string {
  // TODO: 'mine / 2 ページ / react' の形。q が null なら '(検索なし)'
  return '';
}

export function FilterSummary() {
  // TODO: useQueryStates(filterParsers) で URL から読む
  const filters: Filters = { scope: 'all', page: 1, q: null };

  return (
    <div>
      <p>{describeFilters(filters)}</p>
      <button onClick={() => {}}>チームに切り替え</button>
      <button onClick={() => {}}>条件をリセット</button>
    </div>
  );
}
