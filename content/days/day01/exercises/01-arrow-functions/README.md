---
title: アロー関数で書いてみる
hints:
  - "`const double = (x: number) => x * 2;` のように、`=>` の右側がそのまま戻り値になる省略形が使えます。"
  - "テンプレートリテラルはバッククォートで囲み、`${name}` で値を埋め込みます。"
  - "オブジェクトを返すときは `( )` で囲みます: `(name: string) => ({ name, active: true })`"
---

`main.ts` の 3 つの関数を **アロー関数** で完成させてください。

| 関数 | 例 | 戻り値 |
| --- | --- | --- |
| `double` | `double(3)` | `6` |
| `greet` | `greet('Alice')` | `'こんにちは、Aliceさん'` |
| `toUser` | `toUser('Bob')` | `{ name: 'Bob', active: true }` |

テストでは「アロー関数で書かれているか」もチェックします (アロー関数には `prototype` が無い、という性質を使っています)。
