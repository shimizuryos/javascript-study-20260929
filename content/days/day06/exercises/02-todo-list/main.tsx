import { useState } from 'react';

export type Todo = { id: number; text: string; done: boolean };

export function addTodo(todos: Todo[], text: string): Todo[] {
  const id = Math.max(0, ...todos.map((t) => t.id)) + 1;
  return [...todos, { id, text, done: false }];
}

export function toggleTodo(todos: Todo[], id: number): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
  return todos.filter((t) => t.id !== id);
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
      <input aria-label="新しいタスク" value={text} onChange={(e) => setText(e.target.value)} />
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
