---
title: useMembersQuery と ScopeTabs を作る
optional: false
hints:
  - "`useMembersQuery` は `useSharedScopeQuery('members', fetchMembers, { pageSize: PAGE_SIZE })` を返すだけです。第 1 引数は queryKey の先頭に、第 3 引数の pageSize は queryKey と pagination に入ります。"
  - "ボタンは `SCOPES.map((s) => <button key={s} aria-pressed={s === scope} onClick={() => void setScope(s)}>{SCOPE_LABELS[s]}</button>)` の形です。"
  - "`setScope('all')` は `scope=all` を書き込もうとしますが、`'all'` はデフォルト値なので nuqs が URL から消します。page は `page: null` で消えます。"
---

目標コードの `useSharedScopeQuery` を使って、次の 2 つを `main.tsx` に作ってください。

### 1. `useMembersQuery()` — 機能ごとのラッパー

実務のコードベースでは、共通フックを直接呼ばずに `useMembersQuery` のような **機能専用のラッパー** を経由していることがよくあります。

- `useSharedScopeQuery` を resource `'members'`、fetcher `fetchMembers`、`pageSize: PAGE_SIZE` (5) で呼び、その戻り値をそのまま返す
- 例: URL が `?scope=team` なら queryKey は `['members', { scope: 'team', page: 1, q: null, pageSize: 5 }]`

### 2. `<ScopeTabs />` — 表示範囲の切り替えボタン

- `SCOPES` の順に 3 つの `<button>` を並べる。文字は `SCOPE_LABELS` (`すべて` / `自分が追加` / `自分のチーム`)
- 今の `scope` のボタンだけ `aria-pressed="true"`、他は `"false"` (`aria-pressed={s === scope}` と書けば React が文字列にします)
- 押すと `setScope` を呼ぶ (page は 1 ページ目に戻る)
- ボタンの下に `全 6 件` のように全件数 (`rowCount`) を表示する。最初の読み込み中 (`isPending`) は `読み込み中…`

| 最初の URL | 操作 | URL | 表示 |
| --- | --- | --- | --- |
| `?scope=team` | — | `?scope=team` | 「自分のチーム」が押された状態、`全 6 件` |
| `?page=2` | 「自分が追加」 | `?scope=mine` | `全 3 件` |
| `?scope=team&page=2` | 「すべて」 | (空) | `全 12 件` |
