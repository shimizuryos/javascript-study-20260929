import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './main';

const fill = async (user: ReturnType<typeof userEvent.setup>, values: { name?: string; email?: string; agree?: boolean }) => {
  if (values.name) await user.type(screen.getByLabelText('名前'), values.name);
  if (values.email) await user.type(screen.getByLabelText('メールアドレス'), values.email);
  if (values.agree) await user.click(screen.getByLabelText('利用規約に同意する'));
};

test('入力した内容が各欄に表示される', async () => {
  const user = userEvent.setup();
  render(<SignupForm onSubmit={() => {}} />);
  await fill(user, { name: 'Alice', email: 'a@example.com', agree: true });
  expect(screen.getByLabelText('名前')).toHaveValue('Alice');
  expect(screen.getByLabelText('メールアドレス')).toHaveValue('a@example.com');
  expect(screen.getByLabelText('利用規約に同意する')).toBeChecked();
});

test('条件がそろうまで「登録」は押せない', async () => {
  const user = userEvent.setup();
  render(<SignupForm onSubmit={() => {}} />);
  const submit = screen.getByRole('button', { name: '登録' });
  expect(submit).toBeDisabled();
  await fill(user, { name: 'Alice', email: 'alice' });
  expect(submit).toBeDisabled();
  await user.type(screen.getByLabelText('メールアドレス'), '@example.com');
  expect(submit).toBeDisabled();
  await user.click(screen.getByLabelText('利用規約に同意する'));
  expect(submit).toBeEnabled();
});

test('送信すると onSubmit が入力値のオブジェクトで 1 回呼ばれる', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);
  await fill(user, { name: 'Alice', email: 'alice@example.com', agree: true });
  await user.click(screen.getByRole('button', { name: '登録' }));
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com', agree: true });
});
