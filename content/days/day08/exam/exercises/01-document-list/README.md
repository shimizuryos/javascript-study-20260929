---
title: 絞り込みとお気に入りのある一覧
hints:
  - "state は 2 つ: `const [docs, setDocs] = useState(initialDocs);` と `const [scope, setScope] = useState<Scope>('all');`。絞り込んだ一覧は state にせず、レンダー中に `docs.filter(...)` で計算します。"
  - "お気に入りの切り替えは `setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)))` です。"
  - "0 件のときは三項演算子で `<p>該当するドキュメントはありません</p>` と `<ul>` を切り替えます。"
---

ドキュメント一覧を完成させてください。

```ts
type Scope = 'all' | 'mine' | 'team';
type Doc = { id: number; title: string; owner: 'me' | 'team'; starred: boolean };
```

- 上部に「すべて」「自分」「チーム」の 3 つのボタンがある。押したボタンが選択中になり (`aria-pressed={true}`)、一覧が絞り込まれる
  - `all` … すべて / `mine` … `owner === 'me'` / `team` … `owner === 'team'`
  - 最初は「すべて」
- 絞り込んだ件数を `<p>3 件</p>` の形で表示する
- 0 件のときは `<ul>` の代わりに `<p>該当するドキュメントはありません</p>` を表示する
- 各行には、タイトルとお気に入りボタン (`aria-label="〇〇 をお気に入り"`) を置く。ボタンを押すと `starred` が切り替わり、`aria-pressed` と表示 (`★` / `☆`) が変わる
- 親から渡された `initialDocs` は変更しない。絞り込みを切り替えても、お気に入りの状態は保たれる
