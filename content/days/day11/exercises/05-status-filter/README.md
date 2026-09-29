---
title: "(発展) 決まった値だけを受け付けるフィルター"
optional: true
preview: preview.tsx
hints:
  - "`parseAsStringLiteral(STATUSES).withDefault('all')` にすると、値の型は `'all' | 'open' | 'closed'` になり、それ以外の文字列は null (→ デフォルトの 'all') になります。"
  - "`useQueryState('status', statusParser)` の第 2 引数にパーサーを渡します。パーサーはコンポーネントの外で定義しておきます。"
  - "`status === 'all'` なら全件、それ以外は `issues.filter((issue) => issue.status === status)` です。"
---

課題一覧を「すべて / 未対応 / 完了」で絞り込む画面です。いまは `useQueryState('status')` (文字列そのまま) を使っているため、`?status=done` のような想定外の値が来ると何も表示されず、どのボタンも選ばれていない状態になります。

`parseAsStringLiteral` を使って、**決まった値だけを受け付ける** ように書き換えてください。

1. `statusParser` … `STATUSES` のどれかだけを受け付け、それ以外は `'all'` になるパーサー
2. `IssueList` … `useQueryState('status', statusParser)` で URL から読み、一覧を絞り込む

| URL | 表示される課題 | 押された状態のボタン |
| --- | --- | --- |
| (なし) | 全件 | すべて |
| `?status=open` | 未対応のものだけ | 未対応 |
| `?status=done` (想定外) | 全件 | すべて |

- ボタンを押すと URL の `status` が変わる。「すべて」を押したときは、デフォルト値なので `status` が URL から消える
- 押された状態は `aria-pressed` 属性で表す (すでに書いてあります)
