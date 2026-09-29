import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './main';

const countText = () => screen.getByText(/^カウント:/);
const button = (name: string) => screen.getByRole('button', { name });

test('最初は initial の値 (省略時は 0) が表示される', () => {
  render(<Counter initial={5} />);
  expect(countText()).toHaveTextContent('カウント: 5');
});

test('+1 を 2 回押すと 2 になる', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  expect(countText()).toHaveTextContent('カウント: 0');
  await user.click(button('+1'));
  await user.click(button('+1'));
  expect(countText()).toHaveTextContent('カウント: 2');
});

test('+3 を押すと 3 増える', async () => {
  const user = userEvent.setup();
  render(<Counter initial={1} />);
  await user.click(button('+3'));
  expect(countText()).toHaveTextContent('カウント: 4');
});

test('-1 で 1 減り、0 のときは押せない', async () => {
  const user = userEvent.setup();
  render(<Counter initial={1} />);
  expect(button('-1')).toBeEnabled();
  await user.click(button('-1'));
  expect(countText()).toHaveTextContent('カウント: 0');
  expect(button('-1')).toBeDisabled();
});

test('リセットで initial に戻る', async () => {
  const user = userEvent.setup();
  render(<Counter initial={2} />);
  await user.click(button('+3'));
  await user.click(button('リセット'));
  expect(countText()).toHaveTextContent('カウント: 2');
});
