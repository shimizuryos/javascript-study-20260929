---
day: 12
level: 4
title: TanStack Query — サーバーのデータを取ってくる
summary: useQuery({ queryKey, queryFn }) と isPending / isFetching / placeholderData などを読み、「URL の状態 → queryKey → 自動で再取得」の流れを説明できるようにする。
minutes: 120
goals:
  - サーバー状態とクライアント状態の違い、QueryClient と QueryClientProvider の役割を説明できる
  - "useQuery({ queryKey, queryFn }) で、queryKey が変わると再取得される理由を説明できる"
  - "queryFn: ({ signal }) => fetcher(params, signal) の signal が何か説明できる"
  - isPending / isLoading / isFetching / isPlaceholderData の違いを説明できる
  - "placeholderData: keepPreviousData、enabled、staleTime、select、queryOptions を読める"
readings:
  - title: TanStack Query v5 — Overview
    url: https://tanstack.com/query/v5/docs/framework/react/overview
  - title: TanStack Query v5 — Queries
    url: https://tanstack.com/query/v5/docs/framework/react/guides/queries
  - title: TanStack Query v5 — Query Keys
    url: https://tanstack.com/query/v5/docs/framework/react/guides/query-keys
  - title: TanStack Query v5 — Paginated Queries
    url: https://tanstack.com/query/v5/docs/framework/react/guides/paginated-queries
  - title: TanStack Query v5 — Important Defaults
    url: https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults
---

## 今日のゴール

目標コードの 39〜44 行目と、56〜70 行目を読めるようにします。

```ts
const query = useQuery({
  queryKey: [resource, { scope, page, q, pageSize }] as const,
  queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
  placeholderData: keepPreviousData,
  enabled,
});
// ...
return {
  rows: query.data?.items ?? [],
  rowCount: query.data?.total ?? 0,
  isPending: query.isPending,
  isFetching: query.isFetching,
  isPlaceholderData: query.isPlaceholderData,
  error: query.error,
  // ...
};
```

今日の終わりには「URL の page が変わると queryKey が変わり、自動で次のページを取りに行く。その間は前のページを表示し続け、`isPlaceholderData` が `true` になる」と説明できるようになります。

## サーバー状態とクライアント状態

| | 例 | 持ち主 |
| --- | --- | --- |
| クライアント状態 | モーダルの開閉、入力中の文字、URL の page | ブラウザ (useState / nuqs) |
| サーバー状態 | ユーザー一覧、商品の在庫 | サーバー (ブラウザにあるのは **コピー**) |

サーバー状態は「取ってくる」「読み込み中・エラーを表示する」「古くなったら取り直す」「同じデータを複数の画面で使い回す」が必要です。Day 7 の `useEffect` で書くと、こうなります。

```tsx
const [usersPage, setUsersPage] = useState<UsersPage>();
const [error, setError] = useState<Error>();
useEffect(() => {
  let ignore = false; // 古いリクエストの結果で上書きしないための工夫
  fetchUsersPage(page)
    .then((data) => !ignore && setUsersPage(data))
    .catch((e) => !ignore && setError(e));
  return () => {
    ignore = true;
  };
}, [page]);
```

これをすべての画面で書くのは大変で、キャッシュ (前に見たページを覚えておく) もありません。**TanStack Query** は、サーバー状態を **キー付きのキャッシュ** として管理するライブラリです。

## QueryClient と QueryClientProvider

`QueryClient` がキャッシュの本体で、`QueryClientProvider` がそれを下のコンポーネントに渡します (Day 8 の Provider)。

```tsx
// app/providers.tsx
'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient()); // 最初の 1 回だけ作る
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

テストでは、テストごとに新しい `QueryClient` を作ります。前のテストのキャッシュが残らないようにするためと、失敗したときの自動リトライ (後述) を止めるためです。

```tsx
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
render(
  <QueryClientProvider client={client}>
    <UserList />
  </QueryClientProvider>,
);
```

## useQuery の基本

```tsx
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['users'], // キャッシュの名前 (配列)
    queryFn: fetchUsers, // Promise を返す関数。throw するとエラー扱い
  });

  if (isPending) return <p>読み込み中…</p>;
  if (isError) return <p>エラー: {error.message}</p>;
  return (
    <ul>
      {data.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

`data` は取得が終わるまで `undefined` です。`isPending` と `isError` で先に `return` しているので、最後の行では TypeScript が「`data` は必ずある」と絞り込んでくれます (Day 3 の narrowing)。

## queryKey — キャッシュの名前であり、依存配列でもある

```ts
useQuery({
  queryKey: ['users', { page, q }],
  queryFn: () => searchUsers({ page, q }),
});
```

- 同じキー = 同じキャッシュ。別のコンポーネントが同じキーで `useQuery` しても、取得は 1 回で済みます
- キーが変わると別のキャッシュを見に行き、無ければ **自動で取得** します。前のキーのキャッシュは残るので、戻ったときはすぐ表示されます
- `useEffect` の依存配列と同じで、**queryFn の中で使う値はすべてキーに入れる** のがルールです

キーの中のオブジェクトは、プロパティの **順番に関係なく** 同じものとみなされます (`undefined` のプロパティは無視)。

```ts
['users', { page: 1, q: 'a' }]; // この 2 つは同じキャッシュ
['users', { q: 'a', page: 1 }];
['users', { page: '1', q: 'a' }]; // 1 と '1' は違うので別のキャッシュ
```

> **落とし穴:** queryFn で使う値をキーに入れ忘れると、その値が変わっても再取得されず、**古いデータが表示されたまま** になります。実務で一番多いバグです。

## queryFn が受け取るもの — `{ queryKey, signal }`

queryFn は、引数にオブジェクトを受け取ります。よく使うのは `signal` です。

```ts
queryFn: ({ signal }) => fetchUsersPage(page, signal),

async function fetchUsersPage(page: number, signal?: AbortSignal) {
  const res = await fetch(`/api/users?page=${page}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`); // fetch は 404 でも throw しないので自分で投げる
  return (await res.json()) as UsersPage;
}
```

`signal` は **AbortSignal** (リクエストを途中でやめるための合図) です。結果が要らなくなった (画面から消えた、など) とき、TanStack Query がこの合図を送り、`fetch` が中断されます。目標コードの `({ signal }) => fetcher({ scope, page, q }, signal)` は、引数を分割代入 (Day 1) で受け取り、そのまま `fetcher` に渡しています。

> **落とし穴:** `queryFn: fetchUsers` のように関数をそのまま渡すと、その第 1 引数には `{ queryKey, signal, ... }` のオブジェクトが入ります。引数を取る関数は `() => fetchUsersPage(page)` のように包んで渡します。

## 状態を表すフラグ

| フラグ | 意味 |
| --- | --- |
| `isPending` | まだ `data` が無い (`status === 'pending'`) |
| `isFetching` | queryFn を実行中 (初回も、裏での再取得も) |
| `isLoading` | `isPending && isFetching` (初回の取得中) |
| `isError` / `isSuccess` | 最後の結果が失敗 / 成功 |
| `isPlaceholderData` | 表示中の `data` が、仮のデータ (後述の placeholderData) |

ページを切り替えるときの変化を並べると、こうなります (`placeholderData: keepPreviousData` あり)。

```text
                 isPending  isFetching  isPlaceholderData  data
初回の取得中      true       true        false              undefined
取得完了          false      false       false              1 ページ目
page を 2 に変更  false      true        true               1 ページ目 (前のデータ)
取得完了          false      false       false              2 ページ目
```

「画面全体の読み込み中」は `isPending`、「右上の小さな更新中マーク」は `isFetching` で出す、のように使い分けます。

## 自動の再取得と staleTime

TanStack Query は、既定で次のように動きます (Important Defaults)。

- 取得したデータは **すぐに古い (stale)** とみなされる (`staleTime: 0`)
- 古いデータは、そのキーを使うコンポーネントが新しく表示されたとき・ウィンドウにフォーカスが戻ったとき・ネットが再接続したときに、**裏で取り直される** (その間も古いデータは表示されたまま)
- どこからも使われなくなったキャッシュは、5 分後に捨てられる (`gcTime`)
- 失敗すると **3 回まで自動でリトライ** する (テストで `retry: false` にする理由)

```ts
useQuery({ queryKey: ['users'], queryFn: fetchUsers, staleTime: 60_000 }); // 1 分間は取り直さない
```

## enabled — 条件がそろうまで待つ

```ts
const userQuery = useQuery({ queryKey: ['user', email], queryFn: () => fetchUser(email) });
const userId = userQuery.data?.id;

const projectsQuery = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => fetchProjects(userId!), // ! は「ここでは undefined ではない」と TypeScript に伝える記号
  enabled: userId !== undefined, // userId が決まるまで queryFn を呼ばない
});
```

`enabled: false` の間は queryFn が呼ばれません。このとき `isPending` は `true` (データが無い) ですが、`isFetching` と `isLoading` は `false` です。目標コードの `enabled` は、呼び出し側が「今は取得しないで」と指定できるようにするためのものです。

> **落とし穴:** `enabled: false` の間も `isPending` は `true` です。`isPending` だけで「読み込み中…」を出すと、条件が入力されるまで永遠に「読み込み中…」になります。

## placeholderData: keepPreviousData — ページ切り替えで画面を空にしない

キーが変わると、新しいキーにはまだデータが無いので、普通は `data` が `undefined` に戻り「読み込み中…」が一瞬出ます (表がガタつく)。`keepPreviousData` を指定すると、新しいデータが届くまで **前のキーのデータを仮に表示** します。

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const { data, isPlaceholderData } = useQuery({
  queryKey: ['users', { page }],
  queryFn: ({ signal }) => fetchUsersPage(page, signal),
  placeholderData: keepPreviousData,
});

<button onClick={() => setPage((p) => p + 1)} disabled={isPlaceholderData || !data?.hasMore}>
  次へ
</button>;
```

`keepPreviousData` は「前のデータをそのまま返す」関数で、`placeholderData` に渡します。仮のデータの間は `isPlaceholderData` が `true` になるので、「次へ」を押せないようにして連打を防ぐのが定番です。v4 のコードでは `keepPreviousData: true` というオプションでした。

## select と queryOptions

`select` は、受け取ったデータを加工して `data` にします (キャッシュには元のデータが入ったまま)。

```ts
const { data: count } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  select: (users) => users.length, // data の型は number | undefined (取得前は undefined)
});
```

`queryOptions` は、キーと queryFn をまとめて定義するためのヘルパーです。キーの入れ忘れを防ぎ、複数の場所で使い回せます。

```ts
import { queryOptions, useQuery } from '@tanstack/react-query';

export const usersQuery = (page: number) =>
  queryOptions({
    queryKey: ['users', { page }],
    queryFn: ({ signal }) => fetchUsersPage(page, signal),
  });

const { data } = useQuery(usersQuery(page));
```

## useMutation と invalidateQueries (読むだけ)

データを **変更する** (POST / PUT / DELETE) ときは `useMutation` を使います。`useQuery` と違い、自動では実行されず、`mutate()` を呼んだときに動きます。

```ts
const queryClient = useQueryClient();
const createUser = useMutation({
  mutationFn: (name: string) => postUser(name),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
// <button onClick={() => createUser.mutate('Alice')}>追加</button>
```

`invalidateQueries({ queryKey: ['users'] })` は、キーが `['users', ...]` で **始まる** キャッシュをすべて「古い」にして、表示中のものを取り直します。追加したユーザーが一覧に反映されるのはこのためです。

## nuqs と組み合わせる

```tsx
const [{ page, q }, setParams] = useQueryStates(parsers); // Day 11

const query = useQuery({
  queryKey: ['users', { page, q }],
  queryFn: ({ signal }) => searchUsers({ page, q }, signal),
  placeholderData: keepPreviousData,
});
```

「次へ」→ `setParams({ page: 3 })` → URL が変わる → `page` が 3 になる → queryKey が変わる → 自動で取得。`useEffect` はどこにもありません。**URL が唯一の「条件」の置き場所で、queryKey がそれを写している** のがこの組み合わせの要点です。

## まとめ: 目標コードを分解する

```ts
const query = useQuery({
  queryKey: [resource, { scope, page, q, pageSize }] as const,
  queryFn: ({ signal }) => fetcher({ scope, page, q }, signal),
  placeholderData: keepPreviousData,
  enabled,
});
```

1. `queryKey` … リソース名 (`'users'` など) と、結果を左右する条件をすべて入れる。URL の scope / page / q が変わるとキーが変わり、自動で再取得される。`as const` でキーの型を読み取り専用のタプルにしている
2. `queryFn` … `{ signal }` を受け取り、条件と一緒に `fetcher` に渡す。不要になったリクエストは中断される
3. `placeholderData: keepPreviousData` … ページ切り替え中も前のページを表示し続ける
4. `enabled` … 呼び出し側が取得を止められるようにする (省略時は `true`)

```ts
rows: query.data?.items ?? [],
rowCount: query.data?.total ?? 0,
```

最初は `data` が `undefined` なので、`?.` と `??` (Day 2) で「行は空配列、件数は 0」にしています。こうしておくと、画面側は読み込み中でも `rows.map(...)` をそのまま書けます。`isPending` / `isFetching` / `isPlaceholderData` / `error` は、画面が「読み込み中」「更新中」「エラー」を出し分けるためにそのまま返しています。
