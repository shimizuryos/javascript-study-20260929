---
title: ジェネリック関数を書く
typecheck: true
hints:
  - "`function first<T>(xs: T[]): T | undefined` のように、関数名の直後に `<T>` を書き、引数と戻り値の型に `T` を使います。"
  - "`paginate` の中身は `all.slice(start, start + pageSize)` で切り出せます (`start = (page - 1) * pageSize`)。`slice` は元の配列を変更しません。"
  - "`mapItems` は型パラメータを 2 つ使います: `function mapItems<T, U>(page: Paginated<T>, fn: (item: T) => U): Paginated<U>`。中身は `{ ...page, items: page.items.map(fn) }` です。"
---

`unknown` で書かれている 3 つの関数を **ジェネリック関数** に書き直し、中身も完成させてください。型チェック演習なので、型エラー 0 件 + テスト合格で正解です。

`Paginated<T>` は目標コードの `api.ts` と同じ「1 ページ分の行 + 全件数」の型です。

```ts
type Paginated<T> = { items: T[]; total: number };
```

### 1. `first(xs)`

配列の最初の要素を返します (空なら `undefined`)。戻り値の型が「要素の型 `| undefined`」になるようにします。

```ts
const a = first([1, 2, 3]); // a: number | undefined、値は 1
const b = first(users); // b: User | undefined
```

### 2. `paginate(all, page, pageSize)`

全件の配列から `page` ページ目 (**1 始まり**) の分を切り出して `Paginated<T>` を返します。`total` は全件数です。

```ts
paginate(['a', 'b', 'c', 'd', 'e'], 2, 2); // { items: ['c', 'd'], total: 5 }  型は Paginated<string>
```

### 3. `mapItems(page, fn)`

`items` の各要素を `fn` で変換した **新しい** `Paginated` を返します (`total` はそのまま)。変換後の型は `fn` の戻り値の型から決まります。

```ts
mapItems({ items: [{ id: 1, name: 'Alice' }], total: 9 }, (u) => u.name);
// { items: ['Alice'], total: 9 }  型は Paginated<string>
```
