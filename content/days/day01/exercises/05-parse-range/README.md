---
title: "(発展) \"3-7\" を分解する"
optional: true
hints:
  - "`'3-7'.split('-')` は `['3', '7']` になります。"
  - "分割代入のデフォルト値には、前に取り出した変数も使えます: `const [fromText, toText = fromText] = ...`"
  - "文字列を数値にするには `Number('3')` を使います。"
---

ページ範囲を表す文字列を `{ from, to }` に変換する `parseRange` を作ってください。

```ts
parseRange('3-7'); // { from: 3, to: 7 }
parseRange('5'); // { from: 5, to: 5 }  ← 1 つだけなら from と to は同じ
```

配列の分割代入とデフォルト値を使うと、`if` を書かずに 2 行で書けます。
