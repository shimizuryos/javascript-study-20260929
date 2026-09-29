---
title: 分割代入で取り出す
hints:
  - "`swap` は `([a, b]) => [b, a]` のように、引数の位置で分割代入できます。"
  - "`headAndTail` は `const [head, ...tail] = items;` で「最初」と「残り全部」に分けられます。"
  - "`describeResult` は `const { data: rows = [], isPending } = result;` の形です。`data` を `rows` という名前で取り出し、無ければ `[]` にします。"
---

分割代入を使って、次の 3 つの関数を完成させてください。

1. `swap([a, b])` … 2 要素の配列を受け取り、順番を入れ替えた配列を返す
2. `headAndTail(items)` … `{ head: 最初の要素, tail: 残りの配列 }` を返す
3. `describeResult(result)` … `result.data` (無いときは空配列とみなす) と `result.isPending` から、次の文字列を返す
   - `isPending` が `true` → `'読み込み中'`
   - それ以外 → `'3 件'` のように件数

```ts
describeResult({ data: ['a', 'b'], isPending: false }); // '2 件'
describeResult({ isPending: false }); // '0 件'
describeResult({ isPending: true }); // '読み込み中'
```

関数の中で `result.data` のように `.` でアクセスせず、分割代入で取り出してみましょう。
