export type Product = { id: string; name: string; price: number; stock: number };

export function ProductList({ products }: { products: Product[] }) {
  // TODO: 空なら「商品がありません」だけを表示する
  // TODO: products.map で <li> を並べる (key は id)。在庫 0 なら「売り切れ」を付ける
  return <ul></ul>;
}

export function CartBadge({ count }: { count: number }) {
  // 0 個のときは何も表示しない (つもり)
  return <>{count && <span className="badge">{count}</span>}</>;
}
