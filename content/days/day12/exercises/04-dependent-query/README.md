---
title: 前のクエリの結果を待ってから取得する
hints:
  - "プロジェクトの取得には `userId` が必要です。`userId` は 1 つ目のクエリの `data?.id` なので、最初は `undefined` です。"
  - "2 つ目の useQuery に `enabled: userId !== undefined` を足すと、userId が決まるまで queryFn が呼ばれません。"
---

メールアドレスからユーザーを探し、そのユーザーのプロジェクト一覧を表示する `UserProjects` があります。画面は正しく表示されるのですが、サーバーのログを見ると、**毎回 `fetchProjects(undefined)` という不正なリクエストが 1 回飛んでいる** ことがわかりました。

原因は、1 つ目のクエリ (ユーザー) の結果が出る前に、2 つ目のクエリ (プロジェクト) が `userId` の無いまま実行されていることです。`main.tsx` を直して、**`userId` が決まるまでプロジェクトの取得を待つ** ようにしてください。

```text
1. fetchUserByEmail('sato@example.com')  → { id: 1, name: '佐藤' }
2. fetchProjects(1)                        → [社内ポータル, 採用サイト]
   (fetchProjects(undefined) は 1 回も呼ばない)
```

存在しないメールアドレスのときは、ユーザーの取得が失敗するので、`fetchProjects` は **1 回も呼ばれない** のが正しい動きです。
