---
title: リストと条件付きレンダー
hints:
  - "空配列のときは、`if (products.length === 0) return <p>商品がありません</p>;` のように **早期 return** するのが読みやすい書き方です。"
  - "`products.map((product) => <li key={product.id}>...</li>)` で配列を `<li>` の配列に変換します。key は位置 (index) ではなく `id` にします。"
  - "`CartBadge` は `{count && ...}` のままだと、`count` が 0 のとき `0` が表示されます。`count > 0 && ...` や三項演算子で書き直しましょう。"
---

商品一覧とカートのバッジを作ります。

### 1. `ProductList({ products })`

```ts
type Product = { id: string; name: string; price: number; stock: number };
```

- `products` が空なら `<p>商品がありません</p>` **だけ** を表示する (`<ul>` は出さない)
- それ以外は `<ul>` の中に 1 商品 1 つの `<li>` を並べる。`key` には `id` を使う
- `<li>` の中身は `りんご: 120円` の形。在庫 (`stock`) が 0 の商品だけ、後ろに `<span className="sold-out">売り切れ</span>` を付ける

```tsx
<ProductList
  products={[
    { id: 'p1', name: 'りんご', price: 120, stock: 5 },
    { id: 'p2', name: 'みかん', price: 80, stock: 0 },
  ]}
/>
// → <ul>
//     <li>りんご: 120円</li>
//     <li>みかん: 80円<span class="sold-out">売り切れ</span></li>
//   </ul>
```

### 2. `CartBadge({ count })` (バグあり)

カートの中身の数を `<span className="badge">3</span>` のように表示します。**0 個のときは何も表示しない** 仕様ですが、今のコードには 0 のときに「0」と表示されてしまうバグがあります。直してください。

key を付け忘れると「ログ」に React の警告 (`Each child in a list should have a unique "key" prop.`) が出るので、それも確認してみましょう。
