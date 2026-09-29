---
title: ページを切り替えても前のページを表示し続ける
hints:
  - "`import { keepPreviousData, useQuery } from '@tanstack/react-query';` として、useQuery に `placeholderData: keepPreviousData` を足します。"
  - "queryFn は `({ signal }) => fetchUsersPage(page, signal)` のように、引数から signal を取り出して渡します。"
  - "「次へ」は `disabled={isPlaceholderData || !data.hasMore}`。「更新中…」は `isFetching` のときに表示します。"
---

ユーザー一覧をページごとに取得する `PagedUsers` があります。いまは「次へ」を押すたびに画面全体が「読み込み中…」に戻ってしまい、ボタンの位置もずれて使いにくい状態です。

次のように改善してください。

1. **ページを切り替えている間も、前のページの一覧を表示し続ける** (`placeholderData: keepPreviousData`)
2. 取得中 (`isFetching`) は、一覧の下に `<p>更新中…</p>` を表示する
3. 「次へ」は、次のページが無いとき (`data.hasMore` が `false`) に加えて、**仮のデータを表示している間** (`isPlaceholderData`) も押せないようにする (連打防止)
4. queryFn が受け取る `signal` を `fetchUsersPage` に渡す (不要になったリクエストを中断できるように)

```text
1 ページ目: ユーザー1〜3  [前へ(押せない)] [次へ]
「次へ」を押した直後: ユーザー1〜3 (薄く) / 更新中…  [次へ(押せない)]
少しして: ユーザー4〜6
```

`api.ts` の `fetchUsersPage(page, signal)` は 1 ページ 3 人、全 7 人のデータを返します。
