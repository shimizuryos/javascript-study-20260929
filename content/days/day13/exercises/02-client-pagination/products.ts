export type Product = { id: number; name: string; price: number };

export const PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `商品${i + 1}`,
  price: (i + 1) * 100,
}));
