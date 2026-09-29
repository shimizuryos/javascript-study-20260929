'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type Category } from './api';

export function ProductList({ category }: { category: Category }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['products', category], // queryFn で使う category をキーに入れる
    queryFn: () => fetchProducts(category),
  });

  if (isPending) return <p>読み込み中…</p>;
  if (isError) return <p>エラーが発生しました</p>;

  return (
    <ul>
      {data.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

export function ProductPage() {
  const [category, setCategory] = useState<Category>('book');
  return (
    <div>
      <button aria-pressed={category === 'book'} onClick={() => setCategory('book')}>
        本
      </button>
      <button aria-pressed={category === 'food'} onClick={() => setCategory('food')}>
        食品
      </button>
      <ProductList category={category} />
    </div>
  );
}
