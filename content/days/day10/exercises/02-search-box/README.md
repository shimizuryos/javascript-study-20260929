---
title: 他のクエリを残したまま ?q= を更新する検索欄
hints:
  - "入力欄の初期値は `useState(searchParams.get('q') ?? '')` です (`get` は無いと `null` を返すので `??` で空文字に)。"
  - "`const params = new URLSearchParams(searchParams);` でコピーを作ってから `params.set('q', text)` / `params.delete('q')` / `params.delete('page')` を使います。`searchParams.set(...)` は読み取り専用なのでエラーになります。"
  - "最後に `` router.replace(`${pathname}?${params}`) `` で移動します。`push` だと検索のたびに履歴が増えてしまいます。"
---

一覧画面の上に置く **検索欄** を Client Component で作ります。`?q=` を書き換えますが、並び順 (`sort`) やタグ (`tags`) など **他のクエリは消さない** のがポイントです。

### 仕様

- 入力欄 (`aria-label="検索語"`) の最初の値は、今の URL の `q` (無ければ空)
- 「検索」ボタンで送信したら、URL を次のように **`router.replace`** で更新する
  - 入力が空でなければ `q` をその値にする。空 (空白だけも含む) なら `q` を URL から **消す**
  - `page` は消す (検索条件が変わったら 1 ページ目に戻すため)
  - それ以外のクエリ (`sort`、`tags` など) は **そのまま残す**
  - パス (`/products` など) は今のまま

```txt
今の URL: /products?sort=new&q=shoe&page=3
「boots」で検索 → /products?sort=new&q=boots
空で検索       → /products?sort=new
```

目標コードの `setSearch = (text) => setParams({ q: text || null, page: null })` と同じことを、`next/navigation` のフックだけで書く演習です。

テストでは `@study/next-mock` の `mockRouter` で URL を用意し、送信後の URL と履歴 (`mockRouter.history`) を確認します。
