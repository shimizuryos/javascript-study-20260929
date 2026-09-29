---
title: バグを 3 つ直す
optional: false
hints:
  - "テスト名を手がかりにします。「pageIndex 1 (0 始まり)」「関数が渡ってくる」「queryKey に q」がそれぞれ 1 か所ずつに対応しています。"
  - "`updater as PaginationState` は「関数かもしれない」値を型だけ黙らせています。`typeof updater === 'function'` で場合分けしましょう。"
  - "URL の `page` は 1 始まり、TanStack Table の `pageIndex` は 0 始まりです。書き戻す側 (`+ 1`) と読み込む側で、変換が対になっているか確認してください。"
---

同僚が書いた `useSharedScopeQuery` (`main.ts`) に **バグが 3 か所** あります。どれも型エラーにはならず、画面を触って初めて気づくタイプのバグです。テストが全部通るように直してください。

テストでは、実務と同じようにフックの戻り値を `useReactTable` (`manualPagination: true`) につないで動かしています (`test.tsx` の `useMembersTable`)。`api.ts` は 12 人のメンバーを 1 ページ 5 件で返す疑似 API です。

### 報告されている症状

1. URL が `?page=2` なのに、テーブルは 3 ページ目だと思っている (「3 / 3 ページ」と表示され、「次へ」が押せない)
2. 「次へ」ボタン (`table.nextPage()`) を押すとページが壊れる。ただし `onPaginationChange({ pageIndex: 2, pageSize: 5 })` のように **値** を渡すと動く
3. 検索語を変えても一覧が変わらない。URL の `q` はちゃんと変わっている

直すのは **3 か所だけ** です。関係ない行は変えないでください (試験では「どこが悪いかを読んで特定する」力を見ています)。
