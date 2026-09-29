import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList, type Task } from './main';

const milk: Task = { id: 1, title: '牛乳' };
const bread: Task = { id: 2, title: 'パン' };
const egg: Task = { id: 3, title: '卵' };

test('タスクが順番に表示される', () => {
  render(<TaskList tasks={[milk, bread]} />);
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveTextContent('牛乳');
  expect(items[1]).toHaveTextContent('パン');
});

test('先頭にタスクが追加されても、メモは元のタスクの行に残る', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<TaskList tasks={[milk, bread]} />);
  await user.type(screen.getByLabelText('牛乳 のメモ'), '2本');

  rerender(<TaskList tasks={[egg, milk, bread]} />);

  expect(screen.getByLabelText('牛乳 のメモ')).toHaveValue('2本');
  expect(screen.getByLabelText('卵 のメモ')).toHaveValue('');
});

test('先頭のタスクが削除されても、残ったタスクのメモは消えない', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<TaskList tasks={[milk, bread]} />);
  await user.type(screen.getByLabelText('パン のメモ'), '食パン');

  rerender(<TaskList tasks={[bread]} />);

  expect(screen.getByLabelText('パン のメモ')).toHaveValue('食パン');
});

test('並べ替えても、メモはそれぞれのタスクに付いていく', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<TaskList tasks={[milk, bread]} />);
  await user.type(screen.getByLabelText('牛乳 のメモ'), '低脂肪');

  rerender(<TaskList tasks={[bread, milk]} />);

  expect(screen.getByLabelText('牛乳 のメモ')).toHaveValue('低脂肪');
  expect(screen.getByLabelText('パン のメモ')).toHaveValue('');
});
