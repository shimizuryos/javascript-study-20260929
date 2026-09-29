export type Product = { id: string; name: string; price: number; stock: number };

export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) return <p>商品がありません</p>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name}: {product.price}円
          {product.stock === 0 && <span className="sold-out">売り切れ</span>}
        </li>
      ))}
    </ul>
  );
}

export function CartBadge({ count }: { count: number }) {
  return <>{count > 0 && <span className="badge">{count}</span>}</>;
}
