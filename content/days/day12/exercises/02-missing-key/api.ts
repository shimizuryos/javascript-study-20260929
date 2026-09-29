export type Category = 'book' | 'food';
export type Product = { id: number; name: string; category: Category };

const PRODUCTS: Product[] = [
  { id: 1, name: 'TypeScript 入門', category: 'book' },
  { id: 2, name: 'りんご', category: 'food' },
  { id: 3, name: 'React の本', category: 'book' },
  { id: 4, name: 'コーヒー豆', category: 'food' },
];

/** fetchProducts が呼ばれた記録 (テストで使う) */
export const calls: Category[] = [];

/** 疑似 API: 少し待ってから、カテゴリの商品を返す */
export async function fetchProducts(category: Category): Promise<Product[]> {
  calls.push(category);
  await new Promise((resolve) => setTimeout(resolve, 10));
  return PRODUCTS.filter((p) => p.category === category);
}
