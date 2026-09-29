import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTable } from './main';
import { PRODUCTS } from './products';

/** 表示中の商品名 (各行の 1 列目) */
function names() {
  const [, ...rows] = screen.getAllByRole('row');
  return rows.map((row) => within(row).getAllByRole('cell')[0].textContent);
}
const button = (name: string) => screen.getByRole('button', { name });

test('最初は 1 ページ目の 5 件と「1 / 3」を表示し、「前へ」は押せない', () => {
  render(<ProductTable products={PRODUCTS} />);
  expect(names()).toEqual(['商品1', '商品2', '商品3', '商品4', '商品5']);
  expect(screen.getByText('1 / 3')).toBeInTheDocument();
  expect(button('前へ')).toBeDisabled();
  expect(button('次へ')).toBeEnabled();
});

test('「次へ」で 2 ページ目に進む', async () => {
  render(<ProductTable products={PRODUCTS} />);
  await userEvent.click(button('次へ'));
  expect(names()).toEqual(['商品6', '商品7', '商品8', '商品9', '商品10']);
  expect(screen.getByText('2 / 3')).toBeInTheDocument();
  expect(button('前へ')).toBeEnabled();
});

test('最後のページは 2 件で、「次へ」は押せない', async () => {
  render(<ProductTable products={PRODUCTS} />);
  await userEvent.click(button('次へ'));
  await userEvent.click(button('次へ'));
  expect(names()).toEqual(['商品11', '商品12']);
  expect(screen.getByText('3 / 3')).toBeInTheDocument();
  expect(button('次へ')).toBeDisabled();
});

test('「前へ」で 1 つ前のページに戻る', async () => {
  render(<ProductTable products={PRODUCTS} />);
  await userEvent.click(button('次へ'));
  await userEvent.click(button('前へ'));
  expect(names()[0]).toBe('商品1');
  expect(screen.getByText('1 / 3')).toBeInTheDocument();
});
