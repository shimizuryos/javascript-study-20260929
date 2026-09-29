---
title: searchParams を安全に読み取る
hints:
  - "`searchParams.page` の型は `string | string[] | undefined` です。配列なら最初の要素を使う小さな関数 (`Array.isArray(v) ? v[0] : v`) を作ると楽です。"
  - "page は `Number(...)` で変換し、`Number.isInteger(n) && n >= 1` のときだけ採用します。`Number(undefined)` は `NaN` です。"
  - "`ProductsPage` の `searchParams` は Promise なので、`parseListParams(await searchParams)` のように `await` してから渡します。"
---

商品一覧ページ (`app/products/page.tsx`) で、URL のクエリを読み取る部分を作ります。

### 1. `parseListParams(searchParams)`

Next.js のページが受け取る `searchParams` (を `await` したもの) を、画面で使いやすい形に変換します。URL は利用者が自由に書き換えられるので、**おかしな値が来ても必ず次の形を返す** ようにしてください。

| キー | 結果 | ルール |
| --- | --- | --- |
| `page` | `number` | 1 以上の整数ならその値。それ以外 (無い、`'abc'`、`'0'`、`'2.5'` など) は `1` |
| `q` | `string` | あればその文字列。無ければ `''` |
| `sort` | `'new' \| 'old'` | `'old'` なら `'old'`、それ以外は `'new'` |

同じキーが 2 回ある URL (`?q=a&q=b`) では値が配列 (`['a', 'b']`) になります。そのときは **最初の値** を使います。

```ts
parseListParams({ page: '2', q: 'shoe', sort: 'old' }); // { page: 2, q: 'shoe', sort: 'old' }
parseListParams({}); // { page: 1, q: '', sort: 'new' }
parseListParams({ page: 'abc', sort: 'popular' }); // { page: 1, q: '', sort: 'new' }
parseListParams({ q: ['a', 'b'] }); // { page: 1, q: 'a', sort: 'new' }
```

### 2. `ProductsPage` (Server Component)

`searchParams` を受け取り、`parseListParams` で変換した結果を `<p>page=2 q=shoe sort=old</p>` の形で表示します。テストでは次のように、async 関数として直接呼び出して確かめます。

```tsx
render(await ProductsPage({ searchParams: Promise.resolve({ page: '3', q: 'bag' }) }));
```
