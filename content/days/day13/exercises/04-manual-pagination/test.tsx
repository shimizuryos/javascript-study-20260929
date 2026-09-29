import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import { OrdersTable } from './main';

function renderAt(searchParams: string) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <OrdersTable />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

/** 表示中の注文番号 (各行の 1 列目) */
function orderIds() {
  const [, ...rows] = screen.getAllByRole('row');
  return rows.map((row) => within(row).getAllByRole('cell')[0].textContent);
}
const button = (name: string) => screen.getByRole('button', { name });

test('page が無いときは 1 ページ目: 「1 / 5 ページ」で、「前へ」は押せない', () => {
  renderAt('');
  expect(orderIds()[0]).toBe('#1');
  expect(screen.getByText('1 / 5 ページ')).toBeInTheDocument();
  expect(button('前へ')).toBeDisabled();
});

test('?page=3 なら 3 ページ目 (#21〜#30)', () => {
  renderAt('?page=3');
  expect(orderIds()[0]).toBe('#21');
  expect(screen.getByText('3 / 5 ページ')).toBeInTheDocument();
});

test('「次へ」で 1 ページずつ進み、URL が ?page=2 になる', async () => {
  const onUrlUpdate = renderAt('');
  await userEvent.click(button('次へ'));
  expect(screen.getByText('2 / 5 ページ')).toBeInTheDocument();
  expect(orderIds()[0]).toBe('#11');
  await waitFor(() => expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?page=2'));
});

test('最後のページ (?page=5) は 7 件で、「次へ」は押せない', () => {
  renderAt('?page=5');
  expect(orderIds()).toEqual(['#41', '#42', '#43', '#44', '#45', '#46', '#47']);
  expect(button('次へ')).toBeDisabled();
});

test('2 ページ目で「前へ」を押すと、URL から page が消える', async () => {
  const onUrlUpdate = renderAt('?page=2');
  await userEvent.click(button('前へ'));
  expect(screen.getByText('1 / 5 ページ')).toBeInTheDocument();
  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.has('page')).toBe(false);
});
