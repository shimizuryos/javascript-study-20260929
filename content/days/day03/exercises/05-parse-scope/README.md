---
title: "(発展) URL の文字列を Scope に変換する"
optional: true
typecheck: true
hints:
  - "`SCOPES.includes(value)` は、`SCOPES` の要素の型が `'all' | 'mine' | 'team'` なので、それ以外の型の値を渡すと型エラーになります。"
  - "`SCOPES.some((scope) => scope === value)` なら、比較するだけなので型エラーになりません。"
  - "`parseScope` は `isScope(value) ? value : 'all'` の 1 行で書けます。`isScope` が `true` を返した側では `value` が `Scope` に絞り込まれます。"
---

URL の `?scope=mine` の値 (文字列、無ければ `null`) を `Scope` 型に変換する関数を作ります。nuqs の `parseAsStringLiteral(SCOPES)` が内部でやっていることの簡易版です (Day 11)。

### 1. `isScope(value: unknown): value is Scope`

`value` が `'all'` / `'mine'` / `'team'` のどれかなら `true` を返します。

戻り値の型 `value is Scope` は **型ガード** と呼ばれる書き方で、「この関数が `true` を返したら、`value` は `Scope` 型だ」と TypeScript に教えます。これで `if (isScope(x)) { ... }` の中では `x` が `Scope` に絞り込まれます (`typeof x === 'string'` と同じように使える自作の絞り込み)。

### 2. `parseScope(value: string | null): Scope`

`Scope` として正しい値ならそのまま、それ以外 (`null` や知らない文字列) なら `'all'` を返します。

```ts
parseScope('mine'); // 'mine'
parseScope('org'); // 'all'
parseScope(null); // 'all'
```

`main.ts` にはそれらしいコードが書いてありますが、型エラーが出ています。**`as` を使わずに** 直してください。
