---
title: 変種のフックを予想で読む
optional: false
hints:
  - "`urlKeys: { scope: 's', page: 'p' }` は「state の名前は scope / page のまま、URL 上のキーだけ s / p にする」設定です。URL の `scope=...` は誰も読みません。"
  - "`select` の戻り値が `query.data` になります (キャッシュに入るのは API の生のレスポンス)。nuqs はデフォルト値と同じ値をセットするとキーを URL から消します。"
  - "`useQueryStates` の更新関数は `setParams((old) => ({ ... }))` の形も受け付けます。返したキーだけが変わり、他のキーはそのままです。"
---

実務では、目標コードとは少し違う書き方のフックにも出会います。`variant.ts` の `useMemberList` を読み、**実行せずに** 結果を予想して `main.ts` の `answers` に書いてください。テストは本物のフックを動かして、一致したかだけを判定します。

`api.ts` は目標コードの演習と同じ疑似 API です (12 人、1 ページ 5 件)。名前の並びは `佐藤, 鈴木, 高橋, 田中, 伊藤, 渡辺, 山本, 中村, 小林, 加藤, 吉田, 山田`、`scope: 'team'` (自分のチーム = フロント) は `佐藤, 高橋, 伊藤, 山本, 小林, 吉田` の 6 人です。

| 問 | 最初の URL | 操作 | 答えるもの |
| --- | --- | --- | --- |
| Q1 | `?scope=team&p=2` | なし | `[scope, page]` |
| Q2 | `?s=team` | 読み込み完了まで待つ | `data` |
| Q3 | (空) | `setParams({ scope: 'mine', page: 2 })` | 更新後の URL のクエリ |
| Q4 | (空) | Q3 と同じ | その URL 更新の `{ history, shallow }` |
| Q5 | `?p=3` | `setParams({ page: 1 })` | 更新後の URL のクエリ |
| Q6 | `?s=mine` | `setParams((old) => ({ page: old.page + 1 }))` | 更新後の URL のクエリ |
| Q7 | `?s=team&p=2` | 読み込み完了後に `setParams({ q: '田' })`、再び読み込み完了まで待つ | `data` |

- URL のクエリは `{ s: 'team', p: '2' }` のようにオブジェクトで書きます (値は文字列。何も無ければ `{}`)。
- Q7 は `useSharedScopeQuery` の `setSearch` と何が違うかを考えると解けます。
