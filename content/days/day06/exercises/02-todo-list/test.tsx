import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addTodo, removeTodo, TodoApp, toggleTodo, type Todo } from './main';

const sample = (): Todo[] => [
  { id: 1, text: '牛乳', done: false },
  { id: 5, text: 'パン', done: true },
];

test('addTodo: 末尾に id = 最大 + 1 の todo を足した新しい配列を返し、元の配列は変えない', () => {
  const todos = sample();
  const result = addTodo(todos, '卵');
  expect(result).toEqual([...sample(), { id: 6, text: '卵', done: false }]);
  expect(todos).toEqual(sample());
  expect(addTodo([], '最初')).toEqual([{ id: 1, text: '最初', done: false }]);
});

test('toggleTodo: 対象だけ新しいオブジェクトにし、ほかはそのまま使い回す', () => {
  const todos = sample();
  const result = toggleTodo(todos, 1);
  expect(result).toEqual([
    { id: 1, text: '牛乳', done: true },
    { id: 5, text: 'パン', done: true },
  ]);
  expect(result).not.toBe(todos);
  expect(todos[0].done).toBe(false); // 元のオブジェクトは変わらない
  expect(result[1]).toBe(todos[1]); // 変更していない要素は同じ参照
});

test('removeTodo: 対象を取り除いた新しい配列を返し、元の配列は変えない', () => {
  const todos = sample();
  expect(removeTodo(todos, 1)).toEqual([{ id: 5, text: 'パン', done: true }]);
  expect(todos).toHaveLength(2);
});

test('TodoApp: 入力して「追加」を押すとタスクが増え、入力欄が空になる', async () => {
  const user = userEvent.setup();
  render(<TodoApp />);
  const input = screen.getByLabelText('新しいタスク');
  await user.type(input, '牛乳を買う');
  expect(input).toHaveValue('牛乳を買う');
  await user.click(screen.getByRole('button', { name: '追加' }));
  expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).not.toBeChecked();
  expect(input).toHaveValue('');
  expect(screen.getByText('残り 1 件')).toBeInTheDocument();
});

test('TodoApp: 空白だけでは追加されない', async () => {
  const user = userEvent.setup();
  render(<TodoApp />);
  await user.type(screen.getByLabelText('新しいタスク'), '   ');
  await user.click(screen.getByRole('button', { name: '追加' }));
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);
});

test('TodoApp: チェックで完了を切り替え、削除ボタンで消せる', async () => {
  const user = userEvent.setup();
  render(<TodoApp initialTodos={sample()} />);
  expect(screen.getByText('残り 1 件')).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: '牛乳' }));
  expect(screen.getByRole('checkbox', { name: '牛乳' })).toBeChecked();
  expect(screen.getByText('残り 0 件')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'パン を削除' }));
  expect(screen.queryByText('パン')).toBeNull();
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});
