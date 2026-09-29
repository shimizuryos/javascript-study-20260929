---
title: 元のデータを壊さずに更新する
hints:
  - "`{ ...query, page: 1, ...patch }` の順に書くと、「まず全部コピー → page を 1 に → patch で上書き」になります。"
  - "配列に追加するときは `[...tags, tag]` で新しい配列を作ります。`tags.push(tag)` は元の配列を書き換えてしまいます。"
---

検索画面の「今の条件」を表すオブジェクトを、**元のオブジェクトを変更せずに** 更新する関数を作ります (React の state 更新と同じ考え方です)。

### 1. `nextQuery(query, patch)`

- `query` をコピーして、`patch` の中身で上書きした **新しい** オブジェクトを返す
- ただし `patch` に `page` が含まれていなければ、`page` は `1` に戻す (条件が変わったら 1 ページ目から表示するため)

```ts
nextQuery({ page: 3, q: 'react', sort: 'new' }, { q: 'next' });
// → { page: 1, q: 'next', sort: 'new' }

nextQuery({ page: 3, q: 'react', sort: 'new' }, { page: 4 });
// → { page: 4, q: 'react', sort: 'new' }
```

`Partial<Query>` は「`Query` のプロパティがすべて省略可能になった型」です (Day 4 で詳しく扱います)。

### 2. `addTag(tags, tag)`

- `tag` を末尾に加えた **新しい** 配列を返す
- すでに含まれているなら、同じ中身の新しい配列を返す (重複させない)
