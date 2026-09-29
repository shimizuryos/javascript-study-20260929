---
title: 最終試験 — useSharedScopeQuery を読み解く
level: 5
passScore: 80
---

14 日間の総仕上げです。目標コード `useSharedScopeQuery` と、その **変種** や **使う側のコード** を読み解けるかを確認します。Day 14 のレッスンと演習を終えてから受けてください。

## 範囲

範囲は **全日 (Day 1〜14)** です。特に次の 2 つに重点を置いています。

- **目標コードの読解** — 各行の意味、型 (`Scope` / `string | null`)、`as const`、`page - 1`、`typeof updater === 'function'`、`page: null`、`text || null`、`'use client'`
- **Level 4 のライブラリ** — nuqs (パーサー、`withDefault`、`clearOnDefault`、`urlKeys`、`history`)、TanStack Query (queryKey、`keepPreviousData`、`isPlaceholderData`、`select`)、TanStack Table (`manualPagination`、`rowCount`、`state`、`onPaginationChange` と Updater)

新しい知識は出ません。レッスンで扱ったことだけです。

## 形式と採点

| | 数 | 配点 |
| --- | --- | --- |
| 選択問題 (コード読解中心) | 12 問 | 各 1 点 |
| 演習 (バグ修正・予想・実装) | 3 問 | 各 3 点 |

- 合計 21 点。**80% (17 点) 以上で合格** です
- 演習で「解答を表示」すると、その演習は 0 点になります
- 目安の時間は **60 分** です

## 進め方

1. まずレッスンやメモを見ずに、選択問題を解きます。コードは頭の中で実行してみましょう
2. 演習は、テストが全部通れば正解です。テストのファイルは読んでかまいません (何を確かめているかのヒントになります)
   - 演習 1 (バグ修正): 症状から原因の行を特定する練習です。直すのは 3 か所だけです
   - 演習 2 (予想): 実行せずに答えを書いてから「実行」します。何度でも挑戦できます
   - 演習 3 (実装): 目標コードのフックを使う側を書きます
3. 間違えた問題は解説を読み、レッスンの該当箇所 (解説に Day が書いてあります) を見直しましょう

合格したら、いよいよ本物のコードベースです。Day 14 の「知らないフックを読むチェックリスト」を手元に置いて、まずは `useSharedScopeQuery` を使っている画面を 1 つ開いてみてください。
