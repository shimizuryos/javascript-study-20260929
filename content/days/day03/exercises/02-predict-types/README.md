---
title: 型を予想して書く
typecheck: true
hints:
  - "`const` で宣言した文字列はその値のリテラル型、`let` は `string` に広がります。オブジェクトのプロパティも広がります。"
  - "`as const` を付けたオブジェクトは、すべてのプロパティが `readonly` でリテラル型になります。配列は `readonly [...]` のタプルになります。"
  - "`['a', 1]` のように型が混ざった配列は `(string | number)[]` です。`keyof` はキーのユニオンです。"
---

**型を読む力** をつける問題です。`test.ts` には次の変数が定義されています。それぞれの型を **予想して**、`main.ts` の `A1`〜`A10` に書いてください。エディタのマウスオーバーに頼らず、まず自分で考えてみましょう。`typeof` は使わずに、型を直接書きます (例: `export type A0 = number;`)。

```ts
const e1 = 'mine';
let e2 = 'mine';
const e3 = { page: 1, q: 'ts' };
const e4 = { page: 1, q: 'ts' } as const;
const e5 = [1, 2, 3];
const e6 = ['a', 1];
const e7 = ['all', 'mine'] as const;
const e8 = Math.random() > 0.5 ? 'x' : null;
```

| 問題 | 答える型 |
| --- | --- |
| `A1` | `typeof e1` |
| `A2` | `typeof e2` |
| `A3` | `typeof e3` |
| `A4` | `typeof e4` |
| `A5` | `typeof e5` |
| `A6` | `typeof e6` |
| `A7` | `typeof e7` |
| `A8` | `(typeof e7)[number]` |
| `A9` | `typeof e8` |
| `A10` | `keyof typeof e3` |

間違えている問題は、`test.ts` の該当する行 (`// Q1` などのコメント付き) が型エラーになります。正解の型はエラーメッセージに出ないので、レッスンを見直して考えましょう。
