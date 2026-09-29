---
title: useSharedScopeQuery を自分で書く
optional: false
hints:
  - "まず `const [{ scope, page, q }, setParams] = useQueryStates(scopeParsers);` で URL の値を受け取ります (Day 11)。TODO 1 の 3 行の仮の値は消してください。"
  - "`useQuery({ queryKey: [resource, { scope, page, q, pageSize }] as const, queryFn: ({ signal }) => fetcher({ scope, page, q }, signal), placeholderData: keepPreviousData, enabled })` の結果を `query` に入れ、`rows: query.data?.items ?? []` のように返します (Day 12)。"
  - "`onPaginationChange` は `const next = typeof updater === 'function' ? updater(pagination) : updater;` で新しい値を求め、`setParams({ page: next.pageIndex + 1 })` で URL に書き戻します。`setScope` は `setParams({ scope: next, page: null })` です (Day 11・13)。"
---

今日のレッスンで読んだ **`useSharedScopeQuery` を、見ないで自分で書いて** みましょう。`starter.ts` には import・パーサー・型・関数のシグネチャ (引数と戻り値の形) だけが入っています。TODO 1〜5 を埋めて、本物の nuqs + TanStack Query で動くフックにしてください。

`api.ts` の `fetchMembers` は 12 人のメンバーを 1 ページ 5 件 (`PAGE_SIZE`) で返す疑似 API です。テストでは次のように呼び出します。

```ts
const result = useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE });
```

### 仕様

| URL | `scope` | `q` | `tableState.pagination` | fetcher に渡る値 |
| --- | --- | --- | --- | --- |
| (空) | `'all'` | `null` | `{ pageIndex: 0, pageSize: 5 }` | `{ scope: 'all', page: 1, q: null }` |
| `?scope=team&page=2&q=田` | `'team'` | `'田'` | `{ pageIndex: 1, pageSize: 5 }` | `{ scope: 'team', page: 2, q: '田' }` |

- `queryKey` は `['members', { scope, page, q, pageSize }]`
- `setScope('team')` → URL は `?scope=team` になり、`page` は URL から消える
- `setSearch('')` → `q` も `page` も URL から消える
- `onPaginationChange({ pageIndex: 2, pageSize: 5 })` と `onPaginationChange((old) => ({ ...old, pageIndex: old.pageIndex + 1 }))` の **どちらの形でも** URL の `page` が変わる
- 次のページを取得している間は、前のページの `rows` が表示されたまま (`isPlaceholderData: true`)

テストでは `NuqsTestingAdapter` (メモリ上の URL) と `QueryClientProvider` で囲んでフックを動かしています。`test.tsx` の `setup` も読んでみてください。
