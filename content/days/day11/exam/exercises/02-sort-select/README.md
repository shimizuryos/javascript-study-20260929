---
title: 他のクエリを残して並び順を変える
hints:
  - "今の並び順は `searchParams.get('sort') ?? 'new'` で読めます (キーが無いと `null`)。"
  - "`useSearchParams()` の値は読み取り専用です。`const params = new URLSearchParams(searchParams);` でコピーしてから `set` / `delete` します。"
  - "移動先は `` `${pathname}?${params.toString()}` `` です。`usePathname()` で今のパスを取れます。"
---

商品一覧の「並び順」セレクトボックス `SortSelect` を完成させてください (Client Component です)。

- 今の並び順を URL の `sort` から読んで、`<select>` の値にする (無ければ `'new'`)
- 並び順を選んだら `router.push` で URL を変える。このとき
  - **パス (`/products`) と、他のクエリ (`q` など) はそのまま残す**
  - `sort` を新しい値にする
  - `page` は消す (並び順が変わったら 1 ページ目から)

```text
今の URL:  /products?q=shoe&page=3&sort=new
「価格順」を選ぶ
新しい URL: /products?q=shoe&sort=price
```

テストでは `next/navigation` の代わりにメモリ上で動くモックを使います。`mockRouter.setUrl('/products?q=shoe')` で最初の URL を決め、`mockRouter.url` で今の URL を確かめます。
