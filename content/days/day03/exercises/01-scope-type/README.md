---
title: as const から Scope 型を作る
typecheck: true
hints:
  - "配列やオブジェクトの末尾に `as const` を付けると、要素がリテラル型 (`'all'` など) のまま固定され、読み取り専用になります。"
  - "`export type Scope = (typeof SCOPES)[number];` — 目標コードと同じ書き方です。"
  - "`keyof typeof SCOPE_KEYS` で、キーのユニオン `'scope' | 'page' | 'q'` が作れます。"
---

目標コードの 9〜17 行目を自分で書いてみる **型チェック演習** です。`main.ts` の `TODO` を埋めて、次の型を作ってください。

| 名前 | 作りたい型 | 作り方 |
| --- | --- | --- |
| `SCOPES` | `readonly ['all', 'mine', 'team']` | 配列に `as const` を付ける |
| `Scope` | `'all' \| 'mine' \| 'team'` | `SCOPES` から作る (直接書かない) |
| `SCOPE_KEYS` | `{ readonly scope: 'scope'; readonly page: 'page'; readonly q: 'q' }` | オブジェクトに `as const` を付ける |
| `ScopeKey` | `'scope' \| 'page' \| 'q'` | `SCOPE_KEYS` から作る (直接書かない) |

### 型チェック演習の進め方

- 「実行」すると、テストに加えて **型エラーの一覧** が表示されます。型エラー 0 件 + テスト合格で正解です。
- `test.ts` の `Expect<Equal<A, B>>` は「型 `A` と型 `B` が完全に同じ」ことを確かめる書き方です。違うとその行が型エラーになります。
- `// @ts-expect-error` は「**次の行は型エラーになるべき**」という印です。エラーにならないと `Unused '@ts-expect-error' directive.` (使われていない @ts-expect-error) というエラーが出ます。
