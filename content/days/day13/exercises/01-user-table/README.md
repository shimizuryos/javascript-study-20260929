---
title: 列定義から表を描画する
preview: preview.tsx
hints:
  - "名前の列は `` { id: 'name', header: '名前', accessorFn: (row) => `${row.lastName} ${row.firstName}` } `` です。"
  - "役割の列は `{ accessorKey: 'role', header: '役割', cell: ({ row }) => ROLE_LABELS[row.original.role] }` のように、`cell` で表示を変えます。"
  - "`<tbody>` は `<thead>` と同じ形です: `table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)`"
---

ユーザー一覧の表を TanStack Table で作ります。`main.tsx` の TODO を埋めてください。

### 1. 列定義 `columns`

| 見出し | 中身 | 書き方 |
| --- | --- | --- |
| 名前 | `姓 名` (例: `山田 太郎`) | `accessorFn` で計算する (`id: 'name'`) |
| メール | `email` | `accessorKey` (書いてあります) |
| 役割 | `'admin'` → `管理者`、`'member'` → `メンバー` | `accessorKey` + `cell` |

列の順番は「名前・メール・役割」です。

### 2. `UserTable` の `<tbody>`

`<thead>` はすでに書いてあります。同じ形で、`table.getRowModel().rows` と `row.getVisibleCells()` と `flexRender` を使って `<tbody>` を書いてください。

```text
| 名前     | メール              | 役割     |
| 山田 太郎 | taro@example.com   | 管理者   |
| 佐藤 花子 | hanako@example.com | メンバー |
```

`users.ts` にテスト用のデータがあります。プレビュー欄で表の見た目を確認できます。
