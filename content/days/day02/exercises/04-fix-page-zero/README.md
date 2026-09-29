---
title: "「1 ページ目」に戻れないバグを直す"
hints:
  - "`pageIndex` は 0 始まりなので、`0` は「1 ページ目」という **正しい値** です。"
  - "`0 || lastPageIndex` はいくつになるでしょうか? `||` は左が falsy なら右を使います。"
  - "「値が無い (`null` / `undefined`) ときだけ代わりを使う」には `??` を使います。"
---

一覧画面のページ位置を決める関数 `resolvePagination` に、次のバグ報告が来ました。

> 一覧で「1」ページ目のボタンを押しても、前回見ていたページに戻されてしまいます。2 ページ目や 3 ページ目には移動できます。

仕様は次のとおりです。

- `input.pageIndex` は **0 始まり** (TanStack Table と同じ。`0` = 1 ページ目)
- `input.pageIndex` が指定されていない (`undefined` / `null`) ときだけ、前回見ていたページ `lastPageIndex` を使う
- `input.pageSize` が指定されていなければ `20`
- `offset` は「何件目から取得するか」で、`pageIndex * pageSize`

```ts
resolvePagination({ pageIndex: 2 }, 5); // { pageIndex: 2, pageSize: 20, offset: 40 }
resolvePagination({}, 5); // { pageIndex: 5, pageSize: 20, offset: 100 }  ← 前回のページ
resolvePagination({ pageIndex: 0 }, 5); // { pageIndex: 0, pageSize: 20, offset: 0 }  ← 今はここが壊れている
```

バグは `main.ts` の **1 か所** だけです。原因を見つけて直してください (`pageLabel` は正しく動いています)。
