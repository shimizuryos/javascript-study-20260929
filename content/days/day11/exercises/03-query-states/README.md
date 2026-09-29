---
title: useQueryStates と計算されたキー
hints:
  - "パーサーのオブジェクトは `{ [FILTER_KEYS.scope]: parseAsStringLiteral(SCOPES).withDefault('all'), ... }` の形です。目標コードの 19〜23 行目と同じ書き方です。"
  - "型は `inferParserType<typeof filterParsers>` で取り出せます。`import { type inferParserType } from 'nuqs'` が必要です。"
  - "`const [filters, setFilters] = useQueryStates(filterParsers);` の `setFilters` は部分更新です。「チームに切り替え」は `{ scope: 'team', page: null }`、「条件をリセット」は `null` を渡します。"
---

目標コードとほぼ同じ形の「絞り込み条件」を作ります。`main.tsx` の TODO を埋めてください。

### 1. `filterParsers`

`FILTER_KEYS` を **計算されたキー** に使って、3 つのパーサーを持つオブジェクトを作ります。

| キー | 値 | URL に無い・不正なとき |
| --- | --- | --- |
| `scope` | `SCOPES` のどれか (`'all' \| 'mine' \| 'team'`) | `'all'` |
| `page` | 整数 | `1` |
| `q` | 文字列 | `null` |

### 2. `Filters` 型と `describeFilters`

`Filters` は `filterParsers` から `inferParserType` で取り出してください。`describeFilters` は条件を 1 行の文字列にします。

```ts
describeFilters({ scope: 'mine', page: 2, q: 'react' }); // 'mine / 2 ページ / react'
describeFilters({ scope: 'all', page: 1, q: null }); // 'all / 1 ページ / (検索なし)'
```

### 3. `FilterSummary`

`useQueryStates(filterParsers)` で URL から条件を読み、`describeFilters` の結果を `<p>` に表示します。

- 「チームに切り替え」… scope を `'team'` にし、page は 1 ページ目に戻す (URL から消す)
- 「条件をリセット」… scope / page / q をすべて URL から消す (他のクエリ `?tab=...` は残る)

```text
URL: ?scope=mine&page=2&q=react   → 表示: mine / 2 ページ / react
URL: (なし)                        → 表示: all / 1 ページ / (検索なし)
```
