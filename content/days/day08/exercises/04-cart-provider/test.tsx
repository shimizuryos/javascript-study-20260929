import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './main';

function AddButton({ item }: { item: string }) {
  const { add } = useCart();
  return <button onClick={() => add(item)}>{item} を追加</button>;
}

function CartSummary() {
  const { items, remove } = useCart();
  return (
    <div>
      <p>カート: {items.length} 件</p>
      {items.map((item) => (
        <button key={item} onClick={() => remove(item)}>
          {item} を削除
        </button>
      ))}
    </div>
  );
}

test('別々のコンポーネントから、同じカートを読み書きできる', async () => {
  const user = userEvent.setup();
  render(
    <CartProvider>
      <AddButton item="りんご" />
      <AddButton item="みかん" />
      <CartSummary />
    </CartProvider>,
  );
  expect(screen.getByText('カート: 0 件')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'りんご を追加' }));
  await user.click(screen.getByRole('button', { name: 'みかん を追加' }));
  await user.click(screen.getByRole('button', { name: 'りんご を追加' }));
  expect(screen.getByText('カート: 2 件')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'りんご を削除' }));
  expect(screen.getByText('カート: 1 件')).toBeInTheDocument();
});

test('add / remove は再レンダーしても同じ関数のまま', () => {
  const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
  const first = result.current;
  act(() => result.current.add('りんご'));
  expect(result.current.items).toEqual(['りんご']);
  expect(result.current.add).toBe(first.add);
  expect(result.current.remove).toBe(first.remove);
});

test('items が変わらない再レンダーでは、useCart() は同じオブジェクトを返す', () => {
  const { result, rerender } = renderHook(() => useCart(), { wrapper: CartProvider });
  const first = result.current;
  rerender();
  expect(result.current).toBe(first);
});

test("Provider の外で useCart を使うと、'CartProvider' を含むエラーを投げる", () => {
  expect(() => renderHook(() => useCart())).toThrow('CartProvider');
});
