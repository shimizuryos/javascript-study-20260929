import { useState } from 'react';

export type Todo = { id: number; text: string; done: boolean };

export function addTodo(todos: Todo[], text: string): Todo[] {
  // TODO: 末尾に { id: 最大の id + 1, text, done: false } を足した新しい配列を返す
  return todos;
}

export function toggleTodo(todos: Todo[], id: number): Todo[] {
  // TODO: id が一致する要素の done を反転した新しい配列を返す
  return todos;
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
  // TODO: id が一致する要素を取り除いた新しい配列を返す
  return todos;
}

export function TodoApp({ initialTodos = [] }: { initialTodos?: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [text, setText] = useState('');

  const handleAdd = () => {
    const trimmed = text.trim();
    if (trimmed === '') return;
    setTodos((prev) => addTodo(prev, trimmed));
    setText('');
  };

  return (
    <div>
      {/* TODO: value と onChange で、入力欄を text の state とつなぐ */}
      <input aria-label="新しいタスク" />
      <button onClick={handleAdd}>追加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => setTodos((prev) => toggleTodo(prev, todo.id))}
              />
              {todo.text}
            </label>
            <button aria-label={`${todo.text} を削除`} onClick={() => setTodos((prev) => removeTodo(prev, todo.id))}>
              削除
            </button>
          </li>
        ))}
      </ul>
      <p>残り {todos.filter((t) => !t.done).length} 件</p>
    </div>
  );
}
