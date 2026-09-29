---
title: URL とルートを照合する (matchRoute)
hints:
  - "`'/users/42'.split('/').filter(Boolean)` は `['users', '42']` になります (先頭の空文字 `''` が取り除かれる)。パターンも同じように分けます。"
  - "パターンのセグメントを先頭から 1 つずつ見ます。`[id]` なら `params.id = URL 側の同じ位置の値`、`[...slug]` なら `urlSegments.slice(i)` (残り全部) を入れて、その場で return します。"
  - "ルートグループは先に取り除いておくと楽です: `.filter((s) => !(s.startsWith('(') && s.endsWith(')')))`。最後に「パターンと URL のセグメント数が同じか」を確認するのを忘れずに。"
---

Next.js がフォルダ名 (`app/users/[id]` など) と URL を照合して `params` を作る仕組みを、小さな関数で再現します。

`matchRoute(pattern, pathname)` を完成させてください。一致すれば `params` オブジェクト、一致しなければ `null` を返します。

| パターンのセグメント | 意味 |
| --- | --- |
| `users` (普通の文字列) | URL の同じ位置が **完全に同じ** なら一致 |
| `[id]` | 任意の 1 セグメントに一致。`params.id` に **文字列** で入れる |
| `[...slug]` | 残りのセグメント **1 つ以上** に一致。`params.slug` に **配列** で入れる (パターンの最後にだけ来る) |
| `(marketing)` | ルートグループ。URL には出ないので **無視** する |

```ts
matchRoute('/users', '/users'); // {}
matchRoute('/users', '/posts'); // null
matchRoute('/users/[id]', '/users/42'); // { id: '42' }
matchRoute('/shop/[category]/[item]', '/shop/shoes/7'); // { category: 'shoes', item: '7' }
matchRoute('/users/[id]', '/users/42/posts'); // null  ← セグメントの数が違う
matchRoute('/docs/[...slug]', '/docs/react/hooks'); // { slug: ['react', 'hooks'] }
matchRoute('/docs/[...slug]', '/docs'); // null  ← 1 つ以上必要
matchRoute('/(marketing)/about', '/about'); // {}
```

余裕があれば、0 個でも一致する `[[...slug]]` にも対応してみましょう (テストはありません)。
