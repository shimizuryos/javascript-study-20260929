import { render, screen, within } from '@testing-library/react';
import { CartBadge, ProductList, type Product } from './main';

const products: Product[] = [
  { id: 'p1', name: 'りんご', price: 120, stock: 5 },
  { id: 'p2', name: 'みかん', price: 80, stock: 0 },
  { id: 'p3', name: 'ぶどう', price: 400, stock: 1 },
];

test('商品が 1 つずつ <li> で、配列の順番どおりに表示される', () => {
  render(<ProductList products={products} />);
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent('りんご: 120円');
  expect(items[2]).toHaveTextContent('ぶどう: 400円');
});

test('在庫 0 の商品にだけ「売り切れ」が付く', () => {
  render(<ProductList products={products} />);
  const items = screen.getAllByRole('listitem');
  expect(within(items[1]).getByText('売り切れ')).toHaveAttribute('class', 'sold-out');
  expect(within(items[0]).queryByText('売り切れ')).toBeNull();
  expect(within(items[2]).queryByText('売り切れ')).toBeNull();
});

test('空配列なら「商品がありません」だけが表示され、<ul> は出ない', () => {
  render(<ProductList products={[]} />);
  expect(screen.getByText('商品がありません')).toBeInTheDocument();
  expect(screen.queryByRole('list')).toBeNull();
});

test('CartBadge: 個数を span.badge に表示する', () => {
  render(<CartBadge count={3} />);
  expect(screen.getByText('3')).toHaveAttribute('class', 'badge');
});

test('CartBadge: 0 個のときは何も表示しない (「0」も出さない)', () => {
  const { container } = render(<CartBadge count={0} />);
  expect(container.textContent).toBe('');
});
