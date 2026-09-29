---
title: 型エラーを読んで直す
typecheck: true
hints:
  - "`'q' は 'null' の可能性があります` → `q` が `null` のときの処理を先に書くと、その下では `q` が `string` に絞り込まれます。"
  - "`'options.pageSize' は 'undefined' の可能性があります` → `?` 付きのプロパティなので、`??` でデフォルト値を決めます。"
  - "`型 'string' を型 '\"all\" | \"mine\" | \"team\"' に割り当てることはできません` → オブジェクトのプロパティが `string` に広がっています。変数に `ScopeParams` の型注釈を付けてみましょう。"
---

`main.ts` の 3 つの関数には、それぞれ **型エラー** が 1 つずつあります (「実行」するとエラーの一覧が見られます)。エラーメッセージを読んで原因を考え、**`as` や `!` を使わずに** 直してください。

| 関数 | 仕様 |
| --- | --- |
| `normalizeQuery(q)` | 前後の空白を除いて小文字にする。`q` が `null` なら `''` |
| `offsetOf(page, options)` | `page` ページ目 (1 始まり) の先頭が何件目か (0 始まり)。`pageSize` が省略されたら `20` |
| `defaultParams()` | URL に何も無いときの初期値 `{ scope: 'all', page: 1, q: null }` を返す |

```ts
normalizeQuery(' React '); // 'react'
normalizeQuery(null); // ''
offsetOf(3, { pageSize: 10 }); // 20
offsetOf(3, {}); // 40
```

`as` や `!` を使えば型エラーは消えますが、`normalizeQuery(null)` が実行時エラーになるなど、**問題を隠すだけ** です。型エラーは「実行前に見つかったバグ」だと考えて、仕様どおりに動くよう直しましょう。
