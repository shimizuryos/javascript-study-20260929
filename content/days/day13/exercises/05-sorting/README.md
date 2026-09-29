---
title: "(発展) 見出しをクリックして並び替える"
optional: true
hints:
  - "`const [sorting, setSorting] = useState<SortingState>([]);` を用意し、`useReactTable` に `getSortedRowModel: getSortedRowModel()`、`state: { sorting }`、`onSortingChange: setSorting` を渡します。ページネーションと同じ形です。"
  - "見出しのボタンは `onClick={header.column.getToggleSortingHandler()}` です。"
  - "今の向きは `header.column.getIsSorted()` で、`'asc'` / `'desc'` / `false` のどれかです。"
---

メンバー一覧の表に、**見出しをクリックすると並び替わる** 機能を付けてください。ページネーションと同じく「行モデル + state + on〇〇Change」の組で作ります。

- 見出しの中の `<button>` を押すたびに、その列で並び替える
  - 文字列の列 (名前): 昇順 → 降順 → 並び替えなし (元の順)
  - 数値の列 (年齢): **降順から** 始まる (TanStack Table の既定の動き)
- 並び替えている列の見出しには、昇順なら ` ▲`、降順なら ` ▼` を付ける (例: `名前 ▲`)
- 並び替えの状態 `sorting` は `useState<SortingState>` で自分で持つ

```text
最初:          Sato / Aoki / Kato / Ito     (渡した順)
「名前」1 回目: Aoki / Ito / Kato / Sato    見出しは「名前 ▲」
「名前」2 回目: Sato / Kato / Ito / Aoki    見出しは「名前 ▼」
```
