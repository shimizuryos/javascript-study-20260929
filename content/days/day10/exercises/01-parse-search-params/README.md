---
title: searchParams を安全に変換する
hints:
  - "配列なら最初の 1 つ、そうでなければそのまま: `const first = (v: Value) => (Array.isArray(v) ? v[0] : v);`"
  - "`page` は `const n = Number(first(sp.page));` として、`Number.isInteger(n) && n >= 1` のときだけ使い、それ以外は `1` にします (`Number(undefined)` は `NaN` なので、無いときも自然に `1` になります)。"
  - "`q` は `first(sp.q) || null` と書くと、`undefined` と `''` の両方が `null` になります。`tags` は `undefined` → `[]`、文字列 → `[文字列]`、配列 → そのまま。"
  - "ページ側は `parseSearchParams(await searchParams)` です。`await` を忘れると Promise オブジェクトを渡してしまいます。"
---

商品一覧ページ `app/products/page.tsx` を作ります。URL のクエリは誰でも自由に書き換えられるので、page に届く `searchParams` の値は `string | string[] | undefined` のどれでもありえます。これを画面で使いやすい形に変換しましょう。

### 1. `parseSearchParams(sp)`

`{ page: number; q: string | null; tags: string[] }` を返します。

| 項目 | ルール |
| --- | --- |
| `page` | 1 以上の整数ならその数値。無い・数字でない・0 以下・小数なら **`1`**。配列なら最初の値を使う |
| `q` | 文字列ならその値。無い・空文字なら **`null`**。配列なら最初の値を使う |
| `tags` | 無ければ `[]`、1 つなら `['red']`、複数ならその配列 |

```ts
parseSearchParams({ page: '2', q: 'shoe', tags: 'red' });
// → { page: 2, q: 'shoe', tags: ['red'] }

parseSearchParams({});
// → { page: 1, q: null, tags: [] }

parseSearchParams({ page: ['3', '4'], q: ['a', 'b'], tags: ['red', 'blue'] }); // ?page=3&page=4&q=a&q=b&tags=red&tags=blue
// → { page: 3, q: 'a', tags: ['red', 'blue'] }

parseSearchParams({ page: 'abc', q: '' });
// → { page: 1, q: null, tags: [] }
```

### 2. `ProductsPage({ searchParams })` (default export)

`searchParams` (Promise) を `await` して `parseSearchParams` に渡し、次のように表示します。

```tsx
<section>
  <h1>商品一覧</h1>
  <p>{page} ページ目</p>
  <p>検索語: {q が null なら 'なし'}</p>
  <p>タグ: {tags を ', ' でつないだもの。空なら 'なし'}</p>
</section>
```
