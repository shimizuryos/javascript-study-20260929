---
title: 絞り込みで場合分けする
hints:
  - "`formatQuery` は `if (q === null) return ...;` の早期 return から書き始めると、その下では `q` が `string` になります。空白だけの判定は `q.trim() === ''` です。"
  - "`toPage` は `typeof value === 'number'` で分けます。文字列は `Number(value)` で数値にし、変換できないと `NaN` になるので `Number.isNaN(n)` で確かめます。"
  - "`describeResult` は `'error' in result` で、どちらの形かを見分けられます。"
---

**ユニオン型の値を、絞り込みで場合分けする** 関数を 3 つ作ります。どの関数も、TypeScript が「この行ではこの型」と理解できる書き方にしましょう。

### 1. `formatQuery(q: string | null): string`

- `null`、または空白だけ (`''` や `'  '`) → `'すべて'`
- それ以外 → 前後の空白を取り除いて `「react」の検索結果`

```ts
formatQuery(null); // 'すべて'
formatQuery('  '); // 'すべて'
formatQuery(' react '); // '「react」の検索結果'
```

### 2. `toPage(value: string | number | null | undefined): number`

URL などから来たページ番号を数値にします。

- `null` / `undefined` → `1`
- 数値 → そのまま
- 文字列 → 数値に変換。変換できない (`NaN` になる) ときは `1`

```ts
toPage(3); // 3
toPage('4'); // 4
toPage('abc'); // 1
toPage(undefined); // 1
```

### 3. `describeResult(result: LoadResult): string`

`LoadResult` は「成功 (`items` を持つ)」か「失敗 (`error` を持つ)」のどちらかです。

```ts
describeResult({ items: ['a', 'b'] }); // '2 件'
describeResult({ error: '通信に失敗しました' }); // 'エラー: 通信に失敗しました'
```
